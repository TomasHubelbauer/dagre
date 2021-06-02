# Dagre

- https://github.com/dagrejs/dagre/wiki
- https://github.com/dagrejs/graphlib/wiki

## Running

`npx serve .` for ESM and CORS to work (`file://` protocol won't work).

[GitHub Pages](https://tomashubelbauer.github.io/dagre)

## Features

- Code synced to graph
- UI + button for adding a new node connected to an existing node
- UI + button for splitting an edge into two with a node in between
- Clicking on a node allows enabling it and updating references

## To-Do

### Implement a UI control for removing nodes and edges

Make it so that the `foreignObject` for the UI controls in the edge midpoint and
atop the node box are zero-sized and use overflow to position their contents.

Have all of the `foreignObject` instances have buttons for add, delete and for
nodes also rename, but make the non-add buttons hidden when not hovered or
focused (for touch). Center using `calc` in both cases or maybe `-50%` margin
will work?

### Animate motion when adding and removing nodes and edges piece-wise

For my use case the graph will never update by anything other than an addition
or removal of a single node+edge. It should be simple to track updates chart to
chart and if such change is encountered, animate the values of all of the
existing nodes and edges and the new node and edge. This will make it easy to
notice when the order of branches has changed. Do not animate for other types
of changes, those can only be done through the code and not the UI controls.

### Remember successfully compiled code in local storage and recover on load

Also add a reset button to reset the initial code.
