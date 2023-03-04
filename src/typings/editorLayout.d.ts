/**
 * When calling the built in commands:
 * - `vscode.setEditorLayout` have as argument `EditorGroupLayout`
 * - `vscode.getEditorLayout` have as response `EditorGroupLayout`
 *
 * The layout is defined by the following interface:
 *
 * @link {https://github.com/microsoft/vscode/blob/2b44aa50fd0a54752a0d537438042636f6287d22/src/vs/workbench/services/editor/common/editorGroupsService.ts}
 */

/**
 * @link {https://github.com/microsoft/vscode/blob/2b44aa50fd0a54752a0d537438042636f6287d22/src/vs/workbench/services/editor/common/editorGroupsService.ts#27}
 */
export const enum GroupOrientation {
  HORIZONTAL,
  VERTICAL,
}

/**
 * @link {https://github.com/microsoft/vscode/blob/2b44aa50fd0a54752a0d537438042636f6287d22/src/vs/workbench/services/editor/common/editorGroupsService.ts#64}
 */
export interface GroupLayoutArgument {
  /**
   * Only applies when there are multiple groups
   * arranged next to each other in a row or column.
   * If provided, their sum must be 1 to be applied
   * per row or column.
   */
  size?: number;

  /**
   * Editor groups  will be laid out orthogonal to the
   * parent orientation.
   */
  groups?: GroupLayoutArgument[];
}

/**
 * @link {https://github.com/microsoft/vscode/blob/2b44aa50fd0a54752a0d537438042636f6287d22/src/vs/workbench/services/editor/common/editorGroupsService.ts#81}
 */
export interface EditorGroupLayout {
  /**
   * The initial orientation of the editor groups at the root.
   */
  orientation: GroupOrientation;

  /**
   * The editor groups at the root of the layout.
   */
  groups: GroupLayoutArgument[];
}
