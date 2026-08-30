import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import api from '../../services/api';
import { Sparkles, ArrowRight, CheckCircle2, Zap, Play } from 'lucide-react';

const examplePrompts = [
  'Process incoming invoice PDFs, run AI extraction, append to Google Sheets, and notify Slack channel.',
  'Monitor Gmail for high-priority support emails, summarize with AI, and alert Discord bot channel.',
  'Read sheet data range, filter inactive leads with AI, and dispatch Gmail notification sequence.',
];

export default function AIWorkflowBuilder() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/workflows/generate', { prompt });
      setGeneratedWorkflow(res.data.workflow);
    } catch (err) {
      alert('Error generating workflow graph from AI provider.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCanvas = () => {
    if (generatedWorkflow) {
      router.push(`/workflows/${generatedWorkflow._id || generatedWorkflow.id}`);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>AI Workflow Generator | Agentflow_AI</title>
      </Head>

      <AppShell>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-cyan text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Prompt-to-Workflow Engine
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Describe Your Automation Workflow
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Our AI engine automatically transforms natural language specifications into complete, executable React Flow node graphs.
            </p>
          </div>

          {/* Prompt Input Form */}
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-xl mb-8">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Automation Specification / Operator Prompt
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Fetch Google Sheet leads, analyze priority via AI, send email via Gmail..."
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 leading-relaxed font-sans"
                ></textarea>
              </div>

              {/* Preset Sample Prompts */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">Sample Prompts:</span>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(p)}
                      className="text-[11px] bg-dark-bg hover:bg-dark-hover text-slate-300 border border-dark-border px-3 py-1.5 rounded-lg text-left transition-colors"
                    >
                      💡 {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-accent hover:from-brand-500 hover:to-brand-600 text-white font-bold text-xs transition-all shadow-lg shadow-brand-600/30 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-brand-cyan" />
                      Synthesizing Graph...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-brand-cyan" />
                      Generate Workflow Graph
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Generated Workflow Preview Card */}
          {generatedWorkflow && (
            <div className="bg-dark-surface border border-brand-500/40 rounded-2xl p-6 shadow-2xl animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-dark-border mb-4">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-base text-white">{generatedWorkflow.name}</h3>
                    <span className="text-xs text-slate-400">{generatedWorkflow.description}</span>
                  </div>
                </div>
                <button
                  onClick={handleOpenCanvas}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center gap-2"
                >
                  Open in Interactive Canvas <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-dark-bg/80 border border-dark-border font-mono text-xs">
                <span className="text-slate-400 block mb-2 font-bold text-[11px] uppercase tracking-wider">
                  Generated Graph Topology ({(generatedWorkflow.nodes || []).length} Nodes):
                </span>
                <div className="space-y-2">
                  {(generatedWorkflow.nodes || []).map((node, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300">
                      <span className="text-brand-cyan font-bold">{i + 1}.</span>
                      <span className="bg-dark-card px-2 py-0.5 rounded text-white font-semibold">{node.data?.label}</span>
                      <span className="text-slate-500">[{node.data?.provider} → {node.data?.actionType}]</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
