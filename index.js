window.addEventListener('load', () => {
  const testDiv = document.getElementById('testDiv');
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

  const spacing = 5;
  function measure(/** @type {string} */ label) {
    testDiv.innerHTML = label;
    const { width, height } = testDiv.getBoundingClientRect();
    testDiv.innerHTML = '';
    return { label, width: ~~width + spacing * 2, height: ~~height + spacing * 2 };
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

    const clearance = { left: 5, top: 15, right: 10, bottom: 5 };
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('height', ~~graph.graph().height + clearance.top + clearance.bottom);
    svg.setAttribute('width', ~~graph.graph().width + clearance.left + clearance.right);

    for (const nodeId of graph.nodes()) {
      const node = graph.node(nodeId);

      // Handle incorrect graph definition without crashing
      if (!node) {
        continue;
      }

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('height', ~~node.height);
      rect.setAttribute('width', ~~node.width);
      rect.setAttribute('x', ~~(node.x - node.width / 2) + clearance.left);
      rect.setAttribute('y', ~~(node.y - node.height / 2) + clearance.top);
      svg.append(rect);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('x', ~~node.x + clearance.left);
      text.setAttribute('y', ~~node.y + spacing + clearance.top);
      text.textContent = node.label;
      svg.append(text);

      text.addEventListener('click', () => {
        const label = prompt(node.label, node.label);
        if (!label) {
          return;
        }

        code = code.replace(new RegExp(`'${node.label}'`, 'g'), `'${label}'`);
        codeTextArea.value = code;
        frame();
      });

      const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
      foreignObject.setAttribute('height', 15);
      foreignObject.setAttribute('width', 15);
      foreignObject.setAttribute('x', ~~(node.x + node.width / 2) + clearance.left);
      foreignObject.setAttribute('y', ~~(node.y - node.height / 2) + clearance.top - 15);
      foreignObject.innerHTML = '+';
      svg.append(foreignObject);

      foreignObject.addEventListener('click', () => {
        let id = 1;
        while (code.includes(`'New${id === 1 ? '' : id}'`)) {
          id++;
        }

        id = `New${id === 1 ? '' : id}`;
        code += '\n';
        code += `node('${id}');\n`;
        code += `edge('${nodeId}', '${id}');\n`;
        codeTextArea.value = code;
        frame();
      });
    }

    for (const edgeId of graph.edges()) {
      const edge = graph.edge(edgeId);

      // Handle incorrect graph definition without crashing
      if (!edge || !edge.points) {
        continue;
      }

      const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      polyline.setAttribute('points', edge.points.map(point => (~~point.x + clearance.left) + ',' + (~~point.y + clearance.top)).join(' '));
      svg.append(polyline);

      const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
      foreignObject.setAttribute('height', 15);
      foreignObject.setAttribute('width', 15);
      foreignObject.setAttribute('x', ~~edge.points[1].x + clearance.left - 15 / 2);
      foreignObject.setAttribute('y', ~~edge.points[1].y + clearance.top);
      foreignObject.innerHTML = '+';
      svg.append(foreignObject);

      foreignObject.addEventListener('click', () => {
        let id = 1;
        while (code.includes(`'New${id === 1 ? '' : id}'`)) {
          id++;
        }

        id = `New${id === 1 ? '' : id}`;
        code += '\n';
        code += `node('${id}');\n`;
        code += `edge('${edgeId.v}', '${id}');\n`;
        code += `edge('${id}', '${edgeId.w}');\n`;
        code = code.replace(`edge('${edgeId.v}', '${edgeId.w}');\n`, '');
        code = code.replace(`edge('${edgeId.w}', '${edgeId.v}');\n`, '');
        codeTextArea.value = code;
        frame();
      });
    }

    _svg.replaceWith(svg);
    _svg = svg;
  }

  frame();
});
