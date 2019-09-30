import * as path from 'path';
import {
  commands,
  Event,
  EventEmitter,
  StatusBarAlignment,
  StatusBarItem,
  TextDocument,
  TreeDataProvider,
  TreeItem,
  Uri,
  ViewColumn,
  window,
  workspace,
} from 'vscode';

import KeepContext from '.';
import { ContextTreeItem } from './ContextTreeItem';
import Settings from './Settings';
import { createTask, taskInputBox } from './utils';

/**
 * Built in VS Code commands.
 * https://code.visualstudio.com/api/references/commands
 * https://code.visualstudio.com/docs/getstarted/keybindings#_basic-editing
 */
export enum BuiltInCommands {
  CloseAllEditors = 'workbench.action.closeAllEditors',
}

export class ContextTreeDataProvider implements TreeDataProvider<ContextTreeItem> {

  /**
   * Keep Context status bar item.
   */
  readonly statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);

  /**
   * Make VS Code listen to our event emitter
   */
  readonly onDidChangeTreeData: Event<ContextTreeItem>;

  /**
   * Manage ContextTreeItem events.
   */
  private treeItemEventEmitter: EventEmitter<ContextTreeItem>;

  /**
   * The path of **.vscode** in the workspace.
   */
  private vsCodeSettings?: string;

  /**
   * Keep Context settings management
   */
  private settings: Settings;

  constructor() {
    if (!workspace.workspaceFolders) {
      throw new Error('A workspace is required to run Keep Context.');
    }

    this.treeItemEventEmitter = new EventEmitter<ContextTreeItem>();
    this.onDidChangeTreeData = this.treeItemEventEmitter.event;

    this.vsCodeSettings = path.join(workspace.workspaceFolders[0].uri.fsPath, '.vscode');
    this.settings = new Settings(this.vsCodeSettings);

    if (this.settings.activeTask) {
      const task = this.settings.tasks[this.settings.activeTask];
      this.updateStatusBar(task.name);
    }
  }

  getTreeItem = (element: ContextTreeItem): TreeItem => element;

  getChildren(element?: ContextTreeItem): Thenable<ContextTreeItem[]> {
    // first level of the tree
    if (!element) {
      return Promise.resolve(ContextTreeItem.fromSettings(this.settings));
    }

    return Promise.resolve([]);
  }

  /**
   * New task handler.
   */
  newTask = (): void => {
    taskInputBox()
      .then((taskName) => {
        if (!taskName) {
          return;
        }

        const task = createTask(taskName);

        // TODO: Add opened files to the current task?

        if (this.settings.tasks[task.id]) {
          window.showErrorMessage(`A task with name "${taskName}" already exists.`);
          return;
        }

        this.settings.tasks[task.id] = task;
        this.activateTask(task.id);
      });
  }

  /**
   * Edit task handler.
   */
  editTask = (task: ContextTreeItem): void => {
    taskInputBox(task.label, (value) => {
      const newTask = createTask(value);

      if (value !== task.label && this.settings.tasks[newTask.id]) {
        return `A task with name "${value}" already exists.`;
      }

      return null;
    })
      .then((taskName) => {
        if (taskName && taskName !== task.label) {
          const newTask = createTask(taskName);

          newTask.files = [...this.settings.tasks[task.id].files];

          this.settings.tasks[newTask.id] = newTask;
          delete this.settings.tasks[task.id];

          // TODO: Do we really need sort?
          this.settings.tasks = Object.keys(this.settings.tasks)
            .sort()
            .reduce((tasks: { [id: string]: KeepContext.Task }, taskId: string) => {
              tasks[taskId] = this.settings.tasks[taskId];
              return tasks;
            }, {});

          this.activateTask(newTask.id);
        }
      });
  }

  /**
   * Delete task handler.
   */
  deleteTask = (task: ContextTreeItem): void => {
    if (this.settings.tasks[task.id]) {
      if (this.settings.activeTask === task.id) {
        this.settings.activeTask = null;

        // TODO: Ask to keep files opened or just close?
        // window.showInformationMessage('Close all opened files?', 'Yes', 'No')
        //   .then((selected) => {
        //     if (selected === 'Yes') {
        //       commands.executeCommand(BuiltInCommands.CloseAllEditors);
        //     }

        //     delete this.settings.tasks[task.id];

        //     this.settings.save();
        //     this.refresh();
        //   });
      }

      delete this.settings.tasks[task.id];

      this.settings.save();
      this.refresh();
    }
  }

  /**
   * Activate task handler.
   */
  activateTask = (taskId: string): void => {
    if (this.settings.activeTask !== taskId) {
      // TODO: use dirty state to prevent saving?
      this.settings.activeTask = null;

      commands.executeCommand(BuiltInCommands.CloseAllEditors)
        .then(() => {
          this.settings.activeTask = taskId;
          this.settings.save();
          this.refresh();

          const task = this.settings.tasks[taskId];

          this.updateStatusBar(task.name);

          task.files
            .map(Uri.file)
            .map((file) => {
              window.showTextDocument(file, { viewColumn: ViewColumn.Active, preview: false });
            });
        });
    }
  }

  /**
   * Show new text in the status bar.
   * @param text Status bar item text
   */
  updateStatusBar(text: string) {
    this.statusBarItem.text = '$(tasklist) ' + text;
    this.statusBarItem.show();
  }

  /**
   * Add file to the activated task
   */
  addFile = (document: TextDocument): void => {
    const activeTask = this.settings.activeTask;
    let fileName;

    if (document.uri.scheme === 'file') {
      fileName = document.fileName;
    }

    if (document.uri.scheme === 'git') {
      fileName = document.fileName.replace(/\.git$/, '');
    }

    if (fileName && activeTask !== null && this.settings.tasks[activeTask]) {
      const task = this.settings.tasks[activeTask];

      if (!task.files.includes(fileName)) {
        task.files.push(fileName);
        this.settings.save();
        this.refresh();
      }
    }
  }

  /**
   * Remove file from the activated task
   */
  removeFile = (document: TextDocument): void => {
    const activeTask = this.settings.activeTask;

    if (document.uri.scheme === 'file' && activeTask !== null && this.settings.tasks[activeTask]) {
      const fileName = document.fileName;
      const task = this.settings.tasks[activeTask];
      task.files = task.files.filter((file: string) => file !== fileName);

      this.settings.save();
      this.refresh();
    }
  }

  private refresh = (): void => {
    this.treeItemEventEmitter.fire();
  }
}
