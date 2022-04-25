import { window } from 'vscode';

// TODO: improve later and add configuration
const isDebugging = true;

const outputChannelName = 'Keep Context';
const consolePrefix = '[Keep Context]';

const outputChannel = window.createOutputChannel(outputChannelName);

type Category = 'debug' | 'info' | 'warning' | 'error';

function log(category: Category, message?: string, ...rest: unknown[]) {
  const others = rest.reduce((acc, value) => acc + `${JSON.stringify(value, null, 2)}\n`, '');

  switch (category) {
    case 'debug':
      if (isDebugging) {
        console.log(consolePrefix, message, ...rest);
      }
      outputChannel.appendLine(`[DEBUG] ${message} ${others}`);
      break;
    case 'info':
      if (isDebugging) {
        console.info(consolePrefix, message, ...rest);
      }
      outputChannel.appendLine(`[INFO] ${message} ${others}`);
      break;
    case 'warning':
      if (isDebugging) {
        console.warn(consolePrefix, message, ...rest);
      }
      outputChannel.appendLine(`[WARNING] ${message} ${others}`);
      break;
    case 'error':
      if (isDebugging) {
        console.error(consolePrefix, message, ...rest);
      }
      outputChannel.appendLine(`[ERROR] ${message} ${others}`);
      break;
  }
}

export default {
  debug: (message: string, ...rest: unknown[]) => log('debug', message, ...rest),
  info: (message: string, ...rest: unknown[]) => log('info', message, ...rest),
  warning: (message: string, ...rest: unknown[]) => log('warning', message, ...rest),
  error: (message: string, ...rest: unknown[]) => log('error', message, ...rest),
};
