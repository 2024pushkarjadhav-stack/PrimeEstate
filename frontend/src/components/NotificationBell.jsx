import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Home, Calendar, Clock, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, clearNotifications, markAllRead, socketConnected } =
    useApp();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && unreadCount > 0 && markAllRead) {
      markAllRead();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'property':
        return <Home className="w-4 h-4 text-emerald-600" />;
      case 'appointment':
      case 'appointment_update':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-gold-500" />;
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const diff = Math.floor((new Date() - new Date(isoString)) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return new Date(isoString).toLocaleDateString();
    } catch (e) {
      return 'Recent';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        title={socketConnected ? 'Real-time WebSocket Connected' : 'Connecting to WebSocket...'}
        className={`relative p-2 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500/30 ${
          isOpen ? 'bg-slate-100 text-navy-900' : ''
        }`}
      >
        <Bell className="w-5 h-5 stroke-[2]" />

        {/* Live Socket Connection Dot */}
        <span
          className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ring-2 ring-white ${
            socketConnected ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
          title={socketConnected ? 'WebSocket Online' : 'WebSocket Reconnecting'}
        />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gold-600 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center ring-2 ring-white animate-bounce shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-navy-900 to-navy-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-wide">Live Notifications</span>
              <span
                className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  socketConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {socketConnected ? (
                  <>
                    <Wifi className="w-3 h-3" /> Live
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" /> Offline
                  </>
                )}
              </span>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-slate-300 hover:text-red-300 transition-colors flex items-center gap-1"
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {/* Body / List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Bell className="w-6 h-6 stroke-[1.5]" />
                </div>
                <p className="text-sm font-semibold text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[220px] mx-auto">
                  New property listings and site visit updates will appear here in real time.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id || notif._id || Math.random()}
                  className={`p-3.5 hover:bg-slate-50/80 transition-colors flex gap-3 items-start ${
                    !notif.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-navy-900 truncate">
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {formatTime(notif.timestamp || notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-gold-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-600">
              ⚡ Powered by Socket.IO WebSocket (Exp 8)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
