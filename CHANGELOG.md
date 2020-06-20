# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Fixes
- Replace 'get' by 'update' on workspace method used on State.

### Security
- Upgrade mocha to remove 'Prototype Pollution' from a dependency.

### Breaking changes
- The state of the extension is now saved in the reserved space by VS Code. `keep-context.json` will not be created.

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
