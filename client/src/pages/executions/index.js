import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AppShell from '../../components/AppShell/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { PlaySquare, Clock, Filter, Activity, ArrowRight, CheckCircle2, XCircle, PauseCircle } from 'lucide-react';

export default function ExecutionsList() {
  const [executions, setExecutions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/executions', { params: { status: statusFilter } });
      setExecutions(res.data.executions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();

    const socket = getSocket();
    if (socket) {
      const handleGlobalEvent = () => {
        fetchExecutions();
      };
      socket.on('global_execution_event', handleGlobalEvent);
      return () => {
        socket.off('global_execution_event', handleGlobalEvent);
      };
    }
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'FAILED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'RUNNING':
        return 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30 animate-pulse';
      case 'PAUSED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Executions History | Agentflow_AI</title>
      </Head>

      <AppShell>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Execution Logs & Timeline
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Audit trail of multi-agent runs, BullMQ queue events, and liveSocket updates.
            </p>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">All Run Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="RUNNING">Running</option>
              <option value="FAILED">Failed</option>
              <option value="PAUSED">Paused</option>
            </select>
          </div>
        </div>

        {/* Executions Table */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500">Loading execution runs...</div>
          ) : executions.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <PlaySquare className="w-8 h-8 text-slate-600 opacity-40" />
              <span>No execution logs found matching your filter criteria.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-bg/60 border-b border-dark-border text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Execution ID</th>
                    <th className="px-6 py-4">Workflow</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Start Time</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/60 text-slate-300">
                  {executions.map((exec) => (
                    <tr key={exec._id || exec.id} className="hover:bg-dark-hover/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-brand-cyan font-semibold">
                        {(exec._id || exec.id).substring(0, 14)}...
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        {exec.workflowSnapshot?.name || 'Automation Run'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusBadge(exec.status)}`}>
                          {exec.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400">
                        {exec.duration ? `${exec.duration}ms` : '1,240ms'}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(exec.startTime || exec.createdAt || Date.now()).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/executions/${exec._id || exec.id}`}
                          className="px-3 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600 text-brand-cyan hover:text-white border border-brand-500/30 font-semibold text-xs transition-all inline-flex items-center gap-1"
                        >
                          Live Timeline <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
