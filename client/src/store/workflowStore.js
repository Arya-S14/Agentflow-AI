import { create } from 'zustand';

export const useWorkflowStore = create((set, get) => ({
  currentWorkflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isGenerating: false,
  isSaving: false,

  setWorkflow: (workflow) => {
    set({
      currentWorkflow: workflow,
      nodes: workflow?.nodes || [],
      edges: workflow?.edges || [],
      selectedNode: null,
    });
  },

  setNodes: (nodes) => {
    if (typeof nodes === 'function') {
      set({ nodes: nodes(get().nodes) });
    } else {
      set({ nodes });
    }
  },

  setEdges: (edges) => {
    if (typeof edges === 'function') {
      set({ edges: edges(get().edges) });
    } else {
      set({ edges });
    }
  },

  setSelectedNode: (node) => set({ selectedNode: node }),

  updateNodeData: (nodeId, newData) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      }),
    });

    if (get().selectedNode?.id === nodeId) {
      set({
        selectedNode: {
          ...get().selectedNode,
          data: {
            ...get().selectedNode.data,
            ...newData,
          },
        },
      });
    }
  },

  addNode: (type, provider, actionType, position) => {
    const newNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: type || 'action',
      position: position || { x: 250, y: (get().nodes.length + 1) * 120 },
      data: {
        label: `New ${provider || type} Step`,
        provider: provider || 'system',
        actionType: actionType || 'execute',
        config: {},
      },
    };

    set({ nodes: [...get().nodes, newNode] });
    return newNode;
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
    });
  },
}));
