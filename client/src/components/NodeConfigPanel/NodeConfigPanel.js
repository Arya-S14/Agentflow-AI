import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { X, Trash2, Save, SlidersHorizontal } from 'lucide-react';

export default function NodeConfigPanel() {
  const { selectedNode, setSelectedNode, updateNodeData, deleteNode } = useWorkflowStore();

  const [label, setLabel] = useState('');
  const [provider, setProvider] = useState('system');
  const [actionType, setActionType] = useState('execute');
  const [configJson, setConfigJson] = useState('{}');

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data?.label || '');
      setProvider(selectedNode.data?.provider || 'system');
      setActionType(selectedNode.data?.actionType || 'execute');
      setConfigJson(JSON.stringify(selectedNode.data?.config || {}, null, 2));
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const handleSave = () => {
    try {
      const parsedConfig = JSON.parse(configJson);
      updateNodeData(selectedNode.id, {
        label,
        provider,
        actionType,
        config: parsedConfig,
      });
    } catch (e) {
      alert('Invalid JSON in Configuration field.');
    }
  };

  return (
    <div className="w-80 bg-dark-surface border-l border-dark-border p-5 flex flex-col h-full overflow-y-auto animate-in slide-in-from-right duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-bold text-white">Node Inspector</h3>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Configuration Form */}
      <div className="flex-1 py-4 space-y-4 text-xs">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Step Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Integration / Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 capitalize"
          >
            <option value="system">System / Trigger</option>
            <option value="openrouter">OpenRouter AI</option>
            <option value="gemini">Google Gemini AI</option>
            <option value="gmail">Gmail</option>
            <option value="slack">Slack</option>
            <option value="google-sheets">Google Sheets</option>
            <option value="discord">Discord</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Action Type</label>
          <input
            type="text"
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Node Config (JSON)</label>
          <textarea
            rows={8}
            value={configJson}
            onChange={(e) => setConfigJson(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-white font-mono text-[11px] focus:outline-none focus:border-brand-500"
          ></textarea>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-dark-border flex items-center justify-between gap-2">
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>

        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-all shadow-md shadow-brand-600/30"
        >
          <Save className="w-3.5 h-3.5" />
          Apply Changes
        </button>
      </div>
    </div>
  );
}
