import {
  Event,
  EventEmitter,
  TreeDataProvider,
  TreeItem,
} from 'vscode';

import { ContextTreeItem } from './ContextTreeItem';
import Settings from './Settings';

export class ContextTreeDataProvider implements TreeDataProvider<ContextTreeItem> {

    /** @override */
  readonly onDidChangeTreeData: Event<ContextTreeItem>;

  /**
   * Manage ContextTreeItem events.
   */
  private treeItemEventEmitter: EventEmitter<ContextTreeItem>;

  constructor(readonly settings: Settings) {
    this.treeItemEventEmitter = new EventEmitter<ContextTreeItem>();

    this.onDidChangeTreeData = this.treeItemEventEmitter.event;
  }

  /** @override */
  getTreeItem = (element: ContextTreeItem): TreeItem => element;

  /** @override */
  getChildren(element?: ContextTreeItem): Thenable<ContextTreeItem[]> {
    // first level of the tree
    if (!element) {
      return Promise.resolve(ContextTreeItem.fromSettings(this.settings));
    }

    return Promise.resolve([]);
  }

  /**
   * Trigger the change event of the tree items.
   */
  refresh = (): void => {
    this.treeItemEventEmitter.fire();
  }
}
