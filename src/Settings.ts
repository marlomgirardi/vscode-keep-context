import * as fs from 'fs';
import * as path from 'path';
import KeepContext from '.';

/**
 * Manage the settings used in the Keep Context.
 */
export default class Settings {
  private path: string;

  private data: KeepContext.SettingsData = {
    active: null,
    tasks: {},
  };

  /**
   * @param settingsPath `.vscode` folder path
   * @param onChange The function to be triggered after read or write the settings file.
   */
  constructor(settingsPath: string, readonly onChange?: () => void) {
    this.path = path.join(settingsPath, 'keep-context.json');

    this.initialize();
  }

  get tasks() {
    return this.data.tasks;
  }

  save(): void {
    fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2), { encoding: 'utf-8' });

    if (this.onChange) {
      this.onChange();
    }
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
