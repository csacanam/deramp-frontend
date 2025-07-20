export const en = {
  // Status
  status: {
    pending: 'Pending',
    paid: 'Paid',
    expired: 'Expired',
    refunded: 'Refunded'
  },
  
  // General
  general: {
    loading: 'Loading...',
    error: 'Error',
    connect: 'Connect',
    disconnect: 'Disconnect',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close'
  },

  // Header
  header: {
    orderNumber: 'Order #'
  },

  // Order Information
  order: {
    title: 'Order details',
    totalToPay: 'Total amount',
    timeRemaining: 'Time left',
    pageTitle: 'Complete your payment',
    pageDescription: 'Select your preferred payment method and complete the transaction.'
  },

  // Payment
  payment: {
    method: 'Payment Method',
    selectToken: 'Token',
    selectTokenPlaceholder: 'Select Token',
    selectNetwork: 'Select Network',
    network: 'Network',
    connectWallet: 'Connect Wallet',
    connectWalletDescription: 'Connect your wallet to continue with payment',
    makePayment: 'Pay Now',
    processing: 'Processing...',
    completed: 'Payment Completed!',
    completedDescription: 'This order has been paid successfully.',
    expired: 'Order Expired',
    expiredDescription: 'This order has expired and can no longer be paid.',
    refunded: 'Payment Refunded',
    refundedDescription: 'This order has been refunded successfully.',
    amountToPay: 'Payment Amount',
    price: '{symbol} Price',
    lastUpdated: 'Updated {time}',
    dateNotAvailable: 'Date not available'
  },

  // Balance
  balance: {
    label: 'Balance:',
    insufficient: 'Insufficient Balance',
    insufficientDescription: 'You need {required} {symbol} but only have {current} {symbol}',
    noFunds: '(No funds)',
    notAvailable: 'Balance not available',
    loading: 'Loading balance...',
    error: 'Error loading balance'
  },

  // Network
  network: {
    unsupported: 'Unsupported Network',
    switching: 'Switching network...',
    switchError: 'Error switching network',
    changeTokenNetwork: 'Change token/network above'
  },

  // Countdown
  countdown: {
    timeRemaining: 'Time left:',
    expired: 'Order Expired',
    hours: 'h',
    minutes: 'm',
    seconds: 's'
  },

  // Tokens
  tokens: {
    buy: 'Buy {symbol}',
    buyingSoon: 'Function to buy {symbol} coming soon'
  },

  // Networks
  networks: {
    network: 'network',
    networks: 'networks'
  },

  // Footer
  footer: {
    poweredBy: 'Powered by',
    deRamp: 'Voulti'
  },

  // Commerce
  commerce: {
    title: 'Pay with crypto at {name}',
    subtitle: 'Make your payment securely at {name} using crypto with Voulti.',
    amountLabel: 'Enter the amount to pay',
    amountPlaceholder: '0',
    generateButton: 'Continue',
    generating: 'Generating...',
    amountRequired: 'Please enter a valid amount',
    amountMin: 'Amount must be at least {min} {currency}',
    amountMax: 'Amount cannot exceed {max} {currency}',
    createInvoiceError: 'Failed to create invoice',
    networkError: 'Network error. Please check your connection and try again.',
    minimum: 'Minimum',
    maximum: 'Maximum',
    supportedTokens: 'Supported tokens'
  },

  // Errors
  errors: {
    invoiceNotFound: 'This order does not exist or has been deleted.',
    commerceNotFound: 'This commerce does not exist or has been deleted.',
    networkError: 'Network error. Please check your connection and try again.',
    serverError: 'Server error. Please try again later.',
    unknownError: 'An unexpected error occurred. Please try again.',
    configError: 'Backend configuration error'
  }
}; 