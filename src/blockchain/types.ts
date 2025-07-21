export interface PaymentOption {
  token: string;
  amount: string;
}

export interface BlockchainStatusResponse {
  success: boolean;
  data: {
    invoiceId: string;
    exists: boolean;
    status: string; // "pending", "paid", "expired", "refunded", "not_found"
    commerce: string;
    expiresAt: number;
    paymentOptions: PaymentOption[];
    paidAmount?: string;
    paidToken?: string;
    paidAt?: number;
  };
}

export interface BlockchainCreateRequest {
  invoiceId: string;
  paymentOptions: PaymentOption[];
  network: string;
  expiresAt?: number;
  // supportsENS?: boolean; // Temporarily removed to test if this was causing the issue
}

export interface BlockchainCreateResponse {
  success: boolean;
  data: {
    success: boolean;
    transactionHash?: string;
    invoiceId: string;
    blockNumber: number;
    blockchainInvoiceId: string;
    commerce: string;
    expiresAt: number;
    paymentOptions: PaymentOption[];
  };
}

export type ButtonState = 
  | 'initial'      // "Pay Now" / "Pagar Ahora"
  | 'loading'      // "Preparando tu pago..." / "Preparing your payment..."
  | 'ready'        // "Autorizar NOMBRETOKEN" / "Authorize NOMBRETOKEN"
  | 'approving'    // "Autorizando NOMBRETOKEN..." / "Authorizing NOMBRETOKEN..."
  | 'confirm'      // "Confirmar pago" / "Confirm Payment"
  | 'processing';  // "Procesando pago..." / "Processing payment..." 