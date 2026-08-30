import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import NotificationsDrawer from './NotificationsDrawer';
import { Bell, User, LogOut, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <header className="h-16 bg-dark-surface border-b border-dark-border px-6 flex items-center justify-between">
        {/* Breadcrumb / Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-mono text-slate-400">Cluster: Local Dev</span>
          </div>
        </div>

        {/* User Actions & Notification Drawer trigger */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-hover relative transition-all"
            title="Notifications Drawer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
          </button>

          <div className="h-6 w-px bg-dark-border"></div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-cyan text-xs font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-white flex items-center gap-1">
                {user?.name || 'Operator'}
                {user?.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">{user?.role || 'operator'}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <NotificationsDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
