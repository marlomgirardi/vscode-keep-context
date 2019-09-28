import * as vscode from 'vscode';
import { ContextTreeDataProvider } from './ContextTreeDataProvider';

export function activate(context: vscode.ExtensionContext) {
  const contextTreeDataProvider = new ContextTreeDataProvider();

  vscode.window.registerTreeDataProvider('keepContext', contextTreeDataProvider);
  vscode.commands.registerCommand('keepContext.createTask', contextTreeDataProvider.createTask);

  vscode.workspace.onDidOpenTextDocument(contextTreeDataProvider.addFile);
  // TODO: removeDocument

  context.subscriptions.push(contextTreeDataProvider.statusBarItem);
}

export function deactivate() {}
