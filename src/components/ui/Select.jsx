import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Select = forwardRef(({ className, options = [], error, placeholder, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={clsx(
        'w-full rounded-md border text-sm outline-none transition-colors px-3 py-2 bg-white text-gray-900 cursor-pointer',
        error 
          ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
          : 'border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:bg-gray-50',
        className
      )}
      {...props}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options && options.length > 0 && options.map((opt, i) => {
        const val = typeof opt === 'object' && opt !== null ? opt.value : opt;
        const lbl = typeof opt === 'object' && opt !== null ? (opt.label || opt.name || opt.value) : opt;
        return (
          <option key={i} value={val}>
            {lbl}
          </option>
        );
      })}
      {children}
    </select>
  );
});

Select.displayName = 'Select';
export default Select;
