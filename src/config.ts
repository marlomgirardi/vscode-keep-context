import { workspace } from 'vscode';

export const CONFIG_SECTION = 'keepContext';

function config() {
  return workspace.getConfiguration(CONFIG_SECTION);
}

/**
 * Get the place to store contexts, workspace state or file.
 */
export function getStorageType(): 'workspace' | 'file' {
  return config().get('contextStore', 'workspace');
}
