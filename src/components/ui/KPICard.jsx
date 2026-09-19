import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

export default function KPICard({ title, value, change, changeType, icon: Icon, color = 'amber' }) {
  const isUp = changeType === 'up';
  
  const colorClasses = {
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {Icon && (
          <div className={clsx('p-2 rounded-lg', colorClasses[color] || colorClasses.amber)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {change && (
          <span className={clsx(
            'flex items-center text-xs font-medium',
            isUp ? 'text-green-600' : 'text-red-600'
          )}>
            {isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
