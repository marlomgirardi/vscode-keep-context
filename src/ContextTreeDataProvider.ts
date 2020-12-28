import { EventEmitter, TreeDataProvider, TreeItem } from "vscode";
import { ContextTreeItem } from "./ContextTreeItem";

export class ContextTreeDataProvider implements TreeDataProvider<ContextTreeItem> {
  /**
   * Manage ContextTreeItem events.
   */
  private _onDidChangeTreeData: EventEmitter<ContextTreeItem | null> = new EventEmitter<ContextTreeItem>();

  /** @override */
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  /** @override */
  getTreeItem = (element: ContextTreeItem): TreeItem => element;

  /** @override */
  getChildren(element?: ContextTreeItem): Thenable<ContextTreeItem[]> {
    // first level of the tree
    if (!element) {
      return Promise.resolve(ContextTreeItem.fromState());
    }

    return Promise.resolve([]);
  }

  /**
   * Trigger the change event of the tree items.
   */
  refresh = (): void => {
    this._onDidChangeTreeData.fire(null);
  };
}
