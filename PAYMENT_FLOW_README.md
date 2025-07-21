# 🚀 DeRamp Payment Flow Implementation

## 📋 Summary

This document describes the complete payment flow implementation for the DeRamp frontend, which handles crypto payments on the Celo blockchain using smart contracts.

## 🏗️ Architecture

### File Structure

```
src/
├── blockchain/
│   ├── config/
│   │   ├── index.ts          # Configuration exports
│   │   ├── networks.ts       # Network configuration
│   │   ├── contracts.ts      # Contract addresses
│   │   └── tokens.ts         # Token configuration
│   ├── abi/
│   │   └── DerampProxy.json  # Main contract ABI
│   └── types.ts              # Blockchain types
├── services/
│   └── blockchainService.ts  # Blockchain API services
├── hooks/
│   └── usePaymentButton.ts   # Payment button hook
├── components/
│   ├── PaymentButton.tsx     # Payment button component
│   └── CheckoutPage.tsx      # Main checkout page
└── types/
    └── global.d.ts           # Global types (window.ethereum)
```

## 🔄 Payment Button State Flow

### States and User Experience

| State        | English                     | Spanish                  | Action                          | User Experience          |
| ------------ | --------------------------- | ------------------------ | ------------------------------- | ------------------------ |
| `initial`    | "Pay Now"                   | "Pagar ahora"            | Click → Check blockchain status | User sees payment amount |
| `loading`    | "Preparing your payment..." | "Preparando tu pago..."  | Verifying/creating invoice      | Loading spinner          |
| `ready`      | "Authorize {TOKEN}"         | "Autorizar {TOKEN}"      | Click → Approve token           | Ready to authorize       |
| `approving`  | "Authorizing {TOKEN}..."    | "Autorizando {TOKEN}..." | Executing approve()             | Waiting for approval     |
| `confirm`    | "Confirm Payment"           | "Confirmar pago"         | Click → Execute payment         | Ready to confirm         |
| `processing` | "Processing payment..."     | "Procesando pago..."     | Executing payInvoice()          | Waiting for payment      |

### Complete Payment Flow

1. **Initial State - "Pay Now"**

   - User connects wallet and selects token
   - Clicks "Pay Now" button
   - Button changes to "Preparing your payment..."

2. **Loading State - Invoice Creation**

   - Checks GET `/api/blockchain/status/:invoiceId?network=:network`
   - If invoice doesn't exist: Creates with POST `/api/blockchain/create`
   - Converts token symbols to contract addresses for backend
   - If successful: Changes to "Authorize {TOKEN}"

3. **Ready State - Token Authorization**

   - User clicks "Authorize {TOKEN}"
   - Button changes to "Authorizing {TOKEN}..."
   - Executes `approve()` function on token contract
   - If successful: Changes to "Confirm Payment"

4. **Confirm State - Payment Execution**

   - User clicks "Confirm Payment"
   - Button changes to "Processing payment..."
   - Executes `payInvoice()` on DerampProxy contract
   - Updates backend with payment data and status

5. **Success State**
   - Payment completed successfully
   - Order ID displayed above total amount
   - Backend updated with payment details

## 🔧 Configuration

### Supported Network

Currently configured for **Celo Alfajores testnet**:

```typescript
// src/blockchain/config/networks.ts
export const NETWORKS = {
  alfajores: {
    chainId: 44787,
    name: "Celo Alfajores",
    rpcUrl: "https://alfajores-forno.celo-testnet.org",
    blockExplorer: "https://alfajores.celoscan.io",
    nativeCurrency: {
      name: "CELO",
      symbol: "CELO",
      decimals: 18,
    },
  },
};
```

### Main Contract

```typescript
// src/blockchain/config/contracts.ts
export const CONTRACTS = {
  alfajores: {
    DERAMP_PROXY: "0xc44cDAdf371DFCa94e325d1B35e27968921Ef668",
    // Other contracts for future use
  },
};
```

