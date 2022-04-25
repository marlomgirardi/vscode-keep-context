import * as fs from 'fs';
import { commands, StatusBarAlignment, StatusBarItem, Uri, ViewColumn, window, workspace } from 'vscode';

import { ContextTreeDataProvider } from './ContextTreeDataProvider';
import { ContextTreeItem } from './ContextTreeItem';
import GitProvider from './GitProvider';
import { createTask, getAllOpenedFiles, taskInputBox } from './utils';
import State from './State';
import { QuickPickTask } from './QuickPickTask';
import { clearStatusBar, updateStatusBar } from './statusbar';
import Task, { File } from './Task';
import logger from './logger';

/**
 * Built in VS Code commands.
 * https://code.visualstudio.com/api/references/commands
 * https://code.visualstudio.com/docs/getstarted/keybindings#_basic-editing
 */
export enum BuiltInCommands {
  CloseAllEditors = 'workbench.action.closeAllEditors',
  SetEditorLayout = 'vscode.setEditorLayout',
}

/**
 * KeepContext
 *
 * This class is our main class.
 * It is responsible by managing the status bar and the commands.
 */
export default class KeepContext {
  treeDataProvider: ContextTreeDataProvider;

  /**
   * Keep Context status bar item.
   */
  readonly statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);

  /**
   * Keep Context state management.
   */
  private state: State;

  /**
   * Git provider.
   */
  private git: GitProvider;

  constructor() {
    if (!workspace.workspaceFolders) {
      throw new Error('A workspace is required to run Keep Context.');
    }

    this.git = new GitProvider();
    this.git.onDidChangeBranch = this.onBranchChange;
    this.git.onDidInitialize = this.onGitInitialize;

    this.state = State.getInstance();
    this.treeDataProvider = new ContextTreeDataProvider();

    const activeTask = this.state.activeTask;
    if (activeTask) {
      const task = this.state.tasks[activeTask];

      if (task) {
        updateStatusBar(task.name);
      } else {
        this.state.activeTask = null;
        this.treeDataProvider.refresh();
      }
    }
  }

  /**
   * Clear keep context state
   */
  clearState = (): void => {
    window
      .showInformationMessage(
        'All tasks will be removed forever, are you sure you want to clean the state?',
        'Yes',
        'No',
      )
      .then((selected) => {
        if (selected === 'Yes') {
          this.state.clear();
          this.treeDataProvider.refresh();
        }
      });
  };

  /**
   * New task handler.
   */
  newTask = (): void => {
    taskInputBox().then(async (taskName) => {
      if (!taskName) {
        return;
      }

      const tasks = this.state.tasks;
      const task = createTask(taskName);
      let keepFilesOpened = false;

      task.branch = this.git.branch;

      if (tasks[task.id]) {
        window.showErrorMessage(`A task with name "${taskName}" already exists.`);
        return;
      }

      const fileNames = getAllOpenedFiles();
      // const files = workspace.textDocuments.filter((doc) => doc.uri.scheme === 'file');

      if (!this.state.activeTask && fileNames.length > 0) {
        keepFilesOpened = await window
          .showInformationMessage('Keep files opened?', 'Yes', 'No')
          .then((selected) => selected === 'Yes');
      }

      if (keepFilesOpened) {
        task.files = fileNames;
        // task.files = files.map<File>((doc) => ({
        //   path: doc.uri.fsPath,
        //   viewColumn: window.activeTextEditor?.viewColumn ?? ViewColumn.Active,
        // }));
      }

      this.state.addTask(task);
      this.activateTask(task.id, keepFilesOpened);
    });
  };

  /**
   * Edit task handler.
   * @param task available when using the Keep Context panel.
   */
  editTask = (task?: ContextTreeItem): void => {
    const taskId = task?.id || this.state.activeTask;

    if (!taskId) {
      window.showWarningMessage('You must select a task to edit.');
      return;
    }

    const selectedTask = this.state.getTask(taskId) as Task;

    taskInputBox(selectedTask.name, (value) => {
      const newTask = createTask(value);
      const existentTask = this.state.getTask(newTask.id);

      if (value !== selectedTask.name && existentTask) {
        return `A task with name "${value}" already exists.`;
      }

      return null;
    }).then((taskName) => {
      if (taskName && taskName !== selectedTask.name) {
        const newTask = createTask(taskName);

        newTask.files = [...selectedTask.files];

        this.state.addTask(newTask);
        this.state.removeTask(selectedTask);

        this.activateTask(newTask.id);
      }
    });
  };

  /**
   * Delete task handler.
   * @param task available when using the Keep Context panel.
   */
  deleteTask = (task?: ContextTreeItem): void => {
    const taskId = task?.id || this.state.activeTask;

    if (!taskId) {
      window.showWarningMessage('You must select a task to remove.');
      return;
    }

    if (this.state.tasks[taskId]) {
      if (this.state.activeTask === taskId) {
        this.state.activeTask = null;

        clearStatusBar();

        commands.executeCommand(BuiltInCommands.CloseAllEditors);

        // TODO: Ask to keep files opened or just close?
        // window.showInformationMessage('Close all opened files?', 'Yes', 'No')
        //   .then((selected) => {
        //     if (selected === 'Yes') {
        //       commands.executeCommand(BuiltInCommands.CloseAllEditors);
        //     }

        //     delete this.state.tasks[task.id];

        //     this.state.save();
        //     this.refresh();
        //   });
      }

      delete this.state.tasks[taskId];

      this.treeDataProvider.refresh();
    }
  };

  /**
   * Activate task handler.
   */
  activateTask = (taskId: string, keepFilesOpened = false): void => {
    if (this.state.activeTask !== taskId) {
      // TODO: use dirty state to prevent saving?
      this.state.activeTask = null;

      let promise: Thenable<void | undefined> = Promise.resolve();

      if (!keepFilesOpened) {
        promise = commands.executeCommand(BuiltInCommands.CloseAllEditors);
      }

      promise.then(() => {
        const task = this.state.getTask(taskId);
        const filesNotFound: Array<string> = [];

        if (!task) {
          logger.error(`Task "${taskId}" not found.`);
          return;
        }

        this.state.activeTask = taskId;

        if (task.branch) {
          this.git.setBranch(task.branch);
        }

        updateStatusBar(task.name);

        if (!keepFilesOpened) {
          task.files
            .filter((file) => {
              // const hasFile = fs.existsSync(file.path);
              // if (!hasFile) filesNotFound.push(file.path);
              const hasFile = fs.existsSync(file);
              if (!hasFile) filesNotFound.push(file);
              return hasFile;
            })
            .map(Uri.file)
            .forEach((file, idx) => {
              workspace.openTextDocument(file).then(
                (document) => {
                  // when showing multiple documents there is a concurrency problem with the returned TextEditor
                  // https://github.com/microsoft/vscode/issues/145969#issuecomment-1077788421
                  setTimeout(() => {
                    window
                      .showTextDocument(document, {
                        viewColumn: ViewColumn.Active,
                        preview: false,
                        preserveFocus: true,
                      })
                      .then(undefined, (e) => logger.error(`Error showing file "${file.path}"`, e));
                  }, 80 * idx);
                },
                (e) => logger.error(`Error opening file "${file.path}"`, e),
              );
            });

          if (filesNotFound.length > 0) {
            task.files = task.files.filter((file) => !filesNotFound.includes(file));
            window.showWarningMessage(`Some files were not found in the file system:\n${filesNotFound.join('\n')}`);
          }
        }

        this.treeDataProvider.refresh();
      });
    }
  };

  isTaskActive(): boolean {
    return Boolean(this.state.activeTask && this.state.getTask(this.state.activeTask));
  }

  selectTask = (): void => {
    const input = window.createQuickPick<QuickPickTask>();

    input.placeholder = 'Select a task to activate';
    input.items = Object.values(this.state.tasks).map(QuickPickTask.fromTask);

    if (input.items.length === 0) {
      window.showWarningMessage('No task is available for selection');
      input.dispose();
      return;
    }

    input.show();

    input.onDidChangeSelection((quickPickTask) => {
      this.activateTask(quickPickTask[0].id);
      input.hide();
    });
    input.onDidHide(() => {
      input.dispose();
    });
  };

  updateFileList = (files: string[]): void => {
    if (!this.state.activeTask) return;

    const task = this.state.getTask(this.state.activeTask);

    if (!task) return;

    task.files = files;

    // if (!task.files.find((file) => file.path === fileName)) {
    //   task.files.push({
    //     path: fileName,
    //     viewColumn: window.activeTextEditor?.viewColumn ?? ViewColumn.Active,
    //   });
    //   this.state.updateTask(task);
    //   this.treeDataProvider.refresh();
    // }

    this.state.updateTask(task);
    this.treeDataProvider.refresh();
  };

  /**
   * Handles the branch change.
   * @param branch The new branch
   */
  private onBranchChange = (branch?: string) => {
    if (this.state.activeTask) {
      this.state.tasks[this.state.activeTask].branch = branch;
    }
  };

  /**
   * Handles the Git Initialization
   */
  private onGitInitialize = () => {
    if (this.state.activeTask) {
      const task = this.state.tasks[this.state.activeTask];
      if (task.branch) {
        this.git.setBranch(task.branch);
      } else {
        this.state.tasks[this.state.activeTask].branch = this.git.branch;
      }
    }
  };
}
