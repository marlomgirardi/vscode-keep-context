import * as vscode from "vscode";
import KeepContext from "./KeepContext";

export function activate(context: vscode.ExtensionContext): void {
  const keepContext = new KeepContext(context);

  vscode.window.registerTreeDataProvider("keepContext", keepContext.treeDataProvider);
  vscode.commands.registerCommand("keepContext.newTask", keepContext.newTask);
  vscode.commands.registerCommand("keepContext.editTask", keepContext.editTask);
  vscode.commands.registerCommand("keepContext.deleteTask", keepContext.deleteTask);
  vscode.commands.registerCommand("keepContext.activateTask", keepContext.activateTask);

  vscode.workspace.onDidOpenTextDocument(keepContext.addFile);
  vscode.workspace.onDidCloseTextDocument(keepContext.removeFile);

  context.subscriptions.push(keepContext.statusBarItem);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {}
