import React, { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect, useWalletClient, usePublicClient } from 'wagmi';
import { useLanguage } from '../contexts/LanguageContext';

interface ConnectWalletButtonProps {
  selectedNetwork?: string;
  onConnected?: () => void;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ 
  onConnected 
}) => {
  const { isConnected, address, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { t } = useLanguage();

  // Debug logging
  useEffect(() => {
    console.log('🔍 ConnectWalletButton Debug:');
    console.log('  - Is Connected:', isConnected);
    console.log('  - Address:', address);
    console.log('  - Chain ID:', chainId);
    console.log('  - Wallet Client:', !!walletClient);
    console.log('  - Public Client:', !!publicClient);
    console.log('  - Window Ethereum:', !!window.ethereum);
    console.log('  - User Agent:', navigator.userAgent);
  }, [isConnected, address, chainId, walletClient, publicClient]);

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
      console.log('✅ Wallet connected, calling onConnected callback');
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

        console.log('🔍 ConnectButton Debug:', {
          ready,
          connected,
          authenticationStatus,
          account: account?.address,
          chain: chain?.id
        });

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
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        console.log('🔗 Opening connect modal...');
                        openConnectModal();
                      }}
                      type="button"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      {t.payment.connectWallet}
                    </button>
                    {/* Debug button for mobile */}
                    {import.meta.env.DEV && (
                      <button
                        onClick={() => {
                          console.log('🔧 Debug button clicked');
                          // This will trigger vConsole if available
                          if (window.vConsole) {
                            window.vConsole.show();
                          }
                        }}
                        type="button"
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        🔧 Debug Console
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <button
                      onClick={() => {
                        console.log('🔗 Opening account modal...');
                        openAccountModal();
                      }}
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
                  {/* Debug button for mobile */}
                  {import.meta.env.DEV && (
                    <button
                      onClick={() => {
                        console.log('🔧 Debug button clicked');
                        // This will trigger vConsole if available
                        if (window.vConsole) {
                          window.vConsole.show();
                        }
                      }}
                      type="button"
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      🔧 Debug Console
                    </button>
                  )}
                  {/* Network switching status removed as auto-switching is disabled */}
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}; 