import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse flex flex-col h-32 justify-between">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2 mt-4"></div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-3 animate-pulse w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-4 bg-gray-200 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}></div>
      ))}
    </div>
  );
}

export function SkeletonTable({ columns = 4, rows = 5 }) {
  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-pulse">
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex gap-6">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
        ))}
      </div>
      <div className="divide-y divide-gray-100 p-2">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex gap-6 items-center">
             {Array.from({ length: columns }).map((_, colIndex) => (
               <div key={colIndex} className="h-4 bg-gray-100 rounded flex-1"></div>
             ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkeletonTable;
