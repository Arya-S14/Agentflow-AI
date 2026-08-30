import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AppShell from '../components/AppShell/AppShell';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { User, ShieldCheck, Key, Database, Cpu, CheckCircle2, Lock } from 'lucide-react';

export default function Settings() {
  const { user } = useAuthStore();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const res = await api.get('/health');
      setHealth(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Settings & System Health | Agentflow_AI</title>
      </Head>

      <AppShell>
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Settings & Infrastructure Health
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Operator profile, security key status, database mode, and system heartbeat.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Operator Profile Card */}
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-dark-border">
              <div className="w-10 h-10 rounded-xl bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-cyan font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Operator Profile</h3>
                <span className="text-xs text-slate-400">Authenticated JWT Session</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  readOnly
                  value={user?.name || 'Operator User'}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value={user?.email || 'operator@agentflow.ai'}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Assigned Role</label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-brand-cyan font-mono font-bold capitalize">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{user?.role || 'operator'} Access</span>
                </div>
              </div>
            </div>
          </div>

          {/* System & Encryption Key Health */}
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-dark-border">
              <Database className="w-5 h-5 text-brand-cyan" />
              <div>
                <h3 className="font-bold text-base text-white">System Infrastructure Health</h3>
                <span className="text-xs text-slate-400">Database, BullMQ, and Encryption Key Health</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-dark-bg/80 border border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-brand-500" />
                  <div>
                    <h4 className="font-bold text-white">Database Substrate Mode</h4>
                    <span className="text-[11px] text-slate-400">MongoDB connection state</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  ● {health?.dbMode || 'Active Fallback'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-dark-bg/80 border border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-brand-cyan" />
                  <div>
                    <h4 className="font-bold text-white">BullMQ Job Queue Engine</h4>
                    <span className="text-[11px] text-slate-400">Background async task runner</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30">
                  ● {health?.queue?.mode || 'Active'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-dark-bg/80 border border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-purple-400" />
                  <div>
                    <h4 className="font-bold text-white">AES-256 Token Encryption</h4>
                    <span className="text-[11px] text-slate-400">CREDENTIAL_ENCRYPTION_KEY</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  ● Active at rest
                </span>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
