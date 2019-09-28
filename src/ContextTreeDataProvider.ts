import * as path from 'path';
import {
  Event,
  EventEmitter,
  StatusBarAlignment,
  StatusBarItem,
  TextDocument,
  TreeDataProvider,
  TreeItem,
  window,
  workspace,
} from 'vscode';

import KeepContext from '.';
import { ContextTreeItem } from './ContextTreeItem';
import Settings from './Settings';
import { createTask, taskInputBox } from './utils';

export class ContextTreeDataProvider implements TreeDataProvider<ContextTreeItem> {
  /**
   * Keep Context status bar item.
   */
  readonly statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);

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
    this.settings = new Settings(this.vsCodeSettings, this.refresh);
  }

  getTreeItem = (element: ContextTreeItem): TreeItem => element;

  getChildren(element?: ContextTreeItem): Thenable<ContextTreeItem[]> {
    // first level of the tree
    if (!element) {
      return Promise.resolve(Object.values(this.settings.tasks).map(ContextTreeItem.fromTask));
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

        if (this.settings.tasks[task.id]) {
          window.showErrorMessage(`A task with name "${taskName}" already exists.`);
          return;
        }

        this.settings.tasks[task.id] = task;
        this.settings.save();
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

          this.settings.save();
          this.refresh();
        }
      });
  }

  deleteTask = (task: ContextTreeItem): void => {
    if (this.settings.tasks[task.id]) {
      delete this.settings.tasks[task.id];

      this.settings.save();
      this.refresh();
    }
  }

  addFile = (document: TextDocument): void => {
    if (document.uri.scheme === 'file') {
      // TODO: add file to the context
    }
  }

  private refresh = (): void => {
    this.treeItemEventEmitter.fire();
  }
}
