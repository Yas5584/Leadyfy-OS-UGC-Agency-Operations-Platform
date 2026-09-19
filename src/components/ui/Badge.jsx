import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Badge({ children, variant = 'default', size = 'md', dot = false, className = '' }) {
  const baseStyle = 'inline-flex items-center font-medium rounded-full';
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };

  const variants = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    default: 'bg-gray-100 text-gray-700'
  };

  const dotColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    amber: 'bg-amber-500',
    default: 'bg-gray-500'
  };

  return (
    <span className={twMerge(clsx(baseStyle, sizes[size], variants[variant], className))}>
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full mr-1.5', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