### Supported Tokens

```typescript
// src/blockchain/config/tokens.ts
export const TOKENS = {
  alfajores: {
    cCOP: {
      address: "0xe6A57340f0df6E020c1c0a80bC6E13048601f0d4",
      symbol: "cCOP",
      decimals: 18,
      name: "Celo Colombian Peso",
    },
    CUSD: {
      address: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
      symbol: "CUSD",
      decimals: 18,
      name: "Celo Dollar",
    },
    CEUR: {
      address: "0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F",
      symbol: "CEUR",
      decimals: 18,
      name: "Celo Euro",
    },
    USDC: {
      address: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B",
      symbol: "USDC",
      decimals: 6,
      name: "USD Coin",
    },
  },
};
```

## 🌐 Backend Integration

### Required Endpoints

#### GET /api/blockchain/status/:invoiceId

**Query params:** `network`

**Response:**

```json
{
  "success": true,
  "data": {
    "invoiceId": "string",
    "exists": boolean,
    "status": "pending" | "paid" | "expired" | "refunded" | "not_found",
    "commerce": "string",
    "expiresAt": number,
    "paymentOptions": [
      {
        "token": "string", // Contract address
        "amount": "string"
      }
    ]
  }
}
```

#### POST /api/blockchain/create

**Request:**

```json
{
  "invoiceId": "string",
  "paymentOptions": [
    {
      "token": "string", // Contract address
      "amount": "string"
    }
  ],
  "network": "string"
}
```

#### PUT /api/invoices/:id/payment-data

**Request:**

```json
{
  "paid_token": "0xe6A57340f0df6E020c1c0a80bC6E13048601f0d4",
  "paid_network": "alfajores",
  "paid_tx_hash": "0x35cc5d36f5d550ad4dc78b28791bb1adfc048d94d00be39bfe65c865f7097386",
  "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
  "paid_amount": 102.806000963941002624
}
```

#### POST /api/invoices/:id/status

**Request:**

```json
{
  "status": "paid"
}
```

## 🎯 Component Usage

### PaymentButton Component

```tsx
import { PaymentButton } from "./components/PaymentButton";
import { PaymentOption } from "./blockchain/types";

const paymentOptions: PaymentOption[] = [
  {
    token: "cCOP",
    amount: "102.806000963941002624",
  },
];

<PaymentButton
  invoiceId="invoice-123"
  paymentOptions={paymentOptions}
  onSuccess={() => console.log("Payment successful!")}
  onError={(error) => console.error("Payment error:", error)}
  hasSufficientBalance={true}
  className="custom-button-class"
/>;
```

### usePaymentButton Hook

```tsx
import { usePaymentButton } from "./hooks/usePaymentButton";

const {
  buttonState,
  buttonText,
  isButtonDisabled,
  handleButtonClick,
  selectedToken,
} = usePaymentButton({
  invoiceId: "invoice-123",
  paymentOptions: [{ token: "cCOP", amount: "102.806000963941002624" }],
  onSuccess: () => console.log("Success!"),
  onError: (error) => console.error("Error:", error),
  hasSufficientBalance: true,
});
```

## 🔒 Smart Contract Integration

### Token Approval

```typescript
// Approve token spending
const tokenContract = new ethers.Contract(
  tokenConfig.address,
  ["function approve(address spender, uint256 amount) external returns (bool)"],
  signer
);

const approveTx = await tokenContract.approve(
  networkContracts.DERAMP_PROXY,
  amount
);
```

### Payment Execution

```typescript
// Execute payment
const derampProxyContract = new ethers.Contract(
  networkContracts.DERAMP_PROXY,
  derampProxyAbi,
  signer
);

const invoiceIdBytes32 = ethers.id(invoiceId);
const amount = ethers.parseUnits(paymentOption.amount, tokenConfig.decimals);

const payTx = await derampProxyContract.payInvoice(
  invoiceIdBytes32,
  tokenConfig.address,
  amount,
  { gasLimit: 500000, value: 0 }
);
```

