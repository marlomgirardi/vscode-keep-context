# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

Starting at `v1.0.0` this project will follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html). `v0.x` can be considered a beta version.

## Unreleased
- Upgrade all dependencies
- Update icons to use [vscode-codicon](https://microsoft.github.io/vscode-codicons/dist/codicon.html).
- 

## 0.2.0 - 2021-05-21

### Added

- Add task keybinding (Cmd+K Cmd+Shift+C).
- Select task keybinding (Cmd+K Cmd+Shift+S).
- Ask to add files when no task is active (#8)

### Fixes
- Replace 'get' by 'update' on workspace method used on State.

### Security
- Upgrade mocha to remove 'Prototype Pollution' from a dependency.
- Upgrade y18n and lodash due to `npm audit` recommendations.

### Breaking changes
- The state of the extension is now saved in the reserved space by VS Code. `keep-context.json` will not be created.
- Upgrade project dependencies.

## 0.1.2 - 2019-12-21

### Fixes
- Fix `https-proxy-agent` [vulnerability](https://www.npmjs.com/advisories/1184) with `npm audit`.
- Remove file from task when it was not found in the file system.
- Set `activeTask` as `null` when not found in the task's list.

## 0.1.1 - 2019-10-06

### Fixes
- Fix `Settings.initialize`on first run (create `.vscode` if not exists).

## 0.1.0 - 2019-10-05

### Added

- Git support

## 0.0.1 - 2019-10-03

### Added

- Task management
- File tracking by task
- Activated task in the status bar
