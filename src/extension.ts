import * as vscode from "vscode";
import KeepContext from "./KeepContext";
import State from "./State";
import { getRealFileName } from "./utils";

export function activate(context: vscode.ExtensionContext): void {
  State.setupState(context.workspaceState);

  const keepContext = new KeepContext();

  vscode.window.registerTreeDataProvider("keepContext", keepContext.treeDataProvider);
  vscode.commands.registerCommand("keepContext.newTask", keepContext.newTask);
  vscode.commands.registerCommand("keepContext.editTask", keepContext.editTask);
  vscode.commands.registerCommand("keepContext.deleteTask", keepContext.deleteTask);
  vscode.commands.registerCommand("keepContext.activateTask", keepContext.activateTask);
  vscode.commands.registerCommand("keepContext.selectTask", keepContext.selectTask);

  vscode.workspace.onDidOpenTextDocument(keepContext.addFile);
  vscode.workspace.onDidCloseTextDocument(keepContext.removeFile);
  vscode.window.onDidChangeTextEditorViewColumn((textEditor: vscode.TextEditorViewColumnChangeEvent) => {
    const state = State.getInstance();
    debugger;
  });
  vscode.window.onDidChangeVisibleTextEditors((textEditors: vscode.TextEditor[]) => {
    const state = State.getInstance();

    if (state.activeTask) {
      const task = state.tasks[state.activeTask];

      textEditors.forEach(({ document, viewColumn }) => {
        task.files = task.files.map((file) => {
          if (file.path === getRealFileName(document)) {
            file.viewColumn = viewColumn;
          }
          return file;
        });
      });
      debugger;
    }
  });

  context.subscriptions.push(keepContext.statusBarItem);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {}
