import * as vscode from 'vscode';
import KeepContext from './KeepContext';
import State from './State';
import { getAllOpenedFiles, isTabSupported } from './utils';

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

  // https://code.visualstudio.com/api/references/vscode-api#Tab
  vscode.window.tabGroups.onDidChangeTabs((tabEvent) => {
    const hasClosed = tabEvent.closed.some((tab) => !tab.isPreview && isTabSupported(tab));
    const hasOpened = tabEvent.opened.some((tab) => !tab.isPreview && isTabSupported(tab));
    const hasChanged = tabEvent.changed.some((tab) => !tab.isPreview && isTabSupported(tab));

    if ((hasClosed || hasOpened || hasChanged) && keepContext.isTaskActive()) {
      const files = getAllOpenedFiles();
      keepContext.updateFileList(files);
    }
  });

  // vscode.window.onDidChangeTextEditorViewColumn((textEditor: vscode.TextEditorViewColumnChangeEvent) => {
  //   const state = State.getInstance();
  //   debugger;
  // });

  // vscode.window.onDidChangeVisibleTextEditors((textEditors: vscode.TextEditor[]) => {
  //   const state = State.getInstance();

  //   if (state.activeTask) {
  //     const task = state.tasks[state.activeTask];

  //     textEditors.forEach(({ document, viewColumn }) => {
  //       task.files = task.files.map((file) => {
  //         if (file.path === getRealFileName(document)) {
  //           file.viewColumn = viewColumn;
  //         }
  //         return file;
  //       });
  //     });
  //     debugger;
  //   }
  // });

  context.subscriptions.push(keepContext.statusBarItem);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {}
