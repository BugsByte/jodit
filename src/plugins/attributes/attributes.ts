/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2026 Valerii Chupurnov. All rights reserved. https://xdsoft.net
 */

/**
 * [[include:plugins/attributes/README.md]]
 * @packageDocumentation
 * @module plugins/attributes
 */

import type { IContextMenuAction, IJodit } from 'jodit/types';
import { pluginSystem } from 'jodit/core/global';

import './config';

import { openAttributesDialog } from './dialog';

import './attributes.less';

/**
 * Adds the `attributes` button and the `editAttributes` command: a dialog to edit,
 * remove and add the attributes of the current element.
 */
export function attributes(editor: IJodit): void {
	editor.registerButton({
		name: 'attributes',
		group: 'other'
	});

	editor.registerCommand(
		'editAttributes',
		(_: string, _1: unknown, target: unknown): false => {
			openAttributesDialog(editor, target);
			return false;
		}
	);

	// "Edit attributes" in the context menu of the path in the status bar
	editor.e.on(
		'xpathContextMenu',
		(elm: Node, actions: IContextMenuAction[]): void => {
			if (elm !== editor.editor) {
				actions.push({
					icon: 'attributes',
					title: 'Edit attributes',
					exec: (): void => {
						editor.execCommand('editAttributes', false, elm);
					}
				});
			}
		}
	);
}

pluginSystem.add('attributes', attributes);
