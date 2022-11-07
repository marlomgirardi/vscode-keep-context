import { IStorage } from './Storage/IStorage';
import Task from './Task';

/**
 * State
 *
 * Manage the state used in the Keep Context.
 */
export default class State {
  constructor(private storage: IStorage) {}

  /**
   * Get the active task.
   */
  get activeTask(): string | null {
    return this.storage.get('activeTask', null);
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

    this.storage.update('activeTask', taskId);
  }

  /**
   * Get the task list
   */
  get tasks(): { [name: string]: Task } {
    return this.storage.get('tasks', {});
  }

  /**
   * Get a task by id
   */
  getTask(taskId: string): Task | null {
    const task = this.tasks[taskId];
    if (!task) return null;
    return task;
  }

  addTask(task: Task): void {
    const tasks = this.tasks;

    this.storage.update('tasks', {
      ...tasks,
      [task.id]: task,
    });
  }

  removeTask(task: Task): void {
    const tasks = { ...this.tasks };
    delete tasks[task.id];

    this.storage.update('tasks', tasks);
  }

  updateTask(task: Task): void {
    this.addTask(task);
  }

  clear(): void {
    this.storage.update('activeTask', null);
    this.storage.update('tasks', {});
  }

  /** Change storage used and sync them */
  changeStorage(newStorage: IStorage) {
    newStorage.import(this.storage.export()).then(() => {
      this.storage.clear();
      this.storage = newStorage;
    });
  }
}
