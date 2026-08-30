import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Sparkles, Mail, MessageSquare, Table, GitBranch, Terminal } from 'lucide-react';

const getIcon = (provider, type) => {
  if (provider === 'gmail') return Mail;
  if (provider === 'slack') return MessageSquare;
  if (provider === 'google-sheets') return Table;
  if (type === 'trigger') return Zap;
  if (type === 'ai' || provider === 'openrouter' || provider === 'gemini') return Sparkles;
  if (type === 'condition') return GitBranch;
  return Terminal;
};

const getBadgeStyle = (provider, type) => {
  if (type === 'trigger') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  if (type === 'ai') return 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40';
  if (provider === 'gmail') return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  if (provider === 'slack') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  if (provider === 'google-sheets') return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
  return 'bg-brand-500/20 text-brand-500 border-brand-500/40';
};

export function CustomWorkflowNode({ data, selected }) {
  const Icon = getIcon(data?.provider, data?.type);
  const badgeStyle = getBadgeStyle(data?.provider, data?.type);

  return (
    <div
      className={`w-64 p-4 rounded-xl bg-dark-card border-2 transition-all duration-200 ${
        selected ? 'border-brand-500 shadow-xl shadow-brand-500/20 ring-2 ring-brand-500/30' : 'border-dark-border hover:border-slate-600'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-brand-500 border-2 border-dark-card" />
      
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border ${badgeStyle}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-tight">{data?.label || 'Workflow Node'}</h4>
            <span className="text-[10px] text-slate-400 font-mono uppercase">{data?.provider || 'system'}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-dark-border/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Action:</span>
        <span className="text-slate-200">{data?.actionType || 'execute'}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-brand-500 border-2 border-dark-card" />
    </div>
  );
}

export const nodeTypes = {
  trigger: CustomWorkflowNode,
  ai: CustomWorkflowNode,
  integration: CustomWorkflowNode,
  condition: CustomWorkflowNode,
  action: CustomWorkflowNode,
};
