import React from 'react';
import { clsx } from 'clsx';

export default function ProgressBar({ value, max = 100, color = 'bg-amber-500', showLabel = false }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full flex items-center gap-3">
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={clsx('h-full transition-all duration-300', color)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-600 w-8 text-right">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
