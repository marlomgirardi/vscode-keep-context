import * as vscode from 'vscode';
import KeepContext from './KeepContext';
import State from './State';

export function activate(context: vscode.ExtensionContext): void {
  State.setupState(context.workspaceState);

  const keepContext = new KeepContext();

  vscode.window.registerTreeDataProvider('keepContext', keepContext.treeDataProvider);

  vscode.commands.registerCommand('keepContext.clearState', keepContext.clearState);
  vscode.commands.registerCommand('keepContext.newTask', keepContext.newTask);
  vscode.commands.registerCommand('keepContext.editTask', keepContext.editTask);
  vscode.commands.registerCommand('keepContext.deleteTask', keepContext.deleteTask);
  vscode.commands.registerCommand('keepContext.activateTask', keepContext.activateTask);
  vscode.commands.registerCommand('keepContext.selectTask', keepContext.selectTask);

  vscode.workspace.onDidOpenTextDocument(keepContext.addFile);
  vscode.workspace.onDidCloseTextDocument(keepContext.removeFile);

  context.subscriptions.push(keepContext.statusBarItem);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {}
