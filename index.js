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
    // - `branch(originId, id, label=id)` to create an edge and a node together

    node('Root', '<img src="icon.png" width="16" height="16" />');

    branch('Root', 'Branch 1');
    branch('Branch 1', 'Branch 1-1');
    branch('Branch 1', 'Branch 1-2');

    node('Merge');
    edge('Branch 1-1', 'Merge');
    edge('Branch 1-2', 'Merge');

    branch('Root', 'Branch 2');
    branch('Branch 2', 'Branch 2-1');
  }

  let code = localStorage.getItem('code') ?? initial.toString().split(/\n/g).slice(1, -1).map(line => line.slice('    '.length)).join('\n') + '\n';
  let graph;

  codeTextArea.value = code;
  codeTextArea.addEventListener('input', () => {
    try {
      // Use a throwaway graph for the evaluation
      graph = new dagre.graphlib.Graph();
      eval(codeTextArea.value);
      evalDiv.textContent = '';
      code = codeTextArea.value;
      localStorage.setItem('code', code);
      frame();
    }
    catch (error) {
      evalDiv.textContent = 'Error: ' + error;
    }
  });

  layoutInput.addEventListener('change', () => {
    frame();
  });

  function measure(/** @type {HTMLElement} */ label) {
    testDiv.append(label);
    const { width, height } = testDiv.getBoundingClientRect();
    testDiv.innerHTML = '';
    return { label, width: ~~width, height: ~~height };
  }

  function node(/** @type {string} */ id, /** @type {string} */ label = id) {
    const div = document.createElement('div');
    div.className = 'nodeDiv';
    div.innerHTML = label;
    div.addEventListener('click', () => {
      const _label = prompt(label, label);
      if (!_label) {
        return;
      }

      code = code.replace(new RegExp(`'${label}'`, 'g'), `'${_label}'`);
      codeTextArea.value = code;
      frame();
    });

    graph.setNode(id, measure(div));
  }

  function branch(/** @type {string} */ originId, /** @type {string} */ id, /** @type {string} */ label = id) {
    node(id, label);
    edge(originId, id);
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
      foreignObject.setAttribute('y', ~~edge.points[1].y + clearance.top - 15 / 2);

      const button = document.createElement('button');
      button.textContent = '+';
      button.addEventListener('click', () => {
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

      foreignObject.append(button);
      svg.append(foreignObject);
    }

    for (const nodeId of graph.nodes()) {
      const node = graph.node(nodeId);

      // Handle incorrect graph definition without crashing
      if (!node) {
        continue;
      }

      const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
      foreignObject.setAttribute('height', node.height);
      foreignObject.setAttribute('width', node.width);
      foreignObject.setAttribute('x', ~~(node.x - node.width / 2) + clearance.left);
      foreignObject.setAttribute('y', ~~(node.y - node.height / 2) + clearance.top);

      const button = document.createElement('button');
      button.textContent = '+';
      button.className = 'nodeButton';
      button.addEventListener('click', () => {
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

      foreignObject.append(button, node.label);
      svg.append(foreignObject);
    }

    _svg.replaceWith(svg);
    _svg = svg;
  }

  frame();
});
