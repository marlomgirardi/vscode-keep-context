import * as fs from "fs";
import {
  commands,
  ExtensionContext,
  StatusBarAlignment,
  StatusBarItem,
  TextDocument,
  Uri,
  ViewColumn,
  window,
  workspace,
} from "vscode";

import { ContextTreeDataProvider } from "./ContextTreeDataProvider";
import { ContextTreeItem } from "./ContextTreeItem";
import GitProvider from "./GitProvider";
import { createTask, getRealFileName, taskInputBox } from "./utils";
import State from "./State";

/**
 * Built in VS Code commands.
 * https://code.visualstudio.com/api/references/commands
 * https://code.visualstudio.com/docs/getstarted/keybindings#_basic-editing
 */
export enum BuiltInCommands {
  CloseAllEditors = "workbench.action.closeAllEditors",
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

  constructor(readonly context: ExtensionContext) {
    if (!workspace.workspaceFolders) {
      throw new Error("A workspace is required to run Keep Context.");
    }

    this.git = new GitProvider();
    this.git.onDidChangeBranch = this.onBranchChange;
    this.git.onDidInitialize = this.onGitInitialize;

    this.state = new State(context.workspaceState);
    this.treeDataProvider = new ContextTreeDataProvider(this.state);

    if (this.state.activeTask) {
      const task = this.state.tasks[this.state.activeTask];

      if (task) {
        this.updateStatusBar(task.name);
      } else {
        this.state.activeTask = null;
        this.treeDataProvider.refresh();
      }
    }
  }

  /**
   * New task handler.
   */
  newTask = (): void => {
    taskInputBox().then((taskName) => {
      if (!taskName) {
        return;
      }

      const task = createTask(taskName);

      task.branch = this.git.branch;

      // TODO: Add opened files to the current task?

      if (this.state.tasks[task.id]) {
        window.showErrorMessage(`A task with name "${taskName}" already exists.`);
        return;
      }

      this.state.tasks = {
        ...this.state.tasks,
        [task.id]: task,
      };

      this.activateTask(task.id);
    });
  };

  /**
   * Edit task handler.
   * @param task available when using the Keep Context panel.
   */
  editTask = (task?: ContextTreeItem): void => {
    const taskId = task?.id || this.state.activeTask;

    if (!taskId) {
      window.showWarningMessage("You must select a task to edit.");
      return;
    }

    const selectedTask = this.state.tasks[taskId];

    taskInputBox(selectedTask.name, (value) => {
      const newTask = createTask(value);

      if (value !== selectedTask.name && this.state.tasks[newTask.id]) {
        return `A task with name "${value}" already exists.`;
      }

      return null;
    }).then((taskName) => {
      if (taskName && taskName !== selectedTask.name) {
        const newTask = createTask(taskName);

        newTask.files = [...selectedTask.files];

        this.state.tasks[newTask.id] = newTask;
        delete this.state.tasks[selectedTask.id];

        // TODO: Do we really need sort?
        // If yes, a better one should be used.
        // this.state.tasks = Object.keys(this.state.tasks)
        //   .sort()
        //   .reduce((tasks: { [id: string]: KeepContext.Task }, taskId: string) => {
        //     tasks[taskId] = this.state.tasks[taskId];
        //     return tasks;
        //   }, {});

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
      window.showWarningMessage("You must select a task to remove.");
      return;
    }

    if (this.state.tasks[taskId]) {
      if (this.state.activeTask === taskId) {
        this.state.activeTask = null;

        this.updateStatusBar();

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
  activateTask = (taskId: string): void => {
    if (this.state.activeTask !== taskId) {
      // TODO: use dirty state to prevent saving?
      this.state.activeTask = null;

      commands.executeCommand(BuiltInCommands.CloseAllEditors).then(() => {
        this.state.activeTask = taskId;

        const filesNotFound: Array<string> = [];
        const task = this.state.tasks[taskId];

        if (task.branch) {
          this.git.setBranch(task.branch);
        }

        this.updateStatusBar(task.name);

        task.files
          .filter((file) => {
            const hasFile = fs.existsSync(file);
            if (!hasFile) filesNotFound.push(file);
            return hasFile;
          })
          .map(Uri.file)
          .forEach((file) =>
            window.showTextDocument(file, {
              viewColumn: ViewColumn.Active,
              preview: false,
            }),
          );

        if (filesNotFound.length > 0) {
          task.files = task.files.filter((file) => !filesNotFound.includes(file));
          window.showWarningMessage(`Some files were not found in the file system:\n${filesNotFound.join("\n")}`);
        }
        this.treeDataProvider.refresh();
      });
    }
  };

  /**
   * Add file to the activated task
   */
  addFile = (document: TextDocument): void => {
    const activeTask = this.state.activeTask;
    const fileName = getRealFileName(document);

    if (fileName && activeTask !== null && this.state.tasks[activeTask]) {
      const task = this.state.tasks[activeTask];

      if (!task.files.includes(fileName)) {
        task.files.push(fileName);
        this.treeDataProvider.refresh();
      }
    }
  };

  /**
   * Remove file from the activated task
   */
  removeFile = (document: TextDocument): void => {
    const activeTask = this.state.activeTask;
    const fileName = getRealFileName(document);

    if (fileName && activeTask !== null && this.state.tasks[activeTask]) {
      const haveBeenRemoved = !workspace.textDocuments.map((textDoc) => textDoc.fileName).includes(fileName);

      if (haveBeenRemoved) {
        const task = this.state.tasks[activeTask];
        task.files = task.files.filter((file: string) => file !== fileName);

        this.treeDataProvider.refresh();
      }
    }
  };

  /**
   * Show new text in the status bar.
   * @param text Status bar item text
   */
  updateStatusBar(text?: string): void {
    if (text) {
      this.statusBarItem.text = "$(tasklist) " + text;
      this.statusBarItem.show();
    } else {
      this.statusBarItem.text = "";
      this.statusBarItem.hide();
    }
  }

  /**
   * Handles the branch change.
   * @param branch The new branch
   */
  private onBranchChange = (branch?: string) => {
    if (this.state.activeTask) {
      const task = this.state.tasks[this.state.activeTask];
      task.branch = branch;
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
        task.branch = this.git.branch;
      }
    }
  };
}
