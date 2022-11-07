import { ExtensionContext } from 'vscode';
import State from './State';
import { getStorage } from './Storage';

export let context: ExtensionContext;
export let state: State;

export function init(extensionContext: ExtensionContext) {
  context = extensionContext;
  state = new State(getStorage());
}
