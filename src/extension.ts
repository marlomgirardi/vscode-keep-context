import * as vscode from 'vscode';
import { ContextTreeDataProvider } from './ContextTreeDataProvider';

export function activate(context: vscode.ExtensionContext) {
  const contextTreeDataProvider = new ContextTreeDataProvider();

  vscode.window.registerTreeDataProvider('keepContext', contextTreeDataProvider);
  vscode.commands.registerCommand('keepContext.newTask', contextTreeDataProvider.newTask);
  vscode.commands.registerCommand('keepContext.editTask', contextTreeDataProvider.editTask);
  vscode.commands.registerCommand('keepContext.deleteTask', contextTreeDataProvider.deleteTask);
  vscode.commands.registerCommand('keepContext.activateTask', contextTreeDataProvider.activateTask);

  vscode.workspace.onDidOpenTextDocument(contextTreeDataProvider.addFile);
  // TODO: removeDocument

  context.subscriptions.push(contextTreeDataProvider.statusBarItem);
}

export function deactivate() {}
