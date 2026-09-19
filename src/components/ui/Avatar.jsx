import React from 'react';
import { getInitials } from '../../utils/formatters';
import { clsx } from 'clsx';

export default function Avatar({ name, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  return (
    <div className={clsx('rounded-full bg-amber-500 text-white flex items-center justify-center font-medium shrink-0', sizes[size], className)}>
      {getInitials(name)}
    </div>
  );
}
