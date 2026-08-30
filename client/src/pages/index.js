import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Zap, Sparkles, Shield, Cpu, ArrowRight, Play, CheckCircle2, GitFork, MessageSquare, Mail } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Head>
        <title>Agentflow_AI | Agentic AI Operations Automation Platform</title>
      </Head>

      <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-brand-500 selection:text-white">
        {/* Top Navbar */}
        <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-accent to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              Agentflow<span className="text-brand-500">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50"
            >
              Get Started Free
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center relative">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/15 rounded-full blur-[140px] pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-cyan text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            Multi-Agent Orchestration Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            Describe Automations in Plain English.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-cyan via-brand-500 to-brand-accent">
              Run Executable AI Workflows.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Turn natural language prompts into visual drag-and-drop workflow graphs, executed seamlessly by cooperating AI agents with third-party tool integrations.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/workflows/builder"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-accent hover:from-brand-500 hover:to-brand-600 text-white font-bold text-base transition-all shadow-xl shadow-brand-600/30 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-brand-cyan" />
              Build Workflow with AI
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-dark-surface border border-dark-border hover:border-slate-600 text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 text-emerald-400" />
              Open Operator Console
            </Link>
          </div>

          {/* Interactive Agent Showcase Grid */}
          <div className="mt-20 p-8 rounded-3xl bg-dark-surface/80 border border-dark-border shadow-2xl relative overflow-hidden backdrop-blur-xl text-left">
            <div className="flex items-center justify-between pb-6 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="ml-3 text-xs font-mono text-slate-400">Agentic Engine Pipeline Live Trace</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                ● STATUS: RUNNING
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
              {[
                { name: 'Planner Agent', desc: 'Topological graph sorting & confidence scoring', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
                { name: 'Execution Agent', desc: 'Runs third-party APIs & LLM prompt calls', color: 'text-brand-cyan', bg: 'bg-brand-cyan/10 border-brand-cyan/30' },
                { name: 'Validation Agent', desc: 'Schema checks & missing field enforcement', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
                { name: 'Recovery Agent', desc: 'Self-healing retries with backoff & escalation', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
                { name: 'Monitoring Agent', desc: 'Emits Socket.IO real-time timeline logs', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
              ].map((agent, i) => (
                <div key={i} className={`p-4 rounded-xl border ${agent.bg} transition-all hover:scale-105`}>
                  <div className={`text-xs font-bold ${agent.color} mb-1 flex items-center gap-1.5`}>
                    <Cpu className="w-4 h-4" />
                    {agent.name}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{agent.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-dark-border/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-dark-surface border border-dark-border">
              <div className="p-3 rounded-xl bg-brand-500/10 text-brand-500 w-fit mb-6">
                <GitFork className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">React Flow Canvas</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Full visual editor with custom nodes, animated edges, drag-from-palette node creation, and side-panel configuration.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-dark-surface border border-dark-border">
              <div className="p-3 rounded-xl bg-brand-cyan/10 text-brand-cyan w-fit mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">OAuth & Credentials</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Seamless OAuth integrations for Gmail, Slack, Discord, and Google Sheets encrypted at rest with application-level AES-256 keys.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-dark-surface border border-dark-border">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-6">
                <Play className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Background Queue & Timeline</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                BullMQ background scheduling with Socket.IO real-time timeline event streaming to keep operators fully updated.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-dark-border py-12 text-center text-xs text-slate-500">
          <p>© 2026 Agentflow_AI Platform. Built for autonomous AI operations.</p>
        </footer>
      </div>
    </>
  );
}
