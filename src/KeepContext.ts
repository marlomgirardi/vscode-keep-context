import * as fs from 'fs';
import { commands, StatusBarAlignment, StatusBarItem, Uri, window, workspace } from 'vscode';

import { ContextTreeDataProvider } from './ContextTreeDataProvider';
import { ContextTreeItem } from './ContextTreeItem';
import GitProvider from './GitProvider';
import { createTask, getAllOpenedFiles, getFilePath, taskInputBox } from './utils';
import { QuickPickTask } from './QuickPickTask';
import { clearStatusBar, updateStatusBar } from './statusbar';
import Task, { File } from './Task';
import logger from './logger';
import { state } from './global';

/**
 * Built in VS Code commands.
 * https://code.visualstudio.com/api/references/commands
 * https://code.visualstudio.com/docs/getstarted/keybindings#_basic-editing
 */
export enum BuiltInCommands {
  CloseAllEditors = 'workbench.action.closeAllEditors',
  SetEditorLayout = 'vscode.setEditorLayout',
  GetEditorLayout = 'vscode.getEditorLayout',
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

    this.treeDataProvider = new ContextTreeDataProvider();

    const activeTask = state.activeTask;
    if (activeTask) {
      const task = state.tasks[activeTask];

      if (task) {
        updateStatusBar(task.name);
      } else {
        state.activeTask = null;
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
          state.clear();
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

      const tasks = state.tasks;
      const task = createTask(taskName);
      let keepFilesOpened = false;

      task.branch = this.git.branch;

      if (tasks[task.id]) {
        window.showErrorMessage(`A task with name "${taskName}" already exists.`);
        return;
      }

      const openFiles = getAllOpenedFiles();

      if (!state.activeTask && openFiles.length > 0) {
        keepFilesOpened = await window
          .showInformationMessage('Keep files opened?', 'Yes', 'No')
          .then((selected) => selected === 'Yes');
      }

      if (keepFilesOpened) {
        task.files = openFiles;
      }

      state.addTask(task);
      this.activateTask(task.id, keepFilesOpened);
    });
  };

  /**
   * Edit task handler.
   * @param task available when using the Keep Context panel.
   */
  editTask = (task?: ContextTreeItem): void => {
    const taskId = task?.id || state.activeTask;

    if (!taskId) {
      window.showWarningMessage('You must select a task to edit.');
      return;
    }

    const selectedTask = state.getTask(taskId) as Task;

    taskInputBox(selectedTask.name, (value) => {
      const newTask = createTask(value);
      const existentTask = state.getTask(newTask.id);

      if (value !== selectedTask.name && existentTask) {
        return `A task with name "${value}" already exists.`;
      }

      return null;
    }).then((taskName) => {
      if (taskName && taskName !== selectedTask.name) {
        const newTask = createTask(taskName);

        newTask.files = [...selectedTask.files];

        state.addTask(newTask);
        state.removeTask(selectedTask);

        this.activateTask(newTask.id);
      }
    });
  };

  /**
   * Delete task handler.
   * @param task available when using the Keep Context panel.
   */
  deleteTask = (task?: ContextTreeItem): void => {
    const taskId = task?.id || state.activeTask;

    if (!taskId) {
      window.showWarningMessage('You must select a task to remove.');
      return;
    }

    if (state.tasks[taskId]) {
      if (state.activeTask === taskId) {
        state.activeTask = null;

        clearStatusBar();

        commands.executeCommand(BuiltInCommands.CloseAllEditors);

        // TODO: Ask to keep files opened or just close?
        // window.showInformationMessage('Close all opened files?', 'Yes', 'No')
        //   .then((selected) => {
        //     if (selected === 'Yes') {
        //       commands.executeCommand(BuiltInCommands.CloseAllEditors);
        //     }

        //     delete state.tasks[task.id];

        //     state.save();
        //     this.refresh();
        //   });
      }

      delete state.tasks[taskId];

      this.treeDataProvider.refresh();
    }
  };

  /**
   * Activate task handler.
   */
  activateTask = (taskId: string, keepFilesOpened = false): void => {
    if (state.activeTask !== taskId) {
      // TODO: use dirty state to prevent saving?
      state.activeTask = null;

      const task = state.getTask(taskId);

      if (!task) {
        logger.error(`Task "${taskId}" not found.`);
        return;
      }

      let promise: Thenable<void | undefined> = Promise.resolve();

      if (!keepFilesOpened) {
        promise = commands.executeCommand(BuiltInCommands.CloseAllEditors);
      }

      promise.then(async () => {
        if (task.layout) {
          await commands.executeCommand(BuiltInCommands.SetEditorLayout, task.layout);
        }

        const filesNotFound: Array<string> = [];

        state.activeTask = taskId;

        if (task.branch) {
          this.git.setBranch(task.branch);
        }

        updateStatusBar(task.name);

        if (!keepFilesOpened) {
          task.files.forEach((file, idx) => {
            const filePath = getFilePath(file);

            if (!filePath) {
              filesNotFound.push(file.relativePath);
              return;
            }

            if (!fs.existsSync(filePath)) {
              filesNotFound.push(filePath);
              return;
            }

            workspace.openTextDocument(Uri.file(filePath)).then(
              (document) => {
                // when showing multiple documents there is a concurrency problem with the returned TextEditor
                // https://github.com/microsoft/vscode/issues/145969#issuecomment-1077788421
                setTimeout(() => {
                  window
                    .showTextDocument(document, {
                      viewColumn: file.viewColumn,
                      preview: false,
                      preserveFocus: true,
                    })
                    .then(undefined, (e) =>
                      logger.error(`Error showing file "${file.relativePath}" from "${file.workspaceFolder}"`, e),
                    );
                }, 80 * idx);
              },
              (e) => logger.error(`Error opening file "${file.relativePath}" from "${file.workspaceFolder}"`, e),
            );
          });

          if (filesNotFound.length > 0) {
            task.files = task.files.filter((file) => !filesNotFound.includes(getFilePath(file) as string));
            window.showWarningMessage(`Some files were not found in the file system:\n${filesNotFound.join('\n')}`);
          }
        }

        this.treeDataProvider.refresh();
      });
    }
  };

  isTaskActive(): boolean {
    return Boolean(state.activeTask && state.getTask(state.activeTask));
  }

  selectTask = (): void => {
    const input = window.createQuickPick<QuickPickTask>();

    input.placeholder = 'Select a task to activate';
    input.items = Object.values(state.tasks).map(QuickPickTask.fromTask);

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

  updateFileList = (files: File[]): void => {
    if (!state.activeTask) return;

    const task = state.getTask(state.activeTask);

    if (!task) return;

    task.files = files;

    state.updateTask(task);
    this.treeDataProvider.refresh();
  };

  updateLayout = async () => {
    if (!state.activeTask) return;

    const task = state.getTask(state.activeTask);
    if (!task) return;

    task.layout = await commands.executeCommand(BuiltInCommands.GetEditorLayout);

    state.updateTask(task);
  };

  /**
   * Handles the branch change.
   * @param branch The new branch
   */
  private onBranchChange = (branch?: string) => {
    if (state.activeTask) {
      state.tasks[state.activeTask].branch = branch;
    }
  };

  /**
   * Handles the Git Initialization
   */
  private onGitInitialize = () => {
    if (state.activeTask) {
      const task = state.tasks[state.activeTask];
      if (task.branch) {
        this.git.setBranch(task.branch);
      } else {
        state.tasks[state.activeTask].branch = this.git.branch;
      }
    }
  };
}
