import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { Zap, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('operator');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(name, email, password, role);
    if (result.success) {
      router.push('/dashboard');
    }
  };

  return (
    <>
      <Head>
        <title>Create Account | Agentflow_AI</title>
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

          <h2 className="text-xl font-bold text-center text-white mb-2">Create Operator Account</h2>
          <p className="text-xs text-slate-400 text-center mb-6">Register to manage multi-agent automation workflows</p>

          {error && (
            <div className="p-3 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

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
                  placeholder="operator@company.com"
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

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Role Separation</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm"
              >
                <option value="operator">Operator (Workflow Management)</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? 'Creating Account...' : 'Register & Enter Console'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Already registered?{' '}
            <Link href="/login" className="text-brand-cyan hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
