window.addEventListener('load', () => {
  const codeTextArea = document.getElementById('codeTextArea');
  const evalDiv = document.getElementById('evalDiv');
  const layoutInput = document.getElementById('layoutInput');
  const dataDiv = document.getElementById('dataDiv');

  function initial() {
    // API:
    // - `graph` from Dagre is available
    // - `measure(label): { label, width, height }` exists to measure label size
    // - `node(id, label=id)` is a shortcut for `graph.setNode(id, measure(label))`
    // - `edge(vId, wId)` is a shortcut for `graph.setEdge(vId, wId)`

    node('Root');

    node('Branch 1');
    edge('Root', 'Branch 1');

    node('Branch 1-1');
    edge('Branch 1', 'Branch 1-1');

    node('Branch 1-2');
    edge('Branch 1', 'Branch 1-2');

    node('Merge');
    edge('Branch 1-1', 'Merge');
    edge('Branch 1-2', 'Merge');

    node('Branch 2');
    edge('Root', 'Branch 2');

    node('Branch 2-1');
    edge('Branch 2', 'Branch 2-1');
  }

  let code = initial.toString().split(/\n/g).slice(1, -1).map(line => line.slice('    '.length)).join('\n') + '\n';
  let graph;

  codeTextArea.value = code;
  codeTextArea.addEventListener('input', () => {
    try {
      // Use a throwaway graph for the evaluation
      graph = new dagre.graphlib.Graph();
      eval(codeTextArea.value);
      evalDiv.textContent = '';
      code = codeTextArea.value;
      frame();
    }
    catch (error) {
      evalDiv.textContent = 'Error: ' + error;
    }
  });

  layoutInput.addEventListener('change', () => {
    frame();
  });

  const canvas = document.createElement('canvas');

  // Note that the canvas size does not need to be set (can be zero) for this to work
  const context = canvas.getContext('2d');
  const { fontWeight, fontSize, fontFamily } = window.getComputedStyle(document.body);
  context.font = `${fontWeight} ${fontSize} ${fontFamily}`;

  const spacing = 5;
  function measure(/** @type {string} */ label) {
    const metrics = context.measureText(label);
    return { label, width: ~~metrics.width + spacing * 2, height: Number.parseInt(fontSize) + spacing * 2 };
  }

  function node(/** @type {string} */ id, /** @type {string} */ label = id) {
    graph.setNode(id, measure(label));
  }

  function edge(/** @type {string} */ vId, /** @type {string} */ wId) {
    graph.setEdge(vId, wId);
  }

  let _svg = document.getElementById('graphSvg');
  function frame() {
    graph = new dagre.graphlib.Graph();

    // Configure graph label
    graph.setGraph({});

    // Configure edge label
    graph.setDefaultEdgeLabel(() => ({}));

    try {
      eval(code);
    }
    catch (error) {
      evalDiv.textContent = 'Error: ' + error;
    }

    if (!layoutInput.checked) {
      dataDiv.textContent = JSON.stringify(dagre.graphlib.json.write(graph), null, 2);
    }

    try {
      graph.graph().rankDir = 'BT';
      dagre.layout(graph);
    }
    catch (error) {
      evalDiv.textContent = 'Error: ' + error;
    }

    if (layoutInput.checked) {
      dataDiv.textContent = JSON.stringify(dagre.graphlib.json.write(graph), null, 2);
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('height', ~~graph.graph().height + 2);
    svg.setAttribute('width', ~~graph.graph().width + 2);

    for (const nodeId of graph.nodes()) {
      const node = graph.node(nodeId);

      // Handle incorrect graph definition without crashing
      if (!node) {
        continue;
      }

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('height', ~~node.height);
      rect.setAttribute('x', ~~(node.x - node.width / 2) + 1);
      rect.setAttribute('y', ~~(node.y - node.height / 2) + 1);
      rect.setAttribute('width', ~~node.width);
      svg.append(rect);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('x', ~~node.x + 1);
      text.setAttribute('y', ~~node.y + spacing + 1);
      text.textContent = node.label;
      svg.append(text);
    }

    for (const edgeId of graph.edges()) {
      const edge = graph.edge(edgeId);

      // Handle incorrect graph definition without crashing
      if (!edge || !edge.points) {
        continue;
      }

      const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      polyline.setAttribute('points', edge.points.map(point => (~~point.x + 1) + ',' + (~~point.y + 1)).join(' '));
      svg.append(polyline);
    }

    _svg.replaceWith(svg);
    _svg = svg;
  }

  frame();
});
