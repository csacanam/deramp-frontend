import React from 'react';
import { ChevronDown } from 'lucide-react';
import { GroupedToken } from '../types/invoice';
import { useDropdown } from '../hooks/useDropdown';
import { useLanguage } from '../contexts/LanguageContext';

interface TokenDropdownProps {
  tokens: GroupedToken[];
  selectedToken: GroupedToken | null;
  onTokenSelect: (token: GroupedToken) => void;
  currentChainId?: number; // Add current chain ID to filter tokens
}

export const TokenDropdown: React.FC<TokenDropdownProps> = ({
  tokens,
  selectedToken,
  onTokenSelect,
  currentChainId
}) => {
  const { t } = useLanguage();
  const { isOpen, toggleDropdown, closeDropdown, ref, zIndex } = useDropdown('token-dropdown');

  // Filter tokens by current network
  const availableTokens = currentChainId 
    ? tokens.filter(token => 
        token.networks.some(network => network.chain_id === currentChainId)
      )
    : tokens;

  // If no tokens available for current network, show message
  if (availableTokens.length === 0 && currentChainId) {
    return (
      <div className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
        <span className="text-gray-400 text-sm">
          {t.payment?.noTokensAvailable || 'No tokens available for current network'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleDropdown}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-left flex items-center justify-between hover:border-gray-600 transition-colors"
      >
        <span className="text-white">
          {selectedToken ? (
            <div>
              <div className="font-bold">{selectedToken.symbol}</div>
              <div className="text-gray-400 text-sm">{selectedToken.name}</div>
            </div>
          ) : t.payment.selectTokenPlaceholder}
        </span>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className={`absolute ${zIndex} w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
          {availableTokens.map((token) => {
            // Find the network info for current chain
            const networkInfo = token.networks.find(network => network.chain_id === currentChainId);
            
            return (
              <button
                key={token.symbol}
                onClick={() => {
                  onTokenSelect(token);
                  closeDropdown();
                }}
                className="w-full text-left p-3 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="text-white font-bold">{token.symbol}</div>
                <div className="text-gray-400 text-sm">{token.name}</div>
                {networkInfo && (
                  <div className="text-gray-500 text-xs mt-1">
                    {t.payment?.amountToPay || 'Amount to pay'}: {networkInfo.amount_to_pay} {token.symbol}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};