import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import {
  Play,
  Pause,
  XSquare,
  ArrowLeft,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Code,
} from 'lucide-react';
import Link from 'next/link';

export default function ExecutionDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchExecutionData(id);
      fetchTimelineLogs(id);

      const socket = getSocket();
      if (socket) {
        socket.emit('subscribe_execution', id);

        const handleAgentEvent = (newEvent) => {
          if (newEvent.executionId.toString() === id.toString()) {
            setLogs((prev) => [...prev, newEvent]);
          }
        };

        socket.on('agent_event', handleAgentEvent);

        return () => {
          socket.emit('unsubscribe_execution', id);
          socket.off('agent_event', handleAgentEvent);
        };
      }
    }
  }, [id]);

  const fetchExecutionData = async (execId) => {
    try {
      const res = await api.get(`/executions/${execId}`);
      setExecution(res.data.execution);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimelineLogs = async (execId) => {
    try {
      const res = await api.get(`/executions/${execId}/timeline`);
      setLogs(res.data.logs || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePause = async () => {
    try {
      await api.post(`/executions/${id}/pause`);
      fetchExecutionData(id);
    } catch (e) {
      alert('Failed to pause execution');
    }
  };

  const handleResume = async () => {
    try {
      await api.post(`/executions/${id}/resume`);
      fetchExecutionData(id);
    } catch (e) {
      alert('Failed to resume execution');
    }
  };

  const handleCancel = async () => {
    try {
      await api.post(`/executions/${id}/cancel`);
      fetchExecutionData(id);
    } catch (e) {
      alert('Failed to cancel execution');
    }
  };

  const getAgentBadge = (agent) => {
    switch (agent) {
      case 'planner':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'execution':
        return 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30';
      case 'validation':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'recovery':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'monitoring':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Execution Timeline #{id?.substring(0, 8)} | Agentflow_AI</title>
      </Head>

      <AppShell>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/executions" className="p-2 rounded-lg bg-dark-surface border border-dark-border text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Execution Run Detail
                <span className="text-xs font-mono bg-dark-card border border-dark-border px-2.5 py-1 rounded-lg text-brand-cyan">
                  ID: {id}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Workflow: <strong className="text-slate-200">{execution?.workflowSnapshot?.name || 'Automation Flow'}</strong>
              </p>
            </div>
          </div>

          {/* Control Actions */}
          <div className="flex items-center gap-2">
            {execution?.status === 'RUNNING' && (
              <button
                onClick={handlePause}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30"
              >
                <Pause className="w-4 h-4" /> Pause Run
              </button>
            )}
            {execution?.status === 'PAUSED' && (
              <button
                onClick={handleResume}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30"
              >
                <Play className="w-4 h-4" /> Resume Run
              </button>
            )}
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30"
            >
              <XSquare className="w-4 h-4" /> Cancel Execution
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Stream Agent Timeline */}
          <div className="lg:col-span-2 bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-dark-border mb-6">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-base text-white">Multi-Agent Event Timeline Stream</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Socket.IO Live
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">Connecting live timeline stream...</div>
            ) : logs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">Initializing agent step stream...</div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-dark-border">
                {logs.map((log, idx) => (
                  <div key={idx} className="relative group">
                    <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-dark-surface border-2 border-brand-500 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></span>
                    </span>

                    <div className="p-4 rounded-xl bg-dark-bg/80 border border-dark-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getAgentBadge(log.agent)}`}>
                            {log.agent} agent
                          </span>
                          {log.nodeId && (
                            <span className="text-[10px] text-slate-400 font-mono">Node: {log.nodeId}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(log.timestamp || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-sans">{log.message}</p>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-3 p-3 rounded-lg bg-dark-card border border-dark-border text-[11px] font-mono text-slate-400 overflow-x-auto">
                          <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Execution Payload Inspector */}
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-xl h-fit space-y-6">
            <div>
              <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
                <Code className="w-4 h-4 text-brand-cyan" />
                Execution Outputs Payload
              </h3>
              <div className="p-4 rounded-xl bg-dark-bg/80 border border-dark-border font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64">
                <pre>{JSON.stringify(execution?.outputs || {}, null, 2)}</pre>
              </div>
            </div>

            <div className="pt-4 border-t border-dark-border text-xs text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span>Substrate Status:</span>
                <span className="text-slate-200 font-mono font-bold">LangGraph Available</span>
              </div>
              <div className="flex justify-between">
                <span>Retry Count:</span>
                <span className="text-slate-200 font-mono">{execution?.retryCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
