import KeepContext from '.';

/**
 * Returns an empty task structure.
 *
 * @param name Task name.
 */
export function createTask(name: string): KeepContext.Task {
  return {
    files: [],
    id: `task-${name}`,
    name,
  };
}

/**
 * It mostly will be used as validation of `window.showInputBox`.
 * @param value Input value
 * @returns Returns an string with the **error message** or `null` if it is valid
 */
export function validateTaskInput(value: string): string | null {
  if (typeof value === 'string') {
    if (value === '') {
      return 'Empty string is not allowed';
    }
    return null;
  }

  return `${value} is invalid`;
}
