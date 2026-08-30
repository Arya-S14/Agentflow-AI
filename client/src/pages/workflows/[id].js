import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import NodePalette from '../../components/NodePalette/NodePalette';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../services/api';
import { Save, Play, ArrowLeft, GitFork, Check } from 'lucide-react';
import Link from 'next/link';

export default function WorkflowEditor() {
  const router = useRouter();
  const { id } = router.query;

  const { currentWorkflow, setWorkflow, nodes, edges } = useWorkflowStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchWorkflowDetails(id);
    }
  }, [id]);

  const fetchWorkflowDetails = async (workflowId) => {
    setLoading(true);
    try {
      const res = await api.get(`/workflows/${workflowId}`);
      setWorkflow(res.data.workflow);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await api.put(`/workflows/${id}`, {
        nodes,
        edges,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (e) {
      alert('Failed to save workflow changes');
    } finally {
      setSaving(false);
    }
  };

  const [executing, setExecuting] = useState(false);

  const handleExecute = async () => {
    if (!id || executing) return;
    setExecuting(true);

    try {
      // Non-blocking auto-save of current canvas graph
      api.put(`/workflows/${id}`, { nodes, edges }).catch(() => {});

      const res = await api.post(`/workflows/${id}/execute`);
      const execId = res.data?.executionId || res.data?.execution?._id;

      if (execId) {
        router.push(`/executions/${execId}`);
      } else {
        alert('Workflow execution triggered successfully!');
      }
    } catch (err) {
      console.error('[Workflow Execution Error]', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to trigger execution';
      alert(`Execution Error: ${errMsg}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>{currentWorkflow?.name || 'Workflow Editor'} | Agentflow_AI</title>
      </Head>

      <div className="flex flex-col h-screen bg-dark-bg text-slate-100 overflow-hidden">
        {/* Editor Top Toolbar */}
        <header className="h-16 bg-dark-surface border-b border-dark-border px-6 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/workflows" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-dark-border"></div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                {currentWorkflow?.name || 'Loading Workflow...'}
                <span className="text-[10px] bg-brand-500/20 text-brand-cyan px-2 py-0.5 rounded font-mono border border-brand-500/30">
                  v{currentWorkflow?.version || 1}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {currentWorkflow?.description || 'Visual Graph Canvas Editor'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-200 text-xs font-semibold transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-brand-cyan" />
                  {saving ? 'Saving...' : 'Save Workflow'}
                </>
              )}
            </button>

            <button
              onClick={handleExecute}
              disabled={executing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
            >
              <Play className="w-4 h-4 fill-white" />
              {executing ? 'Triggering Engine...' : 'Run Workflow'}
            </button>
          </div>
        </header>

        {/* Editor Main Canvas Body */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          <NodePalette />
          <div className="flex-1 relative h-full">
            {loading ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-500">
                Loading graph canvas...
              </div>
            ) : (
              <WorkflowCanvas />
            )}
          </div>
          <NodeConfigPanel />
        </div>
      </div>
    </ProtectedRoute>
  );
}
