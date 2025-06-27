import React from 'react';
import { CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';

interface StatusBadgeProps {
  status: 'Pending' | 'Paid' | 'Refunded' | 'Expired';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Pending':
        return {
          icon: Clock,
          text: 'Pendiente',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'Paid':
        return {
          icon: CheckCircle,
          text: 'Pagado',
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'Refunded':
        return {
          icon: RefreshCw,
          text: 'Reembolsado',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'Expired':
        return {
          icon: XCircle,
          text: 'Expirado',
          className: 'bg-red-100 text-red-800 border-red-200',
        };
      default:
        return {
          icon: Clock,
          text: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const { icon: Icon, text, className } = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {text}
    </span>
  );
};