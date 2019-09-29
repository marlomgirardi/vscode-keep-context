import * as fs from 'fs';
import * as path from 'path';
import KeepContext from '.';

/**
 * Manage the settings used in the Keep Context.
 */
export default class Settings {
  /**
   * Settings folder path
   */
  private path: string;

  /**
   * Settings data, saved and loaded data from the settings file.
   */
  private data: KeepContext.SettingsData = {
    active: null,
    tasks: {},
  };

  /**
   * @param settingsPath `.vscode` folder path
   */
  constructor(settingsPath: string) {
    this.path = path.join(settingsPath, 'keep-context.json');

    this.initialize();
  }

  /**
   * Get the active task.
   */
  get activeTask() {
    return this.data.active;
  }

  /**
   * Set the active task.
   */
  set activeTask(taskId) {
    this.data.active = taskId;
  }

  /**
   * Get the task list
   */
  get tasks() {
    return this.data.tasks;
  }

  /**
   * Set the task list
   */
  set tasks(tasks: { [name: string]: KeepContext.Task }) {
    this.data.tasks = tasks;
  }

  /**
   * Put the data into a file and store in the config folder of the workspace.
   */
  save(): void {
    fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2), { encoding: 'utf-8' });
  }

  /**
   * Prepare the Keep Context settings.
   * It will try to load the configuration, if it don't exists, create a new one.
   */
  private initialize() {
    if (this.path) {
      if (fs.existsSync(this.path)) {
        this.data = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
      } else {
        fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2), { encoding: 'utf-8' });
      }
    }
  }
}
