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
  }

  /**
   * Represents the settings saved in file.
   */
  export interface SettingsData {
    /**
     * Id of the current task.
     */
    active: string | null;

    /**
     * Task list
     */
    tasks: {
      [name: string]: Task;
    };
  }
}

export default KeepContext;
