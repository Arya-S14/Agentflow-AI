import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

export default function NotificationsDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }

    const socket = getSocket();
    if (socket) {
      const handleNotif = (notif) => {
        setNotifications((prev) => [notif, ...prev]);
      };
      socket.on('global_notification', handleNotif);
      return () => {
        socket.off('global_notification', handleNotif);
      };
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-dark-surface border-l border-dark-border shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-500" />
            <h2 className="font-semibold text-lg text-white">Notifications Drawer</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-brand-cyan hover:underline font-medium"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-slate-500 text-sm">Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm flex flex-col items-center gap-2">
              <Bell className="w-8 h-8 text-slate-600 opacity-50" />
              <span>No execution notifications yet</span>
            </div>
          ) : (
            notifications.map((item, idx) => (
              <div
                key={item._id || idx}
                className={`p-4 rounded-xl border transition-all ${
                  item.isRead ? 'bg-dark-bg/40 border-dark-border opacity-75' : 'bg-dark-card border-brand-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
                  {item.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
                  {item.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                  {item.type !== 'success' && item.type !== 'error' && item.type !== 'warning' && (
                    <Info className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.message}</p>
                    <span className="text-[10px] text-slate-500 mt-2 block">
                      {new Date(item.createdAt || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
