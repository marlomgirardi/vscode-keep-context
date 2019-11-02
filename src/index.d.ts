declare namespace KeepContext {
  export interface Task {
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

    /**
     * Branch attached to this task.
     */
    branch?: string;
  }
}

export default KeepContext;
