---
title: Attributes Plugin
description: Adds a toolbar button and an editAttributes command that open a dialog to edit, remove and add the HTML attributes of any element in the Jodit editor.
keywords: jodit, attributes plugin, edit attributes, html attributes, tag attributes, attribute editor, data attributes
---

# Attributes Plugin

Lets the user edit every attribute of an HTML element: change values, remove attributes and add new ones.

## Description

The plugin registers the `attributes` button (in the `other` toolbar group) and the `editAttributes` command.
They open a dialog that shows:

- A list to pick the element: the element around the cursor and each of its ancestors (`strong`, `p`, `td`, `table`...)
- One line per attribute, with its name, its value and a button to remove it
- An **Add attribute** button

**Apply** writes the changes to the element; **Cancel** leaves it unchanged. Invalid names (`1abc`, `my attr`)
and denied names (inline event handlers such as `onclick`, by default) are refused with a message.

The dialog can also be opened from the path in the status bar: right-click an element of the path and choose **Edit attributes**.

## Usage

The plugin is enabled by default:

```javascript
const editor = Jodit.make('#editor');
// The "Edit attributes" button is in the toolbar
```

### Open the dialog from code

```javascript
// For the element around the cursor
editor.execCommand('editAttributes');

// For a given element
editor.execCommand(
	'editAttributes',
	false,
	editor.editor.querySelector('table')
);
```

### Options

```javascript
const editor = Jodit.make('#editor', {
	attributesEditor: {
		// Names that cannot be added or changed. Default: /^on/i (event handlers).
		// null allows every valid name.
		denyAttributes: /^(on|style$)/i,

		// Attributes that are not shown and never touched. Default: /^data-jodit/i
		hiddenAttributes: /^data-(jodit|internal)/i
	}
});
```

### Disable the Plugin

```javascript
const editor = Jodit.make('#editor', {
	disablePlugins: ['attributes']
});
```

## Events

The `xpath` plugin fires `xpathContextMenu` with the element and the list of actions before it shows the context menu
of the path. Plugins can push their own actions to the list; this plugin adds **Edit attributes** this way.
