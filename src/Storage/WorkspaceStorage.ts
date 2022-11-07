import { context } from '../global';
import { IStorage } from './IStorage';

/**
 * Let VSCode workspace handle the state storage.
 */
export class WorkspaceStorage implements IStorage {
  get<T>(key: string, defaultValue?: T): T | undefined {
    return context.workspaceState.get(key, defaultValue);
  }
  update(key: string, value: unknown): Thenable<void> {
    return context.workspaceState.update(key, value);
  }

  import(data: Record<string, any>) {
    const keys = Object.keys(data);

    return Promise.allSettled(keys.map((key) => this.update(key, data[key]))).then((results) => {
      const errors = results.filter((result) => result.status === 'rejected') as PromiseRejectedResult[];
      if (errors.length) {
        return Promise.reject(errors[0].reason);
      }
    }) as Thenable<void>;
  }

  export() {
    return context.workspaceState.keys().reduce((data, key) => {
      data[key] = this.get(key);
      return data;
    }, {} as Record<string, any>);
  }

  clear() {
    const keys = context.workspaceState.keys();

    return Promise.allSettled(keys.map((key) => this.update(key, undefined))).then((results) => {
      const errors = results.filter((result) => result.status === 'rejected') as PromiseRejectedResult[];
      if (errors.length) {
        return Promise.reject(errors[0].reason);
      }
    }) as Thenable<void>;
  }
}
