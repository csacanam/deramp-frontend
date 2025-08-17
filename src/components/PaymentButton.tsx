import React from 'react';
import { Wallet } from 'lucide-react';
import { usePaymentButton } from '../hooks/usePaymentButton';
import { PaymentOption } from '../blockchain/types';

interface PaymentButtonProps {
  invoiceId: string;
  paymentOptions: PaymentOption[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  hasSufficientBalance?: boolean;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  invoiceId,
  paymentOptions,
  onSuccess,
  onError,
  className = '',
  disabled = false,
  hasSufficientBalance = true,
}) => {
  const {
    buttonState,
    buttonText,
    isButtonDisabled,
    handleButtonClick,
  } = usePaymentButton({
    invoiceId,
    paymentOptions,
    onSuccess,
    onError,
    hasSufficientBalance,
  });

  return (
    <button
      onClick={handleButtonClick}
      disabled={isButtonDisabled || disabled}
      className={`
        w-full px-4 py-3 font-medium rounded-lg transition-colors flex items-center justify-center space-x-2
        ${disabled ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}
        ${isButtonDisabled ? 'bg-gray-400 text-gray-400 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <Wallet className="h-5 w-5" />
      <span>{buttonText}</span>
    </button>
  );
}; 