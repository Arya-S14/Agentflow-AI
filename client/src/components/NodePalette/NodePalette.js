import React from 'react';
import { Zap, Sparkles, Mail, MessageSquare, Table, GitBranch, Plus } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

const nodeTemplates = [
  {
    type: 'trigger',
    provider: 'system',
    actionType: 'webhook_event',
    label: 'Webhook / Trigger',
    icon: Zap,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
  },
  {
    type: 'ai',
    provider: 'openrouter',
    actionType: 'generate_summary',
    label: 'AI Operator',
    icon: Sparkles,
    color: 'text-brand-cyan',
    bgColor: 'bg-brand-cyan/10 border-brand-cyan/30',
  },
  {
    type: 'integration',
    provider: 'gmail',
    actionType: 'send_email',
    label: 'Gmail Send Email',
    icon: Mail,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10 border-rose-500/30',
  },
  {
    type: 'integration',
    provider: 'slack',
    actionType: 'post_message',
    label: 'Slack Message',
    icon: MessageSquare,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
  },
  {
    type: 'integration',
    provider: 'google-sheets',
    actionType: 'append_row',
    label: 'Google Sheets Append',
    icon: Table,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
  },
  {
    type: 'condition',
    provider: 'system',
    actionType: 'evaluate_condition',
    label: 'Branch Condition',
    icon: GitBranch,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
  },
];

export default function NodePalette() {
  const addNode = useWorkflowStore((state) => state.addNode);

  const handleAdd = (item) => {
    addNode(item.type, item.provider, item.actionType);
  };

  return (
    <div className="w-64 bg-dark-surface border-r border-dark-border p-4 flex flex-col h-full overflow-y-auto">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Node Palette
      </h3>
      <div className="space-y-3">
        {nodeTemplates.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleAdd(item)}
              className={`w-full p-3 rounded-xl border ${item.bgColor} flex items-center justify-between text-left transition-all hover:scale-[1.02] group`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-xs font-semibold text-white">{item.label}</span>
              </div>
              <Plus className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </button>
          );
        })}
      </div>

      <div className="mt-8 p-3 rounded-xl bg-dark-bg/60 border border-dark-border text-[11px] text-slate-400">
        💡 <strong className="text-slate-200">Tip:</strong> Click any component node to append it to your active execution graph.
      </div>
    </div>
  );
}
