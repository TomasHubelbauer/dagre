import measure from './measure.js';
import load from './load.js';
import save from './save.js';

window.addEventListener('load', () => {
  const graph = load();

  document.body.addEventListener('click', () => {
    const label = prompt('Label:');
    if (!label) {
      return;
    }

    const id = graph.nodeCount();
    graph.setNode(id, measure(label));

    save(graph);
  });

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('height', ~~graph.graph().height);
  svg.setAttribute('width', ~~graph.graph().width);

  for (const edgeId of graph.edges()) {
    const edge = graph.edge(edgeId);

    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', edge.points.map(point => ~~point.x + ',' + ~~point.y).join(' '));
    polyline.addEventListener('click', event => {
      event.stopPropagation();

      const action = prompt('remove (0) | split (1 or type label)');
      switch (action) {
        case null:
        case '': {
          return;
        }
        case '0':
        case 'remove': {
          graph.removeEdge(edgeId.v, edgeId.w);
          break;
        }
        case '1':
        case 'split':
        default: {
          const label = (action !== '1' && action !== 'split') ? action : prompt('Label:');
          if (!label) {
            return;
          }

          const id = graph.nodeCount();
          graph.setNode(id, measure(label));
          graph.setEdge(edgeId.v, id);
          graph.setEdge(id, edgeId.w);
          graph.removeEdge(edgeId.v, edgeId.w);
          break;
        }
      }

      save(graph);
    });

    svg.append(polyline);
  }

  for (const nodeId of graph.nodes()) {
    const node = graph.node(nodeId);

    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('height', node.height);
    foreignObject.setAttribute('width', node.width);
    foreignObject.setAttribute('x', ~~(node.x - node.width / 2));
    foreignObject.setAttribute('y', ~~(node.y - node.height / 2));
    foreignObject.setAttribute('class', 'node');
    foreignObject.addEventListener('click', event => {
      event.stopPropagation();

      const action = prompt('remove (0) | rename (1) | branch (2 or type label)');
      switch (action) {
        case null:
        case '': {
          return;
        }
        case '0':
        case 'remove': {
          graph.removeNode(nodeId);
          break;
        }
        case '1':
        case 'rename': {
          const label = prompt('Label:', node.label);
          if (!label) {
            return;
          }

          graph.setNode(nodeId, measure(label));
          break;
        }
        case '2':
        case 'branch':
        default: {
          const label = (action !== '2' && action !== 'branch') ? action : prompt('Label:');
          if (!label) {
            return;
          }

          const id = graph.nodeCount();
          graph.setNode(id, measure(label));
          graph.setEdge(nodeId, id);
          break;
        }
      }

      save(graph);
    });

    foreignObject.append(node.label);
    svg.append(foreignObject);
  }

  document.body.append(svg);
});
