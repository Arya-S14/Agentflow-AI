import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AppShell from '../components/AppShell/AppShell';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import api from '../services/api';
import { Mail, MessageSquare, Table, ShieldCheck, CheckCircle2, XCircle, Key, Lock, AlertCircle, X } from 'lucide-react';

const providersList = [
  {
    id: 'gmail',
    name: 'Gmail',
    desc: 'Send & read emails, draft message dispatches, and ingest inbox alerts.',
    icon: Mail,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/30',
    tokenLabel: 'Google OAuth Access Token / Refresh Token',
  },
  {
    id: 'slack',
    name: 'Slack Workspaces',
    desc: 'Post channel notifications, incoming webhooks, and team alerts.',
    icon: MessageSquare,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    tokenLabel: 'Slack Bot / User OAuth Access Token (xoxb-... or xoxp-...)',
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    desc: 'Read data ranges, append new rows, and sync tabular records.',
    icon: Table,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30',
    tokenLabel: 'Google OAuth Access Token (with spreadsheets scope)',
  },
  {
    id: 'discord',
    name: 'Discord Bot',
    desc: 'Post channel bot messages and trigger server automation hooks.',
    icon: MessageSquare,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/30',
    tokenLabel: 'Discord Bot Token / OAuth Token',
  },
];

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [statusHealth, setStatusHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  // Manual token modal state
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [manualToken, setManualToken] = useState('');
  const [manualAccount, setManualAccount] = useState('');
  const [savingToken, setSavingToken] = useState(false);
  const [modalError, setModalError] = useState(null);

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
        if (res.data.authUrl.includes('CONFIG_REQUIRED')) {
          const providerObj = providersList.find(p => p.id === providerId);
          setSelectedProvider(providerObj);
          setModalError(`OAuth Client ID is not configured in backend environment variables. Please connect using your ${providerId} API/Bot Token below.`);
          return;
        }
        window.location.href = res.data.authUrl;
      }
    } catch (e) {
      alert('OAuth initialization failed. You can connect using an API/Bot Token directly.');
    }
  };

  const handleOpenManualModal = (providerObj) => {
    setSelectedProvider(providerObj);
    setManualToken('');
    setManualAccount('');
    setModalError(null);
  };

  const handleSaveManualToken = async (e) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      setModalError('Please enter a valid Access Token or Bot Key.');
      return;
    }

    setSavingToken(true);
    setModalError(null);
    try {
      await api.post('/integrations', {
        provider: selectedProvider.id,
        credentials: {
          accessToken: manualToken.trim(),
          botToken: manualToken.trim(),
          connectedAccount: manualAccount.trim() || 'Connected via Direct Token',
        },
        scopes: ['full_access'],
      });

      setSelectedProvider(null);
      fetchIntegrations();
    } catch (err) {
      setModalError(err.response?.data?.error || err.message || 'Failed to save encrypted credentials');
    } finally {
      setSavingToken(false);
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
              Connect external OAuth tool providers with AES-256 application-level credential encryption.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-dark-surface border border-emerald-500/30 text-xs font-mono text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encryption Health: {statusHealth?.encryptionHealth || 'Active (AES-256)'}</span>
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
                    onClick={() => handleOpenManualModal(p)}
                    className="py-2.5 px-3 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                    title="Connect directly using API Key or Token"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Enter Token
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Token Entry Modal */}
        {selectedProvider && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-dark-surface border border-dark-border w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
              <button
                onClick={() => setSelectedProvider(null)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-card"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl border ${selectedProvider.bg} ${selectedProvider.color}`}>
                  <selectedProvider.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Connect {selectedProvider.name}</h3>
                  <p className="text-xs text-slate-400">Direct AES-256 Token Encryption</p>
                </div>
              </div>

              {modalError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveManualToken} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {selectedProvider.tokenLabel}
                  </label>
                  <input
                    type="password"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Enter Secret Token / OAuth Key..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-xs focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Account Email or Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={manualAccount}
                    onChange={(e) => setManualAccount(e.target.value)}
                    placeholder="e.g. operator@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProvider(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingToken}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-600/30 disabled:opacity-50"
                  >
                    {savingToken ? 'Encrypting & Saving...' : 'Save Encrypted Token'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
