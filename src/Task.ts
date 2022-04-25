import { ViewColumn } from 'vscode';

export interface File {
  path: string;
  viewColumn?: ViewColumn;
}

export default interface Task {
  /**
   * Task ID.
   */
  id: string;

  /**
   * Task name.
   */
  name: string;

  /**
   * All the files opened in the editor while working in the task.
   */
  files: string[];
  // files: File[];

  /**
   * Branch attached to this task.
   */
  branch?: string;

  /**
   * Flag to check if the current task is active.
   */
  isActive: boolean;
}
