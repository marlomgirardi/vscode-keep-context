import * as vscode from 'vscode';
import { window, workspace } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class ContextTreeDataProvider implements vscode.TreeDataProvider<ContextTreeItem> {
  /**
   * List of workspace folders or `undefined` when no folder is open.
   */
  private readonly workspaceFolders?: vscode.WorkspaceFolder[] = workspace.workspaceFolders;

  /**
   * Keep Context status bar item.
   */
  public readonly statusBarItem: vscode.StatusBarItem = window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );

  private vsCodeSettings?: string;

  private keepContextSettings?: string;

  private settings = {
    tasks: {},
  };

  constructor() {
    if (this.workspaceFolders) {
      this.vsCodeSettings = path.join(this.workspaceFolders[0].uri.fsPath, '.vscode');
      this.keepContextSettings = path.join(this.vsCodeSettings, 'keep-context.json');

      this.loadSettings();
    }
  }

  /**
   * Prepare the Keep Context settings.
   * It will try to load the configuration, if it don't exists, create a new one.
   */
  private loadSettings() {
    if (this.keepContextSettings) {
      if (fs.existsSync(this.keepContextSettings)) {
        this.settings = JSON.parse(fs.readFileSync(this.keepContextSettings, 'utf-8'));
      } else {
        fs.writeFileSync(this.keepContextSettings, JSON.stringify(this.settings, null, 2), { encoding: 'utf-8' });
      }
    }
  }

  getTreeItem = (element: ContextTreeItem): vscode.TreeItem => element;

  getChildren(element?: ContextTreeItem): Thenable<ContextTreeItem[]> {
    if (!this.workspaceFolders) {
      window.showWarningMessage('Keep Context needs a workspace to run');
      return Promise.resolve([]);
    }

    // TODO: side-panel stuff

    return Promise.resolve([]);
  }

  addFile = (document: vscode.TextDocument): void => {
    console.info('Opened %s (scheme: %s)', document.fileName, document.uri.scheme);
    if (document.uri.scheme === 'file') {
      // TODO: add file to the context
    }
  };
}

export class ContextTreeItem extends vscode.TreeItem {
  // TODO: configure TreeItem
}
