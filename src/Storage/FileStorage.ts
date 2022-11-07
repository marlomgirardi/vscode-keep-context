import * as fs from 'fs';
import * as path from 'path';

import { IStorage } from './IStorage';

/**
 * Manually handle the state storage by saving into a `keep-context.json` file.
 */
export class FileStorage implements IStorage {
  /**
   * Settings folder path
   */
  private path: string;

  /**
   * Settings data, saved and loaded data from the settings file.
   */
  private data: Record<string, any> = {};

  /**
   * @param settingsPath `.vscode` folder path
   */
  constructor(private readonly settingsPath: string) {
    this.path = path.join(settingsPath, 'keep-context.json');

    this.initialize();
  }

  get<T>(key: string, defaultValue?: T): T | undefined {
    return this.data[key] ?? defaultValue;
  }
  update(key: string, value: unknown): Thenable<void> {
    this.data[key] = value;
    return this.save();
  }

  import(data: Record<string, any>) {
    this.data = data;
    return this.save();
  }

  export() {
    return this.data;
  }

  clear() {
    return new Promise((resolve, reject) => {
      fs.unlink(this.path, (err) => (err ? reject(err) : resolve()));
    }) as Thenable<void>;
  }

  /**
   * Put the data into a file and store in the config folder of the workspace.
   */
  private save() {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.path, JSON.stringify(this.data, null, 2), { encoding: 'utf-8' }, (err) =>
        err ? reject(err) : resolve(),
      );
    }) as Thenable<void>;
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
        if (!fs.existsSync(this.settingsPath)) {
          fs.mkdirSync(this.settingsPath);
        }

        fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2), { encoding: 'utf-8' });
      }
    }
  }
}
