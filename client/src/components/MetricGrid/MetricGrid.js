import React from 'react';
import { GitFork, Activity, PlaySquare, CheckCircle2 } from 'lucide-react';

export default function MetricGrid({ metrics }) {
  const stats = [
    {
      title: 'Total Workflows',
      value: metrics?.totalWorkflows ?? 0,
      change: '+2 this week',
      icon: GitFork,
      color: 'text-brand-500',
      bgColor: 'bg-brand-500/10',
      borderColor: 'border-brand-500/20',
    },
    {
      title: 'Active Workflows',
      value: metrics?.activeWorkflows ?? 0,
      change: 'Operational',
      icon: Activity,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Total Executions',
      value: metrics?.totalExecutions ?? 0,
      change: 'BullMQ Queued',
      icon: PlaySquare,
      color: 'text-brand-cyan',
      bgColor: 'bg-brand-cyan/10',
      borderColor: 'border-brand-cyan/20',
    },
    {
      title: 'Success Rate',
      value: metrics?.successRate ?? '100%',
      change: 'Agent Verified',
      icon: CheckCircle2,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`p-6 rounded-2xl bg-dark-surface border ${stat.borderColor} transition-all duration-200 hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {stat.title}
              </span>
              <div className={`p-2.5 rounded-xl ${stat.bgColor} ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {stat.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
