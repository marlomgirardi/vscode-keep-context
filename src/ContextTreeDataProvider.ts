import * as vscode from 'vscode';

export class ContextTreeDataProvider implements vscode.TreeDataProvider<ContextTreeItem> {
  private workspaceFolders?: vscode.WorkspaceFolder[];

  statusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

  constructor() {
    this.workspaceFolders = vscode.workspace.workspaceFolders;

    if (this.workspaceFolders) {
      // TODO: load stuff
    }
  }

  getTreeItem = (element: ContextTreeItem): vscode.TreeItem => element;

  getChildren(element?: ContextTreeItem): Thenable<ContextTreeItem[]> {
    if (!this.workspaceFolders) {
      vscode.window.showWarningMessage('Keep Context needs a workspace to run');
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
