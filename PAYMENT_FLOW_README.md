# 🚀 Simplified Payment Flow - DeRamp Frontend

## 📋 Summary

This document describes the implementation of the simplified payment flow for the DeRamp frontend, which handles interaction with smart contracts on the Celo blockchain.

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
│   │   └── README.md         # ABI documentation
│   └── types.ts              # Blockchain types
├── services/
│   └── blockchainService.ts  # Blockchain API services
├── hooks/
│   └── usePaymentButton.ts   # Payment button hook
├── components/
│   ├── PaymentButton.tsx     # Payment button component
│   └── CheckoutPageWithPaymentButton.tsx  # Integration example
└── types/
    └── global.d.ts           # Global types (window.ethereum)
```

## 🔄 Button State Flow

### States and Texts

| State       | English                     | Spanish                  | Action                          |
| ----------- | --------------------------- | ------------------------ | ------------------------------- |
| `initial`   | "Pay Now"                   | "Pagar ahora"            | Click → Check blockchain status |
| `loading`   | "Preparing your payment..." | "Preparando tu pago..."  | Verifying/creating invoice      |
| `ready`     | "Authorize {TOKEN}"         | "Autorizar {TOKEN}"      | Click → Approve token           |
| `approving` | "Authorizing {TOKEN}..."    | "Autorizando {TOKEN}..." | Executing approve()             |
| `confirm`   | "Confirm Payment"           | "Confirmar pago"         | Click → Confirm payment         |

### Simplified Flow

1. **Click "Pay Now"**

   - Changes to "Preparing your payment..." state
   - Verifies GET `/api/blockchain/status/:invoiceId?network=:network`

2. **Process Verification**

   - If NOT exists in blockchain: Create with POST `/api/blockchain/create`
   - If exists and is PENDING: Change directly to "Authorize {TOKEN}"
   - If exists but is EXPIRED/REFUNDED/PAID: Update backend and refresh page

3. **Click "Authorize {TOKEN}"**

   - Changes to "Authorizing {TOKEN}..." state
   - Executes approve() for selected token
   - Changes to "Confirm Payment"

4. **Click "Confirm Payment"**
   - Executes payment confirmation logic (TODO)

## 🔧 Configuration

### Supported Networks

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

### Contracts

```typescript
// src/blockchain/config/contracts.ts
export const CONTRACTS = {
  alfajores: {
    DERAMP_PROXY: "0xc44cDAdf371DFCa94e325d1B35e27968921Ef668",
    DERAMP_STORAGE: "0x25f5A82B9B021a35178A25540bb0f052fF22e6b4",
    ACCESS_MANAGER: "0x776D9E84D5DAaecCb014f8aa8D64a6876B47a696",
    INVOICE_MANAGER: "0xe7c011eB0328287B11aC711885a2f76d5797012f",
    PAYMENT_PROCESSOR: "0x23b353F6B8F90155f7854Ca3813C0216819543B1",
  },
};
```

### Supported Tokens

```typescript
// src/blockchain/config/tokens.ts
export const TOKENS = {
  alfajores: {
    CELO: { address: "0x0000000000000000000000000000000000000000", ... },
    CCOP: { address: "0xe6A57340f0df6E020c1c0a80bC6E13048601f0d4", ... },
    CUSD: { address: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1", ... },
    CEUR: { address: "0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F", ... },
    USDC: { address: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B", ... },
  },
};
```

## 🌐 Backend Endpoints

### GET /api/blockchain/status/:invoiceId

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
        "token": "string",
        "amount": "string"
      }
    ],
    "paidAmount": "string",
    "paidToken": "string",
    "paidAt": number
  }
}
```

### POST /api/blockchain/create

**Request:**

```json
{
  "invoiceId": "string",
  "paymentOptions": [
    {
      "token": "string",
      "amount": "string"
    }
  ],
  "network": "string",
  "expiresAt": number
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "success": boolean,
    "transactionHash": "string",
    "invoiceId": "string",
    "blockNumber": number,
    "blockchainInvoiceId": "string",
    "commerce": "string",
    "expiresAt": number,
    "paymentOptions": [...]
  }
}
```

### PUT /api/invoices/:id/status

**Request:**

```json
{
  "status": "string"
}
```

## 🎯 Component Usage

### PaymentButton

```tsx
import { PaymentButton } from "./components/PaymentButton";
import { PaymentOption } from "./blockchain/types";

const paymentOptions: PaymentOption[] = [{ token: "CUSD", amount: "10.5" }];

<PaymentButton
  invoiceId="invoice-123"
  paymentOptions={paymentOptions}
  onSuccess={() => console.log("Payment successful!")}
  onError={(error) => console.error("Payment error:", error)}
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
  paymentOptions: [{ token: "CUSD", amount: "10.5" }],
  onSuccess: () => console.log("Success!"),
  onError: (error) => console.error("Error:", error),
});
```

## 🔒 Validations

- ✅ Verify network is valid
- ✅ Verify invoiceId is valid
- ✅ Verify paymentOptions is not empty
- ✅ Handle network errors
- ✅ Handle timeouts
- ✅ Verify wallet connection
- ✅ Verify sufficient balance

## 🚨 Error Handling

### Common Errors

1. **Wallet not connected**

   - Message: "Please connect your wallet first"
   - Action: Show connection button

2. **Unsupported network**

   - Message: "Unsupported network"
   - Action: Request network change

3. **Unsupported token**

   - Message: "Unsupported token"
   - Action: Show available tokens

4. **Insufficient balance**

   - Message: "Insufficient balance"
   - Action: Show purchase options

5. **Network error**
   - Message: "Network error. Please check your connection"
   - Action: Retry automatically

## 📦 Dependencies

```json
{
  "dependencies": {
    "ethers": "^6.0.0",
    "wagmi": "^1.0.0"
  }
}
```

## 🔄 Next Steps

### Pending

1. **Contract ABIs**

   - Add real ABIs in `src/blockchain/abi/`
   - DERAMP_PROXY.json
   - DERAMP_STORAGE.json
   - ACCESS_MANAGER.json
   - INVOICE_MANAGER.json
   - PAYMENT_PROCESSOR.json

2. **Confirmation Logic**

   - Implement `handleConfirm` in `usePaymentButton`
   - Integrate with PAYMENT_PROCESSOR contract

3. **Backend Endpoints**

   - Implement endpoints in backend
   - GET /api/blockchain/status/:invoiceId
   - POST /api/blockchain/create
   - PUT /api/invoices/:id/status

4. **Testing**
   - Unit tests for hooks
   - Integration tests for components
   - End-to-end flow tests

### Future Improvements

1. **Multiple Tokens**

   - Support for simultaneous multi-token payments
   - UI for token selection

2. **Gas Optimization**

   - Gas estimation before transactions
   - Gas optimization for approve

3. **Retry Logic**

   - Automatic retries on network failures
   - Failed transaction handling

4. **Analytics**
   - Payment event tracking
   - Conversion metrics

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Specific Tests

```bash
# Payment hook test
npm test usePaymentButton

# PaymentButton component test
npm test PaymentButton

# Blockchain service test
npm test blockchainService
```

## 📚 Resources

- [Ethers.js Documentation](https://docs.ethers.org/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Celo Documentation](https://docs.celo.org/)
- [DeRamp Smart Contracts](https://github.com/deramp/contracts)

---

**Note:** This implementation is designed to be simple and robust, handling the most common error cases and providing a smooth user experience.
