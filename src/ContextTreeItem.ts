import * as path from 'path';
import { Command, TreeItem, TreeItemCollapsibleState } from 'vscode';
import Settings from './Settings';

export enum Contexts {
  TASK = 'task_item',
}

export enum Icons {
  TASK = 'task.svg',
  TASK_ACTIVE = 'task-active.svg',
}

export class ContextTreeItem extends TreeItem {
  constructor(
    readonly id: string,
    readonly label: string,
    readonly active: boolean,
    readonly contextValue: string,
    readonly collapsibleState: TreeItemCollapsibleState,
    readonly command?: Command,
  ) {
    super(label, collapsibleState);

    const imagesPath = path.join(__filename, '..', '..', 'images');
    const taskIcon = this.active ? Icons.TASK_ACTIVE : Icons.TASK;

    this.iconPath = {
      dark: path.join(imagesPath, 'dark', taskIcon),
      light: path.join(imagesPath, 'light', taskIcon),
    };
  }

  get tooltip(): string {
    let tooltip = this.label;

    if (this.active) {
      tooltip += ' (Active)';
    }

    return tooltip;
  }

  static fromSettings(settings: Settings): ContextTreeItem[] {
    return Object.values(settings.tasks).map((task) => {
      return new ContextTreeItem(
        task.id,
        task.name,
        settings.activeTask === task.id,
        Contexts.TASK,
        TreeItemCollapsibleState.None,
        {
          arguments: [task.id],
          command: 'keepContext.activateTask',
          title: '',
        },
      );
    });
  }
}
