import { Extension, extensions } from 'vscode';
import logger from './logger';
import * as Git from './typings/git';

export default class GitProvider {
  branch?: string;

  /**
   * Listen to branch changes
   */
  onDidChangeBranch?: (branch?: string) => void;

  /**
   * Listen to git initialization
   */
  onDidInitialize?: (branch?: string) => void;

  /**
   * Access to the native git extension
   */
  private git: Git.API;

  constructor() {
    const gitExtension: Extension<Git.GitExtension> | undefined = extensions.getExtension('vscode.git');

    if (!gitExtension) {
      throw new Error('Could not found the vscode.git extension');
    }

    this.git = gitExtension.exports.getAPI(1);

    if (this.git.state === 'initialized') {
      this.branch = this.getBranch();
      this.listenToBranchChange();
      this.onDidInitialize?.(this.branch);
    } else {
      this.git.onDidChangeState((state) => {
        if (state === 'initialized') {
          this.branch = this.getBranch();
          this.listenToBranchChange();
          this.onDidInitialize?.(this.branch);
        }
      });
    }
  }

  setBranch(branch: string): void {
    if (this.branch === branch) return;
    this.git.repositories[0]
      .checkout(branch)
      .then(() => (this.branch = branch))
      .catch((e) => logger.error(`Error during checkout of branch "${branch}"`, e));
  }

  private listenToBranchChange() {
    this.git.repositories[0]?.state.onDidChange(() => {
      const newBranch = this.getBranch();
      if (newBranch !== this.branch) {
        this.branch = newBranch;
        this.onDidChangeBranch?.(this.branch);
      }
    });
  }

  private getBranch(): string | undefined {
    return this.git.repositories[0]?.state.HEAD?.name;
  }
}