## 🚨 Error Handling

### Common Error Scenarios

1. **Wallet not connected**

   - Message: "Please connect your wallet first"
   - Action: Show wallet connection prompt

2. **Wrong network**

   - Message: "Please switch to Celo Alfajores network"
   - Action: Request network switch

3. **Insufficient balance**

   - Message: "Insufficient {TOKEN} balance"
   - Action: Show balance information

4. **Insufficient allowance**

   - Message: "Please authorize {TOKEN} first"
   - Action: Request token approval

5. **Transaction failed**

   - Message: "Payment failed. Please try again."
   - Action: Allow retry

6. **Backend error**
   - Message: "Unable to process payment. Please try again."
   - Action: Graceful fallback

### Error Messages in Both Languages

All error messages are localized in English and Spanish:

```typescript
// English
"Please connect your wallet first";
"Payment failed. Please try again.";

// Spanish
"Por favor conecta tu wallet primero";
"El pago falló. Por favor intenta de nuevo.";
```

## 🔧 Development Configuration

### Environment Variables

```bash
# Required
VITE_BACKEND_URL=http://127.0.0.1:3000

# Optional (has fallback)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

### CORS Configuration

The app uses Vite's proxy in development to avoid CORS issues:

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: env.VITE_BACKEND_URL || 'http://127.0.0.1:3005',
    changeOrigin: true,
    secure: false,
  },
}
```

### URL Configuration

```typescript
// All services use this pattern
const baseUrl = import.meta.env.DEV ? "" : import.meta.env.VITE_BACKEND_URL;

// Development: /api/... (uses proxy)
// Production: https://backend.com/api/... (direct URL)
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "ethers": "^6.8.1",
    "wagmi": "^1.4.7",
    "react": "^18.2.0",
    "typescript": "^5.0.2"
  }
}
```

## 🧪 Testing

### Manual Testing Steps

1. **Setup**

   - Start backend server on port 3000
   - Connect MetaMask to Celo Alfajores
   - Get test tokens from [Celo Faucet](https://faucet.celo.org/)

2. **Test Payment Flow**

   - Navigate to `/checkout/{invoice-id}`
   - Connect wallet
   - Select token (cCOP, CUSD, etc.)
   - Click "Pay Now"
   - Authorize token
   - Confirm payment
   - Verify Order ID appears

3. **Test Error Scenarios**
   - Try with insufficient balance
   - Try with wrong network
   - Try with disconnected wallet
   - Verify error messages appear correctly

## 🚀 Production Deployment

### Build Process

```bash
npm run build
```

### Environment Configuration

```bash
# Production .env
VITE_BACKEND_URL=https://your-backend.com
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Deployment Checklist

- [ ] Backend endpoints are implemented and tested
- [ ] Smart contracts are deployed and verified
- [ ] Environment variables are configured
- [ ] CORS is properly configured on backend
- [ ] SSL certificates are valid
- [ ] Error monitoring is set up

## 📚 Resources

- [Ethers.js Documentation](https://docs.ethers.org/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Celo Documentation](https://docs.celo.org/)
- [DeRamp Smart Contracts](https://github.com/deramp/contracts)

## 🔄 Future Improvements

### Planned Features

1. **Multiple Networks**

   - Support for Celo Mainnet
   - Support for other EVM chains

2. **Enhanced UX**

   - Gas estimation before transactions
   - Transaction progress indicators
   - Payment history

3. **Advanced Features**

   - Batch payments
   - Recurring payments
   - Payment scheduling

4. **Analytics**
   - Payment success rates
   - User behavior tracking
   - Performance metrics

---

**Note:** This implementation provides a complete, production-ready crypto payment flow with proper error handling, user feedback, and backend integration.
