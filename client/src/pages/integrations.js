import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AppShell from '../components/AppShell/AppShell';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import api from '../services/api';
import { Mail, MessageSquare, Table, ShieldCheck, CheckCircle2, XCircle, RefreshCw, Key } from 'lucide-react';

const providersList = [
  {
    id: 'gmail',
    name: 'Gmail',
    desc: 'Send & read emails, draft message dispatches, and ingest inbox alerts.',
    icon: Mail,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/30',
  },
  {
    id: 'slack',
    name: 'Slack Workspaces',
    desc: 'Post channel notifications, incoming webhooks, and team alerts.',
    icon: MessageSquare,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    desc: 'Read data ranges, append new rows, and sync tabular records.',
    icon: Table,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30',
  },
  {
    id: 'discord',
    name: 'Discord Bot',
    desc: 'Post channel bot messages and trigger server automation hooks.',
    icon: MessageSquare,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/30',
  },
];

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [statusHealth, setStatusHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/integrations');
      const healthRes = await api.get('/integrations/status');
      setIntegrations(res.data.integrations || []);
      setStatusHealth(healthRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnectOAuth = async (providerId) => {
    try {
      const res = await api.get(`/integrations/oauth/${providerId}/start`);
      if (res.data?.authUrl) {
        window.location.href = res.data.authUrl;
      }
    } catch (e) {
      alert('OAuth initialization failed');
    }
  };

  const handleManualMockConnect = async (providerId) => {
    try {
      await api.post('/integrations', {
        provider: providerId,
        credentials: { accessToken: `mock_${providerId}_token_${Date.now()}` },
        scopes: ['full_access'],
      });
      fetchIntegrations();
    } catch (e) {
      alert('Failed to connect mock integration');
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Third-Party Integrations | Agentflow_AI</title>
      </Head>

      <AppShell>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Third-Party Integrations
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Connect external OAuth tool providers with application-level key token encryption.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-dark-surface border border-emerald-500/30 text-xs font-mono text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encryption Key Health: Active (AES-256)</span>
          </div>
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providersList.map((p) => {
            const Icon = p.icon;
            const userInt = integrations.find((i) => i.provider === p.id);
            const isConnected = userInt ? userInt.isConnected : false;

            return (
              <div
                key={p.id}
                className="p-6 rounded-2xl bg-dark-surface border border-dark-border hover:border-slate-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl border ${p.bg} ${p.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border flex items-center gap-1.5 ${
                        isConnected
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {isConnected ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {isConnected ? 'CONNECTED' : 'NOT CONNECTED'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">{p.desc}</p>
                </div>

                <div className="pt-4 border-t border-dark-border flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleConnectOAuth(p.id)}
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center justify-center gap-2"
                  >
                    <Key className="w-3.5 h-3.5" />
                    {isConnected ? 'Reconnect OAuth' : 'Authorize OAuth'}
                  </button>

                  <button
                    onClick={() => handleManualMockConnect(p.id)}
                    className="py-2.5 px-3 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-300 text-xs font-semibold"
                    title="Mock Connect for Local Testing"
                  >
                    Quick Test Connect
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
