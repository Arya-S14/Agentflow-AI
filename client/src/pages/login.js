import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { Zap, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('operator@agentflow.ai');
  const [password, setPassword] = useState('password123');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      router.push('/dashboard');
    }
  };

  return (
    <>
      <Head>
        <title>Sign In | Agentflow_AI</title>
      </Head>

      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-dark-surface border border-dark-border p-8 rounded-3xl shadow-2xl relative">
          <div className="flex items-center gap-3 justify-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-white tracking-tight">
              Agentflow<span className="text-brand-500">AI</span>
            </span>
          </div>

          <h2 className="text-xl font-bold text-center text-white mb-2">Welcome Back Operator</h2>
          <p className="text-xs text-slate-400 text-center mb-6">Sign in to control your AI multi-agent workflows</p>

          {error && (
            <div className="p-3 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm"
                  placeholder="operator@agentflow.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Console'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Don't have an operator account?{' '}
            <Link href="/register" className="text-brand-cyan hover:underline font-semibold">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
