# VS Code - Keep Context

> [!IMPORTANT]  
> The way I've built this extension to work was to fit my needs and since VSCode 1.89.0 this is now supported out of the box.
> 
> I won't be actively maintaining this extension while that keeps being true, all you need to do to use the native one is to set `"scm.workingSets.enabled"` as true in your VSCode settings.
>
> You can read more about it in the [VSCode Source Control docs](https://code.visualstudio.com/docs/sourcecontrol/overview#_branches-and-tags).

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
- We don't have a listener for "tab group resize", it relies on tab group change to update that currently.

## Known Issues

We are just starting but we know that we will have issues, to avoid duplicated issues they will be here :beetle:

## Release Notes

The release notes can be seen in [CHANGELOG.md](CHANGELOG.md)
