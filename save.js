// TODO: Use https://web.dev/file-system-access if available
export default function save(graph) {
  dagre.layout(graph);
  localStorage.setItem('dagre', JSON.stringify(dagre.graphlib.json.write(graph)));

  // TODO: Replace this with a normal re-render
  location.reload();
}
