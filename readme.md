# Dagre

- https://github.com/dagrejs/dagre/wiki
- https://github.com/dagrejs/graphlib/wiki

## Running

`npx serve .` for ESM and CORS to work (`file://` protocol won't work).

[GitHub Pages](https://tomashubelbauer.github.io/dagre)

## To-Do

### Add SVG `foreignObject` controls for adding nodes and edges

https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject

For this to keep in sync with the code, I first need to come up with a way to
serialize the graph into code so that whenever I add nodes/edges through the UI,
the code keeps reflecting the graph.
