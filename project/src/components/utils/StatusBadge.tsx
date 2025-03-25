import React from 'react';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
  // Default color mappings
  const colorMap: Record<StatusType, string> = {
    success: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
    pending: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  // Map common property management statuses to our types
  const normalizedStatus = (): StatusType => {
    const s = status.toLowerCase();
    if (['paid', 'completed', 'resolved', 'approved', 'current'].includes(s)) return 'success';
    if (['pending', 'processing', 'in progress', 'waiting'].includes(s)) return 'pending';
    if (['warning', 'late', 'overdue', 'attention'].includes(s)) return 'warning';
    if (['error', 'failed', 'rejected', 'unpaid', 'eviction'].includes(s)) return 'error';
    if (['info', 'notice', 'note'].includes(s)) return 'info';
    return 'info';
  };

  const displayLabel = label || status;
  const type = normalizedStatus();
  const colors = colorMap[type] || colorMap.info;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors} ${className}`}>
      {displayLabel}
    </span>
  );
};

export default StatusBadge; 