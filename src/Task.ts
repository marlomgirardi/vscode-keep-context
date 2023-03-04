import { ViewColumn } from 'vscode';
import { EditorGroupLayout } from './typings/editorLayout';

export interface File {
  /**
   * Relative path from the workspace folder
   */
  relativePath: string;
  /**
   * The workspace folder name.
   * If `undefined`, it is from outside the workspace.
   */
  workspaceFolder?: string;

  /**
   * The location where this file should be.
   */
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
  files: File[];

  /**
   * Branch attached to this task.
   */
  branch?: string;

  /**
   * Flag to check if the current task is active.
   */
  isActive: boolean;

  /**
   * The layout of the editor for the task.
   */
  layout?: EditorGroupLayout;
}
