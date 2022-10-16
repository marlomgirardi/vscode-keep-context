import { Tab, TabInputCustom, TabInputNotebook, TabInputText, window } from 'vscode';
import Task, { File } from './Task';

/**
 * Returns an empty task structure.
 *
 * @param name Task name.
 */
export function createTask(name: string): Task {
  return {
    files: [],
    id: `task-${name}`,
    name,
    isActive: false,
  };
}

/**
 * It mostly will be used as validation of `window.showInputBox`.
 *
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

/**
 * Opens an input box to ask the user for task input.
 *
 * @param value The value of `window.showInputBox`
 * @param validate Holds an extra validation point. For instance, to validate if a task already exists.
 * @return Thenable of `window.showInputBox`.
 */
export function taskInputBox(
  value?: string,
  validate?: (value: string) => string | null,
): Thenable<string | undefined> {
  return window.showInputBox({
    placeHolder: 'Type the name of your task',
    validateInput: (inputVal: string) => {
      let val = validateTaskInput(inputVal);

      if (!val && validate) {
        val = validate(inputVal);
      }

      return val;
    },
    value,
  });
}

/** As the typescript do not evaluate `isTabSupported` and I don't want to spread it through the code. This will help */
type KeepContextTabInput = TabInputText | TabInputCustom | TabInputNotebook;

export function isTabSupported(tab: Tab) {
  return (
    tab.input instanceof TabInputText || tab.input instanceof TabInputCustom || tab.input instanceof TabInputNotebook
  );
}

/**
 * Get a list of opened files supported by KeepContext.
 */
export function getAllOpenedFiles(): File[] {
  return [
    ...new Set(
      window.tabGroups.all
        .flatMap((group) => group.tabs)
        .filter((tab) => !tab.isPreview && isTabSupported(tab))
        .map(({ input, group }) => ({
          path: (input as KeepContextTabInput).uri.fsPath,
          viewColumn: group.viewColumn,
        })),
    ),
  ];
}
