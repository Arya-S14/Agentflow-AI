import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AppShell from '../../components/AppShell/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import api from '../../services/api';
import { GitFork, Search, Plus, Play, Copy, Trash2, Edit, Sparkles } from 'lucide-react';

export default function WorkflowsList() {
  const [workflows, setWorkflows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workflows', { params: { search } });
      setWorkflows(res.data.workflows || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [search]);

  const handleDuplicate = async (id) => {
    try {
      await api.post(`/workflows/${id}/duplicate`);
      fetchWorkflows();
    } catch (e) {
      alert('Failed to duplicate workflow');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      fetchWorkflows();
    } catch (e) {
      alert('Failed to delete workflow');
    }
  };

  const handleTriggerRun = async (id) => {
    try {
      const res = await api.post(`/workflows/${id}/execute`);
      alert(`Execution triggered! Run ID: ${res.data.executionId}`);
    } catch (e) {
      alert('Execution failed to trigger');
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Workflows | Agentflow_AI</title>
      </Head>

      <AppShell>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Workflows Library
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage, edit, version, and execute visual workflow graphs.
            </p>
          </div>

          <div className="flex items-center gap-3">
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
              New Canvas
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflows by title or tags..."
            className="w-full bg-dark-surface border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Workflows Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">Loading workflows...</div>
        ) : workflows.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center gap-3">
            <GitFork className="w-10 h-10 text-slate-600 opacity-40" />
            <span>No workflows found. Create a new one or use the AI prompt generator!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((wf) => (
              <div
                key={wf._id || wf.id}
                className="p-6 rounded-2xl bg-dark-surface border border-dark-border hover:border-brand-500/40 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-500/10 text-brand-cyan border border-brand-500/30">
                      v{wf.version || 1} • {wf.status || 'draft'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {(wf.nodes || []).length} Nodes
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{wf.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {wf.description || 'Custom multi-agent operation graph.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {(wf.tags || ['automation']).map((tag, idx) => (
                      <span key={idx} className="text-[10px] bg-dark-bg px-2 py-0.5 rounded text-slate-400 border border-dark-border">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-dark-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/workflows/${wf._id || wf.id}`}
                      className="p-2 rounded-lg bg-dark-bg hover:bg-dark-hover border border-dark-border text-slate-300 hover:text-white"
                      title="Edit Canvas"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDuplicate(wf._id || wf.id)}
                      className="p-2 rounded-lg bg-dark-bg hover:bg-dark-hover border border-dark-border text-slate-300 hover:text-white"
                      title="Clone Workflow"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(wf._id || wf.id)}
                      className="p-2 rounded-lg bg-dark-bg hover:bg-rose-500/10 border border-dark-border text-slate-400 hover:text-rose-400"
                      title="Delete Workflow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleTriggerRun(wf._id || wf.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Execute
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
