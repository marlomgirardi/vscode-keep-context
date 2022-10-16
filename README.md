# VS Code - Keep Context

[![Go to VS marketplace](https://vsmarketplacebadge.apphb.com/version-short/marlom.keep-context.svg)](https://marketplace.visualstudio.com/items?itemName=marlom.keep-context)
[![Go to Github repo](https://vsmarketplacebadge.apphb.com/installs/marlom.keep-context.svg)](https://github.com/marlomgirardi/vscode-keep-context)

This extension was created to help those that at some point need to do some context switch and some times more often than we would like.
With this extension you won't forget the files that you need to open to continue working in that task.

## Features

### Task management

In a simple way you can:

- Create/edit/delete task
- Track opened files by task
- Track git branch by task

![Task management](images/docs/app-screen-record.gif)

## Keybindings

- `Ctrl+K Ctrl+Shift+C` (`Cmd` instead of `Ctrl` for MacOS) to create a task.
- `Ctrl+K Ctrl+Shift+S` (`Cmd` instead of `Ctrl` for MacOS) to select an task to be activated.

## Limitations

- It may work in workspaces with more than one folder, but it only supports single folders.
- It doesn't store `TabInputTextDiff`, `TabInputWebview`, `TabInputNotebookDiff`, and `TabInputTerminal`.
- Preview tabs are not stored.

### Layouts / Columns

VS Code uses `viewColumn` property to know the `tabGroup` a `tab` belongs to. But there is no what to know or set exact
position of the tab which only goes from `1` to `9`.

So if you place one group at the top and other at the bottom, the api just provide `1` and `2`. The same applies if you
add one group at left and other at right. So the only information we give back when opening tabs is to which group the
tab belongs.

## Known Issues

We are just starting but we know that we will have issues, to avoid duplicated issues they will be here :beetle:

## Release Notes

The release notes can be seen in [CHANGELOG.md](CHANGELOG.md)
