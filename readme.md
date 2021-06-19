# Dagre

Dagre library playground.

## Running

[GitHub Pages](https://tomashubelbauer.github.io/dagre)

`npx serve .` for ESM and CORS to work (`file://` protocol won't work).

## Documentation

Dagre documentation:

- https://github.com/dagrejs/dagre/wiki
- https://github.com/dagrejs/graphlib/wiki

## To-Do

## Remove node if it is the only node at the side of an edge being removed

If the incident node has no other connections, remove it with the edge.

## Implement https://web.dev/file-system-access load/save where supported

Keep local storage as a fallback for the demo in browsers where it is not and
maybe add load and save buttons for that case.
