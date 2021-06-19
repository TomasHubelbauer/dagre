// TODO: Use https://web.dev/file-system-access if available
export default function load() {
  let graph;
  if (localStorage.getItem('dagre')) {
    graph = dagre.graphlib.json.read(JSON.parse(localStorage.getItem('dagre')));
  }
  else {
    graph = new dagre.graphlib.Graph();
    graph.setGraph({});
    graph.graph().rankDir = 'LR';
    dagre.layout(graph);

    localStorage.setItem('dagre', JSON.stringify(dagre.graphlib.json.write(graph)));
  }

  graph.setDefaultEdgeLabel(() => ({}));
  return graph;
}
