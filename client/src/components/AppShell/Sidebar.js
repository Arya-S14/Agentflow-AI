import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  GitFork,
  PlaySquare,
  Plug,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Builder', href: '/workflows/builder', icon: Sparkles },
  { name: 'Workflows', href: '/workflows', icon: GitFork },
  { name: 'Executions', href: '/executions', icon: PlaySquare },
  { name: 'Integrations', href: '/integrations', icon: Plug },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className="w-64 bg-dark-surface border-r border-dark-border flex flex-col justify-between hidden md:flex">
      <div>
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-dark-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-accent to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              Agentflow<span className="text-brand-500 font-extrabold">AI</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">AI Ops Automation</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-dark-hover'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Engine Status Footer */}
      <div className="p-4 m-4 rounded-xl bg-dark-bg/60 border border-dark-border text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-slate-300">Agent Chain: Active</span>
        </div>
        <span className="text-[10px] text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded font-mono">v1.0</span>
      </div>
    </aside>
  );
}
