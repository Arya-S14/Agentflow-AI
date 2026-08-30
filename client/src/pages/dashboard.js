import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AppShell from '../components/AppShell/AppShell';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import MetricGrid from '../components/MetricGrid/MetricGrid';
import api from '../services/api';
import { Sparkles, Plus, Play, CheckCircle2, Clock, Activity, ArrowRight, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workflows/dashboard');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <ProtectedRoute>
      <Head>
        <title>Operator Dashboard | Agentflow_AI</title>
      </Head>

      <AppShell>
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Operator Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time multi-agent execution metrics and workflow activity overview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="p-2.5 rounded-xl bg-dark-surface border border-dark-border text-slate-400 hover:text-white transition-all"
              title="Refresh Dashboard Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/workflows/builder"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-accent hover:from-brand-500 hover:to-brand-600 text-white font-bold text-xs transition-all shadow-lg shadow-brand-600/30 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-brand-cyan" />
              AI Prompt Generator
            </Link>

            <Link
              href="/workflows/builder"
              className="px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border hover:border-slate-600 text-slate-200 font-semibold text-xs transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Workflow
            </Link>
          </div>
        </div>

        {/* Metric Grid KPIs */}
        <MetricGrid metrics={data?.metrics} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Executions Stream */}
          <div className="lg:col-span-2 bg-dark-surface border border-dark-border rounded-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-dark-border mb-4">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-base text-white">Recent Agent Executions</h3>
              </div>
              <Link href="/executions" className="text-xs text-brand-cyan hover:underline font-semibold flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">Loading recent runs...</div>
            ) : !data?.recentExecutions || data.recentExecutions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">No executions recorded yet. Trigger a workflow to test!</div>
            ) : (
              <div className="space-y-3">
                {data.recentExecutions.map((exec, idx) => (
                  <div
                    key={exec._id || idx}
                    className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <div>
                        <h4 className="font-semibold text-white">
                          {exec.workflowSnapshot?.name || 'Automation Flow'}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {exec.duration ? `${exec.duration}ms` : '1.4s'}
                          </span>
                          <span>ID: {exec._id?.substring(0, 12)}...</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {exec.status || 'COMPLETED'}
                      </span>
                      <Link
                        href={`/executions/${exec._id}`}
                        className="px-3 py-1.5 rounded-lg bg-dark-surface hover:bg-dark-hover border border-dark-border text-slate-300 font-semibold"
                      >
                        Inspect Logs
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live AI Activity & Agent memory feed */}
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-dark-border mb-4">
              <Activity className="w-5 h-5 text-brand-cyan" />
              <h3 className="font-bold text-base text-white">AI Agent Memory Feed</h3>
            </div>

            <div className="space-y-4 text-xs">
              {(data?.aiActivity || []).map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-dark-bg/60 border border-dark-border/80">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="font-mono text-[10px] text-brand-500 font-bold">AGENT_STEP</span>
                    <span className="text-[10px]">{item.time}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-normal">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
