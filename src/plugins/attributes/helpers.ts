/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2026 Valerii Chupurnov. All rights reserved. https://xdsoft.net
 */

/**
 * @module plugins/attributes
 */

import type { IJodit, Nullable } from 'jodit/types';
import { Dom } from 'jodit/core/dom/dom';

/**
 * A valid attribute name (letters, digits, `-`, `_`, `.`, `:`; it does not start with a digit, `-` or `.`)
 */
export const ATTRIBUTE_NAME_REG = /^[a-zA-Z_:][-a-zA-Z0-9_:.]*$/;

/**
 * The element whose attributes are edited: the node itself, or the parent
 * element of a text node. Null when it is outside the editor or the editor's root.
 */
export function findEditableElement(
	jodit: IJodit,
	node: unknown
): Nullable<HTMLElement> {
	if (!Dom.isNode(node)) {
		return null;
	}

	const elm = Dom.isElement(node) ? node : node.parentElement;

	if (!elm || elm === jodit.editor || !Dom.isOrContains(jodit.editor, elm)) {
		return null;
	}

	return elm as HTMLElement;
}

/**
 * The element and its ancestors, up to the editor's root (excluded)
 */
export function getElementChain(
	jodit: IJodit,
	elm: HTMLElement
): HTMLElement[] {
	const chain: HTMLElement[] = [];

	let current: Nullable<HTMLElement> = elm;

	while (current && current !== jodit.editor) {
		chain.push(current);
		current = current.parentElement;
	}

	return chain;
}

/**
 * A short label of the element: `tag#id.class`
 */
export function elementLabel(elm: HTMLElement): string {
	let label = elm.nodeName.toLowerCase();

	if (elm.id) {
		label += '#' + elm.id;
	}

	const cls = elm.classList?.[0];

	if (cls) {
		label += '.' + cls;
	}

	return label;
}

/**
 * Whether the attribute is hidden from the dialog
 */
export function isHiddenAttribute(jodit: IJodit, name: string): boolean {
	const reg = jodit.o.attributesEditor.hiddenAttributes;
	return reg ? reg.test(name) : false;
}

/**
 * Whether the attribute name can be set from the dialog
 */
export function isAllowedAttribute(jodit: IJodit, name: string): boolean {
	if (!ATTRIBUTE_NAME_REG.test(name) || isHiddenAttribute(jodit, name)) {
		return false;
	}

	const deny = jodit.o.attributesEditor.denyAttributes;

	return !(deny && deny.test(name));
}
