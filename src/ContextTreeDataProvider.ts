import { EventEmitter, TreeDataProvider, TreeItem } from "vscode";

import { ContextTreeItem } from "./ContextTreeItem";
import State from "./State";

export class ContextTreeDataProvider implements TreeDataProvider<ContextTreeItem> {
  /**
   * Manage ContextTreeItem events.
   */
  private _onDidChangeTreeData: EventEmitter<ContextTreeItem | null> = new EventEmitter<ContextTreeItem>();

  /** @override */
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(readonly state: State) {}

  /** @override */
  getTreeItem = (element: ContextTreeItem): TreeItem => element;

  /** @override */
  getChildren(element?: ContextTreeItem): Thenable<ContextTreeItem[]> {
    // first level of the tree
    if (!element) {
      return Promise.resolve(ContextTreeItem.fromState(this.state));
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
