/**
 * Planner Agent
 * Decides node ordering via topological sorting and emits confidence score.
 */
class PlannerAgent {
  constructor() {
    this.name = 'planner';
  }

  plan(workflowSnapshot) {
    const nodes = workflowSnapshot.nodes || [];
    const edges = workflowSnapshot.edges || [];

    if (nodes.length === 0) {
      return {
        executionOrder: [],
        confidenceScore: 0.0,
        reasoning: 'Empty workflow graph.',
      };
    }

    // Topological Sort algorithm
    const inDegree = new Map();
    const adjList = new Map();

    nodes.forEach((n) => {
      inDegree.set(n.id, 0);
      adjList.set(n.id, []);
    });

    edges.forEach((e) => {
      if (adjList.has(e.source) && inDegree.has(e.target)) {
        adjList.get(e.source).push(e.target);
        inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
      }
    });

    const queue = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) queue.push(nodeId);
    });

    const executionOrder = [];
    while (queue.length > 0) {
      const curr = queue.shift();
      executionOrder.push(curr);

      const neighbors = adjList.get(curr) || [];
      neighbors.forEach((nbr) => {
        inDegree.set(nbr, inDegree.get(nbr) - 1);
        if (inDegree.get(nbr) === 0) {
          queue.push(nbr);
        }
      });
    }

    // Handle remaining nodes in case of cycles or disconnected nodes
    if (executionOrder.length < nodes.length) {
      nodes.forEach((n) => {
        if (!executionOrder.includes(n.id)) {
          executionOrder.push(n.id);
        }
      });
    }

    const confidenceScore = executionOrder.length === nodes.length ? 0.98 : 0.85;

    return {
      executionOrder,
      confidenceScore,
      totalSteps: executionOrder.length,
      reasoning: `Topological planning resolved ${executionOrder.length} sequential execution steps.`,
    };
  }
}

module.exports = new PlannerAgent();
