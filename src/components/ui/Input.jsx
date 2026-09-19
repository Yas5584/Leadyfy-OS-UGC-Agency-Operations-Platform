import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(({ className, icon: Icon, error, ...props }, ref) => {
  return (
    <div className="relative flex w-full">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        ref={ref}
        className={clsx(
          'w-full rounded-md border text-sm outline-none transition-colors px-3 py-2 text-gray-900',
          Icon && 'pl-10',
          error 
            ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
            : 'border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:bg-gray-50',
          className
        )}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
