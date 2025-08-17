import { useState, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { ethers } from 'ethers';
import { BlockchainService } from '../services/blockchainService';
import { ButtonState, PaymentOption } from '../blockchain/types';
import { TOKENS } from '../blockchain/config/tokens';
import { CONTRACTS } from '../blockchain/config/contracts';
import { useLanguage } from '../contexts/LanguageContext';
import DerampProxyABI from '../blockchain/abi/DerampProxy.json';

interface UsePaymentButtonProps {
  invoiceId: string;
  paymentOptions: PaymentOption[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
  hasSufficientBalance?: boolean;
}

export const usePaymentButton = ({ 
  invoiceId, 
  paymentOptions, 
  onSuccess, 
  onError,
  hasSufficientBalance = true
}: UsePaymentButtonProps) => {
  const [buttonState, setButtonState] = useState<ButtonState>('initial');
  const [selectedToken, setSelectedToken] = useState<string>('');
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { language, t } = useLanguage();

  // Get network name from chainId
  const getNetworkName = (chainId: number): string => {
    switch (chainId) {
      case 44787:
        return 'alfajores';
      default:
        return 'alfajores'; // Default to alfajores for now
    }
  };

  const getButtonText = useCallback((state: ButtonState, tokenSymbol?: string) => {
    const isSpanish = language === 'es';
    
    switch (state) {
      case 'initial':
        return isSpanish ? 'Pagar ahora' : 'Pay Now';
      case 'loading':
        return isSpanish ? 'Preparando tu pago...' : 'Preparing your payment...';
      case 'ready':
        return isSpanish ? `Autorizar ${tokenSymbol}` : `Authorize ${tokenSymbol}`;
      case 'approving':
        return isSpanish ? `Autorizando ${tokenSymbol}...` : `Authorizing ${tokenSymbol}...`;
      case 'confirm':
        return isSpanish ? 'Confirmar pago' : 'Confirm Payment';
      case 'processing':
        return isSpanish ? 'Procesando pago...' : 'Processing payment...';
      default:
        return isSpanish ? 'Pagar ahora' : 'Pay Now';
    }
  }, [language]);

  const handlePayNow = useCallback(async () => {
    if (!isConnected || !address || !chainId) {
      onError?.('Please connect your wallet first');
      return;
    }

    if (paymentOptions.length === 0) {
      onError?.('No payment options available');
      return;
    }

    if (!hasSufficientBalance) {
      onError?.('Insufficient balance');
      return;
    }

    setButtonState('loading');

    try {
      const networkName = getNetworkName(chainId);
      
      // Step 1: Check blockchain status
      const statusResponse = await BlockchainService.getStatus(invoiceId, networkName);
      
      if (statusResponse.success) {
        const { exists, status } = statusResponse.data;
        
        if (!exists) {
          // Convert token symbols to addresses for blockchain creation
          const networkTokens = TOKENS[networkName as keyof typeof TOKENS];
          if (!networkTokens) {
            throw new Error('Unsupported network');
          }

          const blockchainPaymentOptions = paymentOptions.map(option => {
            // Find token config by symbol (case-insensitive)
            const tokenConfig = Object.values(networkTokens).find(
              token => token.symbol.toLowerCase() === option.token.toLowerCase()
            );
            if (!tokenConfig) {
              throw new Error(`Unsupported token: ${option.token}`);
            }
            
            return {
              token: tokenConfig.address, // Use address instead of symbol
              amount: option.amount
            };
          });

          // Create invoice on blockchain
          const createResponse = await BlockchainService.createInvoice({
            invoiceId,
            paymentOptions: blockchainPaymentOptions,
            network: networkName,
          });
          
          if (createResponse.success) {
            setSelectedToken(paymentOptions[0].token);
            setButtonState('ready');
          } else {
            throw new Error('Failed to create invoice on blockchain');
          }
        } else if (status === 'pending') {
          // Invoice exists and is pending, ready to authorize
          setSelectedToken(paymentOptions[0].token);
          setButtonState('ready');
        } else if (['expired', 'refunded', 'paid'].includes(status)) {
          // Update backend and refresh page
          await BlockchainService.updateInvoiceStatus(invoiceId, status);
          window.location.reload();
        } else {
          throw new Error(`Unexpected invoice status: ${status}`);
        }
      } else {
        throw new Error('Failed to get blockchain status');
      }
    } catch (error) {
      console.error('Error in handlePayNow:', error);
      setButtonState('initial');
      
      // Provide user-friendly error messages
      let userMessage = t.payment?.paymentFailed || 'Payment failed';
      
      if (error instanceof Error) {
        if (error.message.includes('ENS') || error.message.includes('network does not support')) {
          userMessage = t.payment?.networkConfigError || 'Network configuration error';
        } else if (error.message.includes('HTTP error! status: 400')) {
          userMessage = t.payment?.unableToPrepare || 'Unable to prepare payment';
        } else if (error.message.includes('Failed to create invoice on blockchain')) {
          userMessage = t.payment?.unableToCreateBlockchain || 'Unable to create blockchain invoice';
        } else if (error.message.includes('Failed to get blockchain status')) {
          userMessage = t.payment?.unableToVerifyStatus || 'Unable to verify status';
        } else {
          userMessage = error.message;
        }
      }
      
      onError?.(userMessage);
    }
  }, [invoiceId, paymentOptions, isConnected, address, chainId, onError, getNetworkName, t.payment]);

  const handleAuthorize = useCallback(async () => {
    if (!isConnected || !address || !chainId || !selectedToken) {
      onError?.('Please connect your wallet and select a token');
      return;
    }

    setButtonState('approving');

    try {
      const networkName = getNetworkName(chainId);
      
      // Get token configuration
      const networkTokens = TOKENS[networkName as keyof typeof TOKENS];
      if (!networkTokens) {
        throw new Error('Unsupported network');
      }

      // Find token config by symbol (case-insensitive)
      const tokenConfig = Object.values(networkTokens).find(
        token => token.symbol.toLowerCase() === selectedToken.toLowerCase()
      );
      if (!tokenConfig) {
        throw new Error('Unsupported token');
      }

      // Create provider and signer
      if (!window.ethereum) {
        throw new Error('No Ethereum provider found');
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create token contract instance
      const tokenContract = new ethers.Contract(
        tokenConfig.address,
        [
          'function approve(address spender, uint256 amount) external returns (bool)',
          'function allowance(address owner, address spender) external view returns (uint256)',
        ],
        signer
      );

      // Get payment option for selected token
      const paymentOption = paymentOptions.find(option => option.token === selectedToken);
      if (!paymentOption) {
        throw new Error('Payment option not found for selected token');
      }

      const networkContracts = CONTRACTS[networkName as keyof typeof CONTRACTS];
      if (!networkContracts) {
        throw new Error('Network contracts not found');
      }

      // Check if approval is needed
      const allowance = await tokenContract.allowance(address, networkContracts.DERAMP_PROXY);
      const requiredAmount = ethers.parseUnits(paymentOption.amount, tokenConfig.decimals);

      if (allowance < requiredAmount) {
        // Approve token
        const approveTx = await tokenContract.approve(
          networkContracts.DERAMP_PROXY,
          requiredAmount
        );
        await approveTx.wait();
      }

      setButtonState('confirm');
    } catch (error) {
      console.error('Error in handleAuthorize:', error);
      // Always reset to ready state to prevent freezing
      setButtonState('ready');
      
      // Provide user-friendly error messages
      let userMessage = t.payment?.tokenAuthFailed || 'Token authorization failed';
      
      if (error instanceof Error) {
        if (error.message.includes('Unsupported token')) {
          userMessage = t.payment?.tokenNotSupported || 'Token not supported';
        } else if (error.message.includes('Unsupported network')) {
          userMessage = t.payment?.networkNotSupported || 'Network not supported';
        } else if (error.message.includes('No Ethereum provider found')) {
          userMessage = t.payment?.walletNotFound || 'Wallet not found';
        } else if (error.message.includes('Payment option not found')) {
          userMessage = t.payment?.paymentOptionNotFound || 'Payment option not found';
        } else if (error.message.includes('could not coalesce') || error.message.includes('gas') || error.message.includes('nonce')) {
          userMessage = t.payment?.networkCongestion || 'Network is congested. Please try again in a few minutes.';
        } else {
          userMessage = t.payment?.networkCongestion || 'Network is congested. Please try again in a few minutes.';
        }
      }
      
      onError?.(userMessage);
      
      // Add a small delay before allowing retry
      setTimeout(() => {
        // Ensure button is in ready state and ready for retry
        setButtonState('ready');
      }, 1000);
    }
  }, [selectedToken, paymentOptions, isConnected, address, chainId, onError, getNetworkName, t.payment]);

  const handleConfirm = useCallback(async () => {
    if (!isConnected || !address || !chainId || !selectedToken) {
      onError?.('Please connect your wallet and select a token');
      return;
    }

    setButtonState('processing');

    try {
      const networkName = getNetworkName(chainId);
      
      // Get token configuration
      const networkTokens = TOKENS[networkName as keyof typeof TOKENS];
      if (!networkTokens) {
        throw new Error('Unsupported network');
      }

      // Find token config by symbol (case-insensitive)
      const tokenConfig = Object.values(networkTokens).find(
        token => token.symbol.toLowerCase() === selectedToken.toLowerCase()
      );
      if (!tokenConfig) {
        throw new Error('Unsupported token');
      }

      // Get payment option for selected token
      const paymentOption = paymentOptions.find(option => option.token === selectedToken);
      if (!paymentOption) {
        throw new Error('Payment option not found for selected token');
      }

      const networkContracts = CONTRACTS[networkName as keyof typeof CONTRACTS];
      if (!networkContracts) {
        throw new Error('Network contracts not found');
      }

      // Create provider and signer
      if (!window.ethereum) {
        throw new Error('No Ethereum provider found');
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Import the full ABI from the JSON file
      const derampProxyAbi = (await import('../blockchain/abi/DerampProxy.json')).abi;
      
      // Create DerampProxy contract instance with full ABI
      const derampProxyContract = new ethers.Contract(
        networkContracts.DERAMP_PROXY,
        derampProxyAbi,
        signer
      );

      // Convert invoiceId to bytes32 using ethers.id (same as backend)
      const invoiceIdBytes32 = ethers.id(invoiceId);
      
      // Parse amount to wei (the contract expects wei, not decimal units)
      const amount = ethers.parseUnits(paymentOption.amount, tokenConfig.decimals);

      // Check if invoice exists first by calling a view function
      try {
        // Let's also check the blockchain status again to make sure the invoice exists
        const statusCheck = await BlockchainService.getStatus(invoiceId, networkName);
        
        if (!statusCheck.success || !statusCheck.data.exists) {
          throw new Error('Invoice does not exist in blockchain');
        }
        
        if (statusCheck.data.status !== 'pending') {
          throw new Error(`Invoice is not in pending status: ${statusCheck.data.status}`);
        }
        
        // Check allowance again before payment
        const tokenContract = new ethers.Contract(
          tokenConfig.address,
          [
            'function allowance(address owner, address spender) external view returns (uint256)',
          ],
          provider
        );
        
        const allowance = await tokenContract.allowance(address, networkContracts.DERAMP_PROXY);
        
        if (allowance < amount) {
          throw new Error('Insufficient allowance. Please approve tokens first.');
        }
        
      } catch (error) {
        throw error;
      }

      // Call payInvoice directly on the contract
      console.log('🚀 Executing payment transaction with params:', {
        invoiceId: invoiceIdBytes32,
        tokenAddress: tokenConfig.address,
        amount: amount.toString(),
        gasLimit: 300000, // Reduced from 500000 for Celo
        maxFeePerGas: ethers.parseUnits('0.1', 'gwei'), // Celo-specific gas pricing
        maxPriorityFeePerGas: ethers.parseUnits('0.01', 'gwei'), // Celo-specific gas pricing
        value: 0
      });

      // Use more conservative gas settings for Celo
      const payTx = await derampProxyContract.payInvoice(
        invoiceIdBytes32,
        tokenConfig.address,
        amount,
        {
          gasLimit: 300000, // Reduced from 500000 for Celo
          maxFeePerGas: ethers.parseUnits('0.1', 'gwei'), // Celo-specific gas pricing
          maxPriorityFeePerGas: ethers.parseUnits('0.01', 'gwei'), // Celo-specific gas pricing
          value: 0
        }
      );

      console.log('✅ Transaction sent:', payTx.hash);
      console.log('⏳ Waiting for confirmation...');

      // Wait for transaction confirmation
      const receipt = await payTx.wait();

      if (receipt && receipt.status === 1) {
        // Payment successful - try to update backend with payment data and status
        try {
          const paymentData = {
            paid_token: tokenConfig.address,
            paid_network: networkName,
            paid_tx_hash: payTx.hash,
            wallet_address: address,
            paid_amount: parseFloat(paymentOption.amount) // Convert to number as backend expects
          };
          
          // Update payment data
          await BlockchainService.updatePaymentData(invoiceId, paymentData);
          
          // Update invoice status to "paid"
          await BlockchainService.updateInvoiceStatus(invoiceId, 'paid');
          
        } catch (backendError: any) {
          // Don't fail the entire process if backend update fails
        }
        
        // Call success callback
        onSuccess?.();
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error: any) {
      console.error('Error in handleConfirm:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        data: error.data,
        transaction: error.transaction,
        receipt: error.receipt,
        network: getNetworkName(chainId),
        chainId
      });
      
      // Check if user cancelled the transaction
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        setButtonState('confirm');
        const isSpanish = language === 'es';
        alert(isSpanish ? 'Cancelaste el pago. Puede intentar de nuevo.' : 'Payment cancelled. You can try again.');

      } else {
        // Always reset to confirm state to prevent freezing
        setButtonState('confirm');
        
        // Provide user-friendly error messages
        let userMessage = t.payment?.paymentFailed || 'Payment failed';
        
        if (error.message) {
          if (error.message.includes('insufficient allowance')) {
            userMessage = t.payment?.tokenAuthRequired || 'Token authorization required';
          } else if (error.message.includes('transaction execution reverted')) {
            userMessage = t.payment?.transactionFailed || 'Transaction failed';
          } else if (error.message.includes('insufficient balance')) {
            userMessage = t.payment?.insufficientBalance || 'Insufficient balance';
          } else if (error.message.includes('network')) {
            userMessage = t.payment?.networkIssue || 'Network issue';
          } else if (error.message.includes('Failed to fetch')) {
            userMessage = t.payment?.connectionIssue || 'Connection issue';
          } else if (error.message.includes('could not coalesce')) {
            userMessage = t.payment?.networkCongestion || 'Network is congested. Please try again in a few minutes.';
          } else if (error.message.includes('gas')) {
            userMessage = t.payment?.networkCongestion || 'Network is congested. Please try again in a few minutes.';
          } else if (error.message.includes('nonce')) {
            userMessage = t.payment?.networkCongestion || 'Network is congested. Please try again in a few minutes.';
          } else if (error.message.includes('timeout') || error.message.includes('deadline')) {
            userMessage = t.payment?.networkCongestion || 'Network is congested. Please try again in a few minutes.';
          } else {
            userMessage = t.payment?.networkCongestion || 'Network is congested. Please try again in a few minutes.';
          }
        }
        
        // Log specific Celo errors for debugging
        if (chainId === 44787) { // Celo Alfajores
          console.error('🔍 Celo Alfajores specific error:', {
            error: error.message,
            gasSettings: {
              gasLimit: 300000,
              maxFeePerGas: '0.1 gwei',
              maxPriorityFeePerGas: '0.01 gwei'
            },
            suggestion: 'Try increasing gas limit or check network status'
          });
        }
        
        // Show user-friendly error and allow retry
        onError?.(userMessage);
        
        // Add a small delay before allowing retry to prevent rapid clicking
        setTimeout(() => {
          // Ensure button is in confirm state and ready for retry
          setButtonState('confirm');
        }, 1000);
      }
    }
  }, [selectedToken, paymentOptions, isConnected, address, chainId, onError, onSuccess, getNetworkName, language, t.payment]);

  const handleButtonClick = useCallback(() => {
    switch (buttonState) {
      case 'initial':
        handlePayNow();
        break;
      case 'ready':
        handleAuthorize();
        break;
      case 'confirm':
        handleConfirm();
        break;
      default:
        // Do nothing for loading/approving/processing states
        break;
    }
  }, [buttonState, handlePayNow, handleAuthorize, handleConfirm]);

  const isButtonDisabled = buttonState === 'loading' || buttonState === 'approving' || buttonState === 'processing';

  return {
    buttonState,
    buttonText: getButtonText(buttonState, selectedToken),
    isButtonDisabled,
    handleButtonClick,
    selectedToken,
  };
}; 