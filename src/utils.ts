import { TextDocument, window } from 'vscode';
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

/**
 * Some times we receive a document with `uri.schema` equals `git` instead of `file`.
 * To avoid bugs, they should be treated as valid.
 *
 * @param document Text Document from VSCode.
 */
export function getRealFileName(document: TextDocument): string | false {
  let fileName: string | false = false;

  if (document.uri.scheme === 'file') {
    fileName = document.fileName;
  }

  if (document.uri.scheme === 'git') {
    fileName = document.fileName.replace(/\.git$/, '');
  }

  return fileName;
}
