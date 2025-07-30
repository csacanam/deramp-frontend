import React from 'react';
import { Wallet } from 'lucide-react';
import { usePaymentButton } from '../hooks/usePaymentButton';
import { PaymentOption } from '../blockchain/types';
import { NetworkSwitchButton } from './NetworkSwitchButton';

interface PaymentButtonProps {
  invoiceId: string;
  paymentOptions: PaymentOption[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean; // Add disabled prop for balance validation
  hasSufficientBalance?: boolean; // Add balance validation for hook
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
    showNetworkSwitch,
  } = usePaymentButton({
    invoiceId,
    paymentOptions,
    onSuccess,
    onError,
    hasSufficientBalance,
  });

  // Determine button styles based on state
  const getButtonStyles = () => {
    const baseStyles = "w-full px-4 py-3 font-medium rounded-lg transition-colors flex items-center justify-center space-x-2";
    
    // If externally disabled (e.g., insufficient balance)
    if (disabled) {
      return `${baseStyles} bg-gray-600 text-gray-400 cursor-not-allowed`;
    }
    
    // If button is in a loading/processing state
    if (isButtonDisabled) {
      return `${baseStyles} bg-gray-500 text-gray-300 cursor-not-allowed opacity-75`;
    }
    
    // Normal state - clickable
    return `${baseStyles} bg-blue-600 hover:bg-blue-700 text-white`;
  };

  return (
    <div data-payment-button className="space-y-3">
      {/* Network Switch Button - shown when on wrong network */}
      {showNetworkSwitch && (
        <NetworkSwitchButton
          targetChainId={44787}
          onSwitch={() => {
            console.log('✅ Network switch initiated');
          }}
          onError={(error) => {
            console.error('❌ Network switch error:', error);
            onError?.(error);
          }}
          className="mb-3"
        />
      )}
      
      {/* Main Payment Button */}
      <button
        onClick={handleButtonClick}
        disabled={isButtonDisabled || disabled}
        className={`${getButtonStyles()} ${className}`}
      >
        <Wallet className="h-5 w-5" />
        <span>{buttonText}</span>
      </button>
    </div>
  );
}; 