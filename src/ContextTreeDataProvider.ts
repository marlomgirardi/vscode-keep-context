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

import { ContextTreeItem } from './ContextTreeItem';
import Settings from './Settings';
import { createTask, validateTaskInput } from './utils';

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
    window
      .showInputBox({
        placeHolder: 'Type name for your task',
        validateInput: validateTaskInput,
      })
      .then((taskName?: string) => {
        if (!taskName) {
          return;
        }

        const task = createTask(taskName);

        if (this.settings.tasks[task.id]) {
          window.showErrorMessage(`A task with name "${taskName}"already exists`);
          return;
        }

        this.settings.tasks[task.id] = task;
        this.settings.save();
      });
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
