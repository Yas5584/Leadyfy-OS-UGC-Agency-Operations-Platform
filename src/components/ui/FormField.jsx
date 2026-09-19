import React from 'react';
import { clsx } from 'clsx';

export default function FormField({ label, error, required, children, className = '' }) {
  return (
    <div className={clsx('flex flex-col gap-1 mb-4', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
