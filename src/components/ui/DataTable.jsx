import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SkeletonTable } from './Skeleton';
import EmptyState from './EmptyState';

export default function DataTable({ 
  columns = [], 
  data = [], 
  onRowClick, 
  loading, 
  emptyMessage = "No records found.",
  emptyStateMessage,
  page = 1,
  totalPages = 1,
  onPageChange
}) {
  if (loading) return <SkeletonTable columns={columns.length || 4} rows={5} />;
  
  const displayEmpty = emptyMessage || emptyStateMessage || "No records found.";
  if (!data || data.length === 0) {
    return <EmptyState title="No Data" description={displayEmpty} />;
  }

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 border-b border-gray-200 text-xs uppercase tracking-wider font-semibold">
            <tr>
              {columns.map((col, idx) => (
                <th key={col.key || idx} className="px-6 py-3.5 whitespace-nowrap">
                  {col.label || col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={`bg-white transition-colors ${onRowClick ? 'cursor-pointer hover:bg-amber-50/40' : 'hover:bg-gray-50/50'}`}
              >
                {columns.map((col, colIndex) => {
                  const val = row[col.key];
                  return (
                    <td key={col.key || colIndex} className="px-6 py-4 whitespace-nowrap">
                      {col.render ? (
                        (() => {
                          try {
                            return col.render(val, row);
                          } catch (e) {
                            try {
                              return col.render(row);
                            } catch (e2) {
                              return '-';
                            }
                          }
                        })()
                      ) : (val !== undefined && val !== null ? String(val) : '-')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <span className="text-xs text-gray-500 font-medium">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page <= 1}
              onClick={() => onPageChange && onPageChange(page - 1)}
              className="p-1.5 rounded-md bg-white border border-gray-300 disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              disabled={page >= totalPages}
              onClick={() => onPageChange && onPageChange(page + 1)}
              className="p-1.5 rounded-md bg-white border border-gray-300 disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
