import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pending' | 'paid' | 'expired';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'Pendiente',
          className: 'bg-yellow-900 text-yellow-300 border-yellow-700'
        };
      case 'paid':
        return {
          icon: CheckCircle,
          text: 'Pagado',
          className: 'bg-green-900 text-green-300 border-green-700'
        };
      case 'expired':
        return {
          icon: XCircle,
          text: 'Expirado',
          className: 'bg-red-900 text-red-300 border-red-700'
        };
      default:
        return {
          icon: Clock,
          text: status,
          className: 'bg-gray-800 text-gray-300 border-gray-700'
        };
    }
  };

  const { icon: Icon, text, className } = getStatusConfig();

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm border ${className}`}>
      <Icon className="h-4 w-4" />
      <span>{text}</span>
    </div>
  );
};