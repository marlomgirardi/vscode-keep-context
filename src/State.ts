import { Memento } from "vscode";
import Task from "./Task";

let _state: State;

/**
 * State
 *
 * Manage the state used in the Keep Context.
 */
export default class State {
  /**
   * @param workspaceState Storage from extension context.
   */
  private constructor(readonly workspaceState: Memento) {}

  /**
   * @param workspaceState Storage from extension context.
   */
  static setupState(workspaceState: Memento): void {
    _state = new State(workspaceState);
  }

  /**
   * Get singleton instance of state.
   */
  static getInstance(): State {
    return _state;
  }

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

  clear(): void {
    this.workspaceState.update("activeTask", null);
    this.workspaceState.update("tasks", {});
  }
}
