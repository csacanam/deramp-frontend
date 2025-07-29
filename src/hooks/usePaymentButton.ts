import { useState, useCallback } from 'react';
import { useAccount, useChainId, useWalletClient, usePublicClient } from 'wagmi';
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
  hasSufficientBalance?: boolean; // Add balance validation
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
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
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
          
          // TEMPORARY: Try without supportsENS parameter to see if that was the issue
          const createResponse = await BlockchainService.createInvoice({
            invoiceId,
            paymentOptions: blockchainPaymentOptions, // Use converted options with addresses
            network: networkName,
            // supportsENS, // Commented out to test if this was causing the issue
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
      let userMessage = t.payment.paymentFailed;
      
      if (error instanceof Error) {
        if (error.message.includes('ENS') || error.message.includes('network does not support')) {
          userMessage = t.payment.networkConfigError;
        } else if (error.message.includes('HTTP error! status: 400')) {
          userMessage = t.payment.unableToPrepare;
        } else if (error.message.includes('Failed to create invoice on blockchain')) {
          userMessage = t.payment.unableToCreateBlockchain;
        } else if (error.message.includes('Failed to get blockchain status')) {
          userMessage = t.payment.unableToVerifyStatus;
        } else {
          userMessage = error.message;
        }
      }
      
      onError?.(userMessage);
    }
  }, [invoiceId, paymentOptions, isConnected, address, chainId, onError, getNetworkName]);

  const handleAuthorize = useCallback(async () => {
    console.log('🔐 ===== AUTHORIZE START =====');
    console.log('🔐 Selected Token:', selectedToken);
    console.log('🔐 Is Connected:', isConnected);
    console.log('🔐 Address:', address);
    console.log('🔐 Chain ID:', chainId);
    console.log('🔐 Wallet Client:', !!walletClient);
    console.log('🔐 Public Client:', !!publicClient);
    console.log('🔐 Window Ethereum:', !!window.ethereum);
    console.log('🔐 User Agent:', navigator.userAgent);
    console.log('🔐 ==========================');
    
    if (!isConnected || !address || !chainId || !selectedToken) {
      console.error('❌ Missing required data for authorization');
      console.error('❌ Is Connected:', isConnected);
      console.error('❌ Address:', address);
      console.error('❌ Chain ID:', chainId);
      console.error('❌ Selected Token:', selectedToken);
      onError?.('Please connect your wallet and select a token');
      return;
    }

    setButtonState('approving');

    let tokenConfig: any = null;
    
    try {
      const networkName = getNetworkName(chainId);
      console.log('🌐 Network Name:', networkName);
      console.log('🌐 Chain ID:', chainId);
      console.log('🌐 Expected Chain ID for Alfajores: 44787');
      
      // Verify we're on the correct network
      if (chainId !== 44787) {
        console.error('❌ Wrong network detected');
        console.error('❌ Current Chain ID:', chainId);
        console.error('❌ Expected Chain ID: 44787');
        
        // Get more detailed network info
        try {
          const currentChainId = await walletClient?.request({ method: 'eth_chainId' });
          const accounts = await walletClient?.request({ method: 'eth_accounts' });
          console.log('🔍 Detailed Network Info:');
          console.log('   - Chain ID from wallet:', currentChainId);
          console.log('   - Connected accounts:', accounts);
          console.log('   - Chain ID from app:', chainId);
          console.log('   - Is connected:', isConnected);
        } catch (error) {
          console.error('❌ Error getting network details:', error);
        }
        
        // Show manual network switch option
        setButtonState('ready');
        onError?.('Red incorrecta detectada. Por favor, cambia a Celo Alfajores en tu wallet o haz click aquí para cambiar automáticamente.');
        
        // Add a button to switch network manually
        const switchButton = document.createElement('button');
        switchButton.textContent = 'Cambiar a Celo Alfajores';
        switchButton.style.cssText = `
          background: #35d07f;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          margin-top: 10px;
          cursor: pointer;
          font-size: 14px;
        `;
        
        switchButton.onclick = async () => {
          try {
            console.log('🔄 User clicked to switch network...');
            await walletClient?.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaeef' }], // 44787 in hex
            });
            console.log('✅ Network switch successful');
            // Reload the page to refresh the connection
            window.location.reload();
          } catch (error) {
            console.error('❌ Failed to switch network:', error);
            onError?.('Error al cambiar de red. Por favor, cambia manualmente a Celo Alfajores en MetaMask.');
          }
        };
        
        // Find the payment button container and add the switch button
        const buttonContainer = document.querySelector('[data-payment-button]');
        if (buttonContainer) {
          buttonContainer.appendChild(switchButton);
        }
        
        return;
      }
      
      // Get token configuration
      const networkTokens = TOKENS[networkName as keyof typeof TOKENS];
      if (!networkTokens) {
        throw new Error('Unsupported network');
      }

      // Find token config by symbol (case-insensitive)
      tokenConfig = Object.values(networkTokens).find(
        token => token.symbol.toLowerCase() === selectedToken.toLowerCase()
      );
      if (!tokenConfig) {
        throw new Error('Unsupported token');
      }

      // Create provider and signer using Wagmi
      if (!walletClient) {
        throw new Error('No wallet client available');
      }
      
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      // Get payment option for selected token
      const paymentOption = paymentOptions.find(option => option.token === selectedToken);
      if (!paymentOption) {
        throw new Error('Payment option not found for selected token');
      }

      const networkContracts = CONTRACTS[networkName as keyof typeof CONTRACTS];
      if (!networkContracts) {
        throw new Error('Network contracts not found');
      }

      // Create token contract instance
      const tokenContract = new ethers.Contract(
        tokenConfig.address,
        [
          'function approve(address spender, uint256 amount) external returns (bool)',
          'function allowance(address owner, address spender) external view returns (uint256)',
          'function balanceOf(address account) external view returns (uint256)',
          'function decimals() external view returns (uint8)',
          'function symbol() external view returns (string)',
        ],
        signer
      );

      // Verify contract is working
      try {
        console.log('🔍 Verifying contract accessibility...');
        console.log('🔍 Contract Address:', tokenConfig.address);
        console.log('🔍 Network Name:', networkName);
        
        const symbol = await tokenContract.symbol();
        const decimals = await tokenContract.decimals();
        console.log('✅ Contract verification successful');
        console.log('✅ Token Symbol:', symbol);
        console.log('✅ Token Decimals:', decimals);
      } catch (contractError) {
        console.error('❌ Contract verification failed:', contractError);
        console.error('❌ Error details:', {
          message: contractError instanceof Error ? contractError.message : 'Unknown error',
          code: contractError && typeof contractError === 'object' && 'code' in contractError ? contractError.code : 'No code',
          data: contractError && typeof contractError === 'object' && 'data' in contractError ? contractError.data : 'No data'
        });
        throw new Error('Token contract not accessible');
      }

      // Check if approval is needed
      console.log('🔍 Checking allowance...');
      const allowance = await tokenContract.allowance(address, networkContracts.DERAMP_PROXY);
      const requiredAmount = ethers.parseUnits(paymentOption.amount, tokenConfig.decimals);

      console.log('📊 Allowance:', ethers.formatUnits(allowance, tokenConfig.decimals), 'Required:', ethers.formatUnits(requiredAmount, tokenConfig.decimals));

      if (allowance < requiredAmount) {
        // Approve token
        console.log('🔄 Sending approval transaction...');
        console.log('🔄 Approving spender (DERAMP_PROXY):', networkContracts.DERAMP_PROXY);
        console.log('🔄 To spend amount:', ethers.formatUnits(requiredAmount, tokenConfig.decimals));
        
        try {
          const approveTx = await tokenContract.approve(
            networkContracts.DERAMP_PROXY,
            requiredAmount
          );
          
          console.log('📊 Transaction hash:', approveTx.hash);
          console.log('⏳ Waiting for confirmation...');
          
          // Wait for transaction confirmation
          const receipt = await approveTx.wait();
          console.log('✅ Transaction confirmed');
          console.log('📊 Receipt status:', receipt.status);
          console.log('📊 Gas used:', receipt.gasUsed?.toString());
          console.log('📊 Block number:', receipt.blockNumber);
          
        } catch (approvalError) {
          console.error('❌ Approval transaction failed:', approvalError);
          
          // Log detailed error information in one line for easy copying
          console.log('🔍 ===== COMPLETE ERROR FOR COPYING =====');
          console.log('🔍 Error:', JSON.stringify(approvalError, null, 2));
          console.log('🔍 ===========================================');
          
          // Check specifically for "could not coalesce" error
          const isCoalesceError = approvalError && 
            typeof approvalError === 'object' && 
            'message' in approvalError && 
            typeof approvalError.message === 'string' &&
            (approvalError.message.includes('could not coalesce') ||
             approvalError.message.includes('Internal JSON-RPC error'));
          
          if (isCoalesceError) {
            console.log('⚠️ MetaMask mobile browser error detected');
            console.log('⚠️ This is common when using MetaMask browser on mobile');
            console.log('⚠️ Transaction might still be processing in background');
            
            // For this specific error, try to get transaction hash if available
            let transactionHash = null;
            if (approvalError && typeof approvalError === 'object' && 'transaction' in approvalError) {
              const transaction = approvalError.transaction as any;
              transactionHash = transaction?.hash;
              console.log('🔍 Transaction hash from error:', transactionHash);
            }
            
            // Wait a bit and check if transaction was actually processed
            console.log('⏳ Waiting 20 seconds to check if transaction processed...');
            await new Promise(resolve => setTimeout(resolve, 20000));
            
            try {
              console.log('🔍 Checking if allowance was updated despite error...');
              console.log('🔍 Token Address:', tokenConfig.address);
              console.log('🔍 User Address (owner):', address);
              console.log('🔍 Spender Address (DERAMP_PROXY):', networkContracts.DERAMP_PROXY);
              
              // Create a fresh token contract with current provider
              const freshTokenContract = new ethers.Contract(
                tokenConfig.address,
                [
                  'function allowance(address owner, address spender) external view returns (uint256)',
                  'function balanceOf(address account) external view returns (uint256)',
                  'function decimals() external view returns (uint8)',
                  'function symbol() external view returns (string)',
                ],
                signer
              );
              
              // Verify we're checking the right allowance: owner = user, spender = DERAMP_PROXY
              console.log('🔍 Calling allowance(owner, spender):');
              console.log('🔍   owner =', address);
              console.log('🔍   spender =', networkContracts.DERAMP_PROXY);
              
              const newAllowance = await freshTokenContract.allowance(address, networkContracts.DERAMP_PROXY);
              console.log('📊 New Allowance after error:', newAllowance.toString());
              console.log('📊 New Allowance in ETH:', ethers.formatUnits(newAllowance, tokenConfig.decimals));
              console.log('📊 Required Amount:', requiredAmount.toString());
              console.log('📊 Required Amount in ETH:', ethers.formatUnits(requiredAmount, tokenConfig.decimals));
              console.log('📊 Comparison:', newAllowance >= requiredAmount ? '✅ SUFFICIENT' : '❌ INSUFFICIENT');
              
              if (newAllowance >= requiredAmount) {
                console.log('✅ Allowance was updated despite error!');
                console.log('✅ Transaction was successful in background');
                setButtonState('confirm');
                return; // Success!
              } else {
                console.log('❌ Allowance was not updated, transaction failed');
                console.log('💡 Suggestion: Try again, this error is often temporary');
              }
            } catch (checkError) {
              console.log('⚠️ Could not check allowance after error:', checkError);
            }
            
            // For MetaMask mobile browser, suggest checking wallet and retrying
            setButtonState('ready');
            onError?.('Error temporal de MetaMask móvil. La transacción puede haberse procesado. Verifica tu wallet y vuelve a intentar si es necesario.');
            return;
          }
          
          // For other errors, re-throw
          throw approvalError;
        }
      }
      
      setButtonState('confirm');
    } catch (error) {
      console.error('Error in handleAuthorize:', error);
      setButtonState('ready');
      
      // Provide user-friendly error messages
      let userMessage = t.payment.tokenAuthFailed;
      
      if (error instanceof Error) {
        if (error.message.includes('Unsupported token')) {
          userMessage = t.payment.tokenNotSupported;
        } else if (error.message.includes('Unsupported network')) {
          userMessage = t.payment.networkNotSupported;
        } else if (error.message.includes('No Ethereum provider found')) {
          userMessage = t.payment.walletNotFound;
        } else if (error.message.includes('Payment option not found')) {
          userMessage = t.payment.paymentOptionNotFound;
        } else {
          userMessage = error.message;
        }
      }
      
      onError?.(userMessage);
    }
  }, [selectedToken, paymentOptions, isConnected, address, chainId, onError, getNetworkName]);

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

      // Create provider and signer using Wagmi
      if (!walletClient) {
        throw new Error('No wallet client available');
      }
      
      const provider = new ethers.BrowserProvider(walletClient);
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
      const payTx = await derampProxyContract.payInvoice(
        invoiceIdBytes32,
        tokenConfig.address,
        amount,
        {
          gasLimit: 500000,
          value: 0
        }
      );

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
        receipt: error.receipt
      });
      
      // Check if user cancelled the transaction
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        setButtonState('confirm');
        const isSpanish = language === 'es';
        alert(isSpanish ? 'Cancelaste el pago. Puede intentar de nuevo.' : 'Payment cancelled. You can try again.');
      } else {
        setButtonState('confirm');
        
        // Provide user-friendly error messages
        let userMessage = t.payment.paymentFailed;
        
        if (error.message) {
          if (error.message.includes('insufficient allowance')) {
            userMessage = t.payment.tokenAuthRequired;
          } else if (error.message.includes('transaction execution reverted')) {
            userMessage = t.payment.transactionFailed;
          } else if (error.message.includes('insufficient balance')) {
            userMessage = t.payment.insufficientBalance;
          } else if (error.message.includes('network')) {
            userMessage = t.payment.networkIssue;
          } else if (error.message.includes('Failed to fetch')) {
            userMessage = t.payment.connectionIssue;
          } else {
            userMessage = error.message;
          }
        }
        
        onError?.(userMessage);
      }
    }
  }, [selectedToken, paymentOptions, isConnected, address, chainId, onError, onSuccess, getNetworkName, language]);

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