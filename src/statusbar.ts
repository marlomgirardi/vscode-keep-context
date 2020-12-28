import { StatusBarAlignment, window, StatusBarItem } from "vscode";

/**
 * @private
 */
const _statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);

/**
 * Get status bar item instance.
 */
export const getStatusBarItem = (): StatusBarItem => _statusBarItem;

/**
 * Clear status bar item.
 */
export function clearStatusBar(): void {
  _statusBarItem.text = "";
  _statusBarItem.hide();
}

/**
 * Update text in the status bar.
 * @param text Status bar item text
 */
export function updateStatusBar(text?: string): void {
  if (text) {
    _statusBarItem.text = "$(tasklist) " + text;
    _statusBarItem.show();
  } else {
    clearStatusBar();
  }
}
