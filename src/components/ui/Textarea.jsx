import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Textarea = forwardRef(({ className, error, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={clsx(
        'w-full rounded-md border text-sm outline-none transition-colors px-3 py-2 text-gray-900 min-h-[100px] resize-y',
        error 
          ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
          : 'border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:bg-gray-50',
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
