import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'error'
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'warning':
        return {
          icon: <AlertCircle className="h-8 w-8 text-yellow-500" />,
          bgColor: 'bg-yellow-900/20',
          textColor: 'text-yellow-400',
          borderColor: 'border-yellow-700'
        };
      case 'info':
        return {
          icon: <AlertCircle className="h-8 w-8 text-blue-500" />,
          bgColor: 'bg-blue-900/20',
          textColor: 'text-blue-400',
          borderColor: 'border-blue-700'
        };
      default: // error
        return {
          icon: <AlertCircle className="h-8 w-8 text-red-500" />,
          bgColor: 'bg-red-900/20',
          textColor: 'text-red-400',
          borderColor: 'border-red-700'
        };
    }
  };

  const { icon, bgColor, textColor, borderColor } = getIconAndColors();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden max-w-md w-full max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-semibold text-white">
            {title || t.general?.error || 'Error'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center`}>
              {icon}
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-300">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {t.payment?.close || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
