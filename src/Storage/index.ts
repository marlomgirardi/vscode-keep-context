import path = require('path');
import { workspace } from 'vscode';
import { getStorageType } from '../config';
import { state } from '../global';
import { FileStorage } from './FileStorage';
import { IStorage } from './IStorage';
import { WorkspaceStorage } from './WorkspaceStorage';

export function getStorage(storageType = getStorageType()): IStorage {
  const vsCodeSettings = workspace.workspaceFolders?.[0]
    ? path.join(workspace.workspaceFolders[0]?.uri.fsPath, '.vscode')
    : undefined;

  switch (storageType) {
    case 'workspace':
      return new WorkspaceStorage();
    case 'file':
      if (!vsCodeSettings) throw new Error('No workspace found');
      return new FileStorage(vsCodeSettings);
    default:
      throw new Error('Invalid storage type.');
  }
}

export function changeStorage() {
  const newStorage = getStorage();
  state.changeStorage(newStorage);
}
