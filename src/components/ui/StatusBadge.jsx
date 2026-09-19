import React from 'react';
import Badge from './Badge';
import { STATUS_COLORS } from '../../utils/constants';

export default function StatusBadge({ status, size = 'md' }) {
  // If the string maps to our constants, we extract the color class prefix.
  // E.g., 'bg-amber-100 text-amber-700' -> 'amber'
  const classStr = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
  let variant = 'default';
  
  if (classStr.includes('green')) variant = 'success';
  else if (classStr.includes('yellow')) variant = 'warning';
  else if (classStr.includes('red')) variant = 'error';
  else if (classStr.includes('blue')) variant = 'info';
  else if (classStr.includes('purple')) variant = 'info';
  else if (classStr.includes('amber')) variant = 'amber';

  const formatStatus = (s) => s?.replace(/_/g, ' ') || 'UNKNOWN';

  return (
    <Badge variant={variant} size={size} dot>
      {formatStatus(status)}
    </Badge>
  );
}
