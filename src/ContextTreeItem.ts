import * as path from 'path';
import { Command, TreeItem, TreeItemCollapsibleState } from 'vscode';
import KeepContext from '.';

export enum Contexts {
  TASK = 'task_item',
}

export class ContextTreeItem extends TreeItem {
  constructor(
    readonly id: string,
    readonly label: string,
    readonly contextValue: string,
    readonly collapsibleState: TreeItemCollapsibleState,
    readonly command?: Command,
  ) {
    super(label, collapsibleState);

    const imagesPath = path.join(__filename, '..', '..', 'images');

    this.iconPath = {
      dark: path.join(imagesPath, 'dark', 'task.svg'),
      light: path.join(imagesPath, 'light', 'task.svg'),
    };
  }

  get tooltip(): string {
    return `${this.label}`;
  }

  static fromTask(task: KeepContext.Task) {
    return new ContextTreeItem(task.id, task.name, Contexts.TASK, TreeItemCollapsibleState.None);
  }
}
