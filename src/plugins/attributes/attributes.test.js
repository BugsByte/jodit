/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2026 Valerii Chupurnov. All rights reserved. https://xdsoft.net
 */

describe('Test attributes plugin', () => {
	const openDialog = editor => {
		clickButton('attributes', editor);
		return getOpenedDialog(editor);
	};

	const rowsOf = dialog =>
		Array.from(
			dialog.querySelectorAll(
				'.jodit-attributes-editor__list .jodit-attributes-editor__row'
			)
		).map(row => {
			const [name, value] = row.querySelectorAll('input');
			return { row, name, value };
		});

	it('should list the attributes of the element around the cursor', () => {
		const editor = getJodit();
		editor.value =
			'<p><a href="https://xdsoft.net" title="Hi">te|st</a></p>';
		setCursorToChar(editor);

		const dialog = openDialog(editor);
		expect(dialog).is.not.null;

		const rows = rowsOf(dialog);
		expect(rows.map(r => r.name.value + '=' + r.value.value)).deep.equals(
			['href=https://xdsoft.net', 'title=Hi']
		);

		const select = dialog.querySelector('select');
		expect(
			Array.from(select.options).map(o => o.textContent)
		).deep.equals(['a', 'p']);

		clickButton('cancel', dialog);
		expect(getOpenedDialog(editor)).is.null;
	});

	it('should change, remove and add attributes', () => {
		const editor = getJodit();
		editor.value =
			'<p><a href="https://xdsoft.net" title="Hi">te|st</a></p>';
		setCursorToChar(editor);

		const dialog = openDialog(editor);
		const rows = rowsOf(dialog);

		rows[0].value.value = 'https://example.com';
		clickButton('remove', rows[1].row);

		clickButton('plus', dialog);
		const added = rowsOf(dialog).pop();
		added.name.value = 'data-id';
		added.value.value = '42';

		clickButton('ok', dialog);
		expect(getOpenedDialog(editor)).is.null;

		expect(sortAttributes(editor.value)).equals(
			'<p><a data-id="42" href="https://example.com">test</a></p>'
		);
	});

	it('should edit an ancestor chosen in the list', () => {
		const editor = getJodit();
		editor.value = '<p class="intro"><strong>te|st</strong></p>';
		setCursorToChar(editor);

		const dialog = openDialog(editor);
		expect(rowsOf(dialog).length).equals(0);

		const select = dialog.querySelector('select');
		select.value = '1';
		simulateEvent('change', select);

		const rows = rowsOf(dialog);
		expect(rows.length).equals(1);
		expect(rows[0].name.value).equals('class');

		rows[0].value.value = 'intro big';
		clickButton('ok', dialog);

		expect(editor.value).equals(
			'<p class="intro big"><strong>test</strong></p>'
		);
	});

	describe('Invalid or denied names', () => {
		['1abc', 'on click', 'onclick'].forEach(name => {
			it(`should not apply "${name}"`, () => {
				const editor = getJodit();
				editor.value = '<p>te|st</p>';
				setCursorToChar(editor);

				const dialog = openDialog(editor);
				clickButton('plus', dialog);
				const added = rowsOf(dialog).pop();
				added.name.value = name;
				added.value.value = 'alert(1)';

				clickButton('ok', dialog);

				expect(getOpenedDialog(editor)).equals(dialog);
				expect(
					dialog.querySelector('.jodit-attributes-editor__error')
						.textContent
				).equals('Invalid attribute name: ' + name);

				clickButton('cancel', dialog);
				expect(editor.value).equals('<p>test</p>');
			});
		});

		it('should allow event handlers when denyAttributes is null', () => {
			const editor = getJodit({
				attributesEditor: { denyAttributes: null }
			});
			editor.value = '<p>te|st</p>';
			setCursorToChar(editor);

			const dialog = openDialog(editor);
			clickButton('plus', dialog);
			const added = rowsOf(dialog).pop();
			added.name.value = 'onclick';
			added.value.value = 'void 0';
			clickButton('ok', dialog);

			expect(getOpenedDialog(editor)).is.null;
			expect(
				editor.editor.querySelector('p').getAttribute('onclick')
			).equals('void 0');
		});
	});

	it('should run with the editAttributes command for a given element', () => {
		const editor = getJodit();
		editor.value = '<p>one</p><p id="two">two</p>';

		editor.execCommand(
			'editAttributes',
			false,
			editor.editor.querySelector('#two')
		);

		const dialog = getOpenedDialog(editor);
		const rows = rowsOf(dialog);
		expect(rows.length).equals(1);
		clickButton('remove', rows[0].row);
		clickButton('ok', dialog);

		expect(editor.value).equals('<p>one</p><p>two</p>');
	});
});
