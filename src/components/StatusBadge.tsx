import React from 'react';
import { CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface StatusBadgeProps {
  status: 'Pending' | 'Paid' | 'Refunded' | 'Expired';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useLanguage();
  
  const getStatusConfig = () => {
    switch (status) {
      case 'Pending':
        return {
          icon: Clock,
          text: t.status.pending,
          className: 'bg-yellow-100 text-gray-900 border-yellow-200',
        };
      case 'Paid':
        return {
          icon: CheckCircle,
          text: t.status.paid,
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'Refunded':
        return {
          icon: RefreshCw,
          text: t.status.refunded,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'Expired':
        return {
          icon: XCircle,
          text: t.status.expired,
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