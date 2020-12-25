import { Memento } from "vscode";
import { Task } from "./typings/KeepContext";

/**
 * State
 *
 * Manage the state used in the Keep Context.
 */
export default class State {
  /**
   * @param workspaceState Storage from extension context.
   */
  constructor(readonly workspaceState: Memento) {}

  /**
   * Get the active task.
   */
  get activeTask(): string | null {
    return this.workspaceState.get("activeTask", null);
  }

  /**
   * Set the active task.
   */
  set activeTask(taskId: string | null) {
    const prevActiveTask = this.activeTask;
    if (prevActiveTask && this.tasks[prevActiveTask]) {
      this.tasks[prevActiveTask].isActive = false;
    }

    if (taskId) {
      this.tasks[taskId].isActive = true;
    }

    this.workspaceState.update("activeTask", taskId);
  }

  /**
   * Get the task list
   */
  get tasks(): { [name: string]: Task } {
    return this.workspaceState.get("tasks", {});
  }

  /**
   * Set the task list
   */
  set tasks(tasks: { [name: string]: Task }) {
    this.workspaceState.update("tasks", tasks);
  }
}
