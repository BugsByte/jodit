/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2026 Valerii Chupurnov. All rights reserved. https://xdsoft.net
 */

/**
 * @module plugins/attributes
 */

import type { IDialog, IJodit } from 'jodit/types';
import { Dom } from 'jodit/core/dom/dom';
import { trim } from 'jodit/core/helpers/string/trim';
import { Button } from 'jodit/core/ui/button';

import {
	elementLabel,
	findEditableElement,
	getElementChain,
	isAllowedAttribute,
	isHiddenAttribute
} from './helpers';

interface IAttributeRow {
	row: HTMLElement;
	name: HTMLInputElement;
	value: HTMLInputElement;
}

/**
 * Opens the dialog that lists the attributes of the element (or of the element
 * around the cursor) and lets the user change, remove and add attributes.
 * The element can be switched to one of its ancestors from the dialog.
 */
export function openAttributesDialog(
	jodit: IJodit,
	target: unknown
): IDialog | null {
	const elm =
		findEditableElement(jodit, target) ??
		findEditableElement(jodit, jodit.s.current());

	if (!elm) {
		return null;
	}

	const i = jodit.i18n.bind(jodit);
	const chain = getElementChain(jodit, elm);
	let element = elm;

	const dialog = jodit.dlg({ closeOnClickOverlay: true });

	const box = jodit.c.div('jodit-attributes-editor');

	const select = jodit.c.element('select', {
		class: 'jodit-select jodit-attributes-editor__element'
	});

	chain.forEach((node, index) => {
		const option = jodit.c.element('option', { value: String(index) });
		option.textContent = elementLabel(node);
		select.appendChild(option);
	});

	const elementLine = jodit.c.div('jodit-attributes-editor__line');
	const elementLabelBox = jodit.c.element('label');
	elementLabelBox.textContent = i('Element');
	Dom.append(elementLine, [elementLabelBox, select]);

	const header = jodit.c.div('jodit-attributes-editor__row');
	const nameTitle = jodit.c.div('jodit-attributes-editor__title');
	nameTitle.textContent = i('Attribute name');
	const valueTitle = jodit.c.div('jodit-attributes-editor__title');
	valueTitle.textContent = i('Attribute value');
	Dom.append(header, [nameTitle, valueTitle]);

	const list = jodit.c.div('jodit-attributes-editor__list');
	const error = jodit.c.div('jodit-attributes-editor__error');

	let rows: IAttributeRow[] = [];

	const addRow = (name: string, value: string): IAttributeRow => {
		const row = jodit.c.div('jodit-attributes-editor__row');

		const nameInput = jodit.c.element('input', {
			type: 'text',
			class: 'jodit-input jodit-attributes-editor__name',
			'aria-label': i('Attribute name')
		});
		nameInput.value = name;

		const valueInput = jodit.c.element('input', {
			type: 'text',
			class: 'jodit-input jodit-attributes-editor__value',
			'aria-label': i('Attribute value')
		});
		valueInput.value = value;

		const item: IAttributeRow = {
			row,
			name: nameInput,
			value: valueInput
		};

		const remove = Button(jodit, {
			icon: { name: 'bin' },
			name: 'remove',
			tooltip: 'Remove'
		}).onAction(() => {
			Dom.safeRemove(row);
			rows = rows.filter(r => r !== item);
			remove.destruct();
		});

		remove.container.classList.add('jodit-attributes-editor__remove');

		Dom.append(row, [nameInput, valueInput, remove.container]);
		list.appendChild(row);
		rows.push(item);

		return item;
	};

	const fill = (): void => {
		list.innerHTML = '';
		rows = [];
		error.textContent = '';

		Array.from(element.attributes).forEach(({ name, value }) => {
			if (!isHiddenAttribute(jodit, name)) {
				addRow(name, value);
			}
		});
	};

	jodit.e.on(select, 'change', () => {
		element = chain[parseInt(select.value, 10)] ?? elm;
		fill();
	});

	const add = Button(jodit, 'plus', 'Add attribute').onAction(() => {
		addRow('', '').name.focus();
	});

	add.container.classList.add('jodit-attributes-editor__add');

	Dom.append(box, [elementLine, header, list, add.container, error]);

	const showError = (input: HTMLInputElement, name: string): false => {
		error.textContent = i('Invalid attribute name: %s', name);
		input.classList.add('jodit-input_has-error_true');
		input.focus();
		return false;
	};

	const apply = (): boolean => {
		error.textContent = '';

		const values = new Map<string, string>();

		for (const { name, value } of rows) {
			name.classList.remove('jodit-input_has-error_true');

			const key = trim(name.value);

			if (!key) {
				if (value.value === '') {
					continue; // An empty line
				}

				return showError(name, key);
			}

			if (!isAllowedAttribute(jodit, key)) {
				return showError(name, key);
			}

			values.set(key.toLowerCase(), value.value);
		}

		Array.from(element.attributes).forEach(({ name }) => {
			if (
				!isHiddenAttribute(jodit, name) &&
				!values.has(name.toLowerCase())
			) {
				element.removeAttribute(name);
			}
		});

		values.forEach((value, key) => {
			if (element.getAttribute(key) !== value) {
				element.setAttribute(key, value);
			}
		});

		jodit.synchronizeValues();

		return true;
	};

	jodit.e.on(box, 'keydown', (e: KeyboardEvent) => {
		if (e.key === 'Enter' && Dom.isTag(e.target as Node, 'input')) {
			e.preventDefault();
			apply() && dialog.close();
		}
	});

	jodit.s.save();

	dialog.e.on(dialog, 'afterClose', () => {
		add.destruct();
		jodit.s.focus();
		jodit.s.restore();
	});

	dialog.setFooter([
		Button(jodit, 'cancel', 'Cancel').onAction(() => dialog.close()),
		Button(jodit, 'ok', 'Apply', 'primary').onAction(() => {
			apply() && dialog.close();
		})
	]);

	fill();

	dialog.open(box, i('Edit attributes'), true, true);

	return dialog;
}
