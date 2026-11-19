import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/80',
      text: 'text-blue-600',
      border: 'border-blue-100',
      badge: 'text-blue-700 bg-blue-100',
    },
    amber: {
      bg: 'bg-amber-50/80',
      text: 'text-gold-600',
      border: 'border-amber-100',
      badge: 'text-amber-700 bg-amber-100',
    },
    emerald: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      badge: 'text-emerald-700 bg-emerald-100',
    },
    purple: {
      bg: 'bg-purple-50/80',
      text: 'text-purple-600',
      border: 'border-purple-100',
      badge: 'text-purple-700 bg-purple-100',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-premium transition-all hover:shadow-premium-hover">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-xl ${scheme.bg} ${scheme.border} border flex items-center justify-center ${scheme.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-3xl font-black text-navy-900 tracking-tight">{value}</h3>
        {subtext && (
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
