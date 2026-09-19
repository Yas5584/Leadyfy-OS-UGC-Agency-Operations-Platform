import React from 'react';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';

export default function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={clsx('relative flex items-center', className)}>
      <Search className="absolute left-3 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
      />
      {value && (
        <button 
          onClick={() => onChange({ target: { value: '' }})} 
          className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
