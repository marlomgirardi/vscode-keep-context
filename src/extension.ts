import * as vscode from 'vscode';
import KeepContext from './KeepContext';
import State from './State';
import { isTabSupported, KeepContextTabInput } from './utils';

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
      const files = [
        ...new Set(
          vscode.window.tabGroups.all
            .flatMap((group) => group.tabs)
            .filter((tab) => !tab.isPreview && isTabSupported(tab))
            .map(({ input }) => (input as KeepContextTabInput).uri.fsPath),
        ),
      ];

      keepContext.updateFileList(files);
    }
  });

  context.subscriptions.push(keepContext.statusBarItem);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {}
