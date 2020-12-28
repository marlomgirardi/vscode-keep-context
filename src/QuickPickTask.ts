import { QuickPickItem } from "vscode";
import Task from "./Task";

/**
 * QuickPickTask
 *
 * Create the item in the quick pick panel to select a task.
 */
export class QuickPickTask implements QuickPickItem {
  label: string;
  description?: string | undefined;
  id: Task["id"];

  constructor(label: string, taskId: Task["id"], isActive: boolean) {
    this.label = label;
    this.id = taskId;
    this.description = isActive ? "$(check) Active" : "";
  }

  static fromTask(task: Task): QuickPickTask {
    return new QuickPickTask(task.name, task.id, task.isActive);
  }
}
