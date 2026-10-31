/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2026 Valerii Chupurnov. All rights reserved. https://xdsoft.net
 */

/**
 * @module plugins/attributes
 */

import type { IControlType, IJodit } from 'jodit/types';
import { MODE_WYSIWYG } from 'jodit/core/constants';
import { Icon } from 'jodit/core/ui/icon';
import { Config } from 'jodit/config';

import attributesIcon from './attributes.svg';
import { findEditableElement } from './helpers';

/**
 * Options of the attributes editor
 */
export interface IAttributesEditorOptions {
	/**
	 * Attribute names that cannot be added or changed from the dialog.
	 * By default, inline event handlers (`onclick`, `onload`...) are denied.
	 * Set to `null` to allow every valid name.
	 */
	denyAttributes: RegExp | null;

	/**
	 * Attributes that are not shown in the dialog and are never touched by it,
	 * like the service attributes Jodit puts on elements.
	 */
	hiddenAttributes: RegExp | null;
}

declare module 'jodit/config' {
	interface Config {
		/**
		 * Options of the dialog that edits, removes and adds attributes
		 * of an element (`attributes` toolbar button)
		 *
		 * @example
		 * ```javascript
		 * Jodit.make('#editor', {
		 *   attributesEditor: {
		 *     denyAttributes: /^(on|style$)/i
		 *   }
		 * });
		 * ```
		 */
		attributesEditor: IAttributesEditorOptions;
	}
}

Config.prototype.attributesEditor = {
	denyAttributes: /^on/i,
	hiddenAttributes: /^data-jodit/i
};

Icon.set('attributes', attributesIcon);

Config.prototype.controls.attributes = {
	tooltip: 'Edit attributes',
	mode: MODE_WYSIWYG,
	exec: (editor: IJodit, current): void => {
		editor.execCommand('editAttributes', false, current);
	},
	isDisabled: (editor: IJodit): boolean =>
		!findEditableElement(editor, editor.s.current())
} as IControlType;
