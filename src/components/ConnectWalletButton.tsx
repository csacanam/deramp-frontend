import React, { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSwitchChain, useDisconnect } from 'wagmi';
import { useLanguage } from '../contexts/LanguageContext';
import { findChainIdByBackendName } from '../config/chains';

interface ConnectWalletButtonProps {
  selectedNetwork?: string;
  onConnected?: () => void;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ 
  selectedNetwork, 
  onConnected 
}) => {
  const { isConnected, chain } = useAccount();
  const { switchChain, isPending: isSwitchingChain, error: switchError } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const { t } = useLanguage();

  // Auto-switch to the selected network when connected - DISABLED
  // useEffect(() => {
  //   if (isConnected && selectedNetwork && chain) {
  //     const targetChainId = findChainIdByBackendName(selectedNetwork);
  //     if (targetChainId && chain.id !== targetChainId && !isSwitchingChain) {
  //       // Add a small delay to avoid immediate switching issues on mobile
  //       const timer = setTimeout(() => {
  //         try {
  //           switchChain({ chainId: targetChainId });
  //         } catch (error) {
  //           console.warn('Failed to auto-switch chain:', error);
  //           // Don't throw error, let user handle it manually through TokenBalance component
  //         }
  //       }, 500);
  //       return () => clearTimeout(timer);
  //     }
  //   }
  // }, [isConnected, selectedNetwork, chain, switchChain, isSwitchingChain]);

  // Call onConnected callback when wallet connects
  useEffect(() => {
    if (isConnected && onConnected) {
      onConnected();
    }
  }, [isConnected, onConnected]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {t.payment.connectWallet}
                  </button>
                );
              }

              return (
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {account.displayName}
                    </button>
                    <button
                      onClick={() => disconnect()}
                      type="button"
                      className="text-gray-400 hover:text-red-400 transition-colors underline"
                    >
                      {t.general.disconnect}
                    </button>
                  </div>
                  {isSwitchingChain && (
                    <div className="text-xs text-yellow-400">
                      {t.network.switching}
                    </div>
                  )}
                  {switchError && (
                    <div className="text-xs text-red-400">
                      {t.network.switchError}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}; 