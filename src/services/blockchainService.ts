import { BlockchainStatusResponse, BlockchainCreateRequest, BlockchainCreateResponse } from '../blockchain/types';

// Use proxy in development, full URL in production
const baseUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_BACKEND_URL;

if (!import.meta.env.DEV && !import.meta.env.VITE_BACKEND_URL) {
  console.error('VITE_BACKEND_URL environment variable is not configured');
}

export class BlockchainService {
  static async getStatus(invoiceId: string, network: string): Promise<BlockchainStatusResponse> {
    try {
      const url = `${baseUrl}/api/blockchain/status/${invoiceId}?network=${network}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting blockchain status:', error);
      throw error;
    }
  }

  static async createInvoice(request: BlockchainCreateRequest): Promise<BlockchainCreateResponse> {
    try {
      const response = await fetch(`${baseUrl}/api/blockchain/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating blockchain invoice:', error);
      throw error;
    }
  }

  static async updatePaymentData(
    invoiceId: string, 
    paymentData: {
      paid_token: string;
      paid_network: string;
      paid_tx_hash: string;
      wallet_address: string;
      paid_amount: number; // Backend expects number, not string
    }
  ): Promise<any> {
    try {
      console.log('🔧 DEBUG: updatePaymentData called with:', {
        baseUrl,
        fullUrl: `${baseUrl}/api/invoices/${invoiceId}/payment-data`,
        paymentData
      });
      
      const response = await fetch(`${baseUrl}/api/invoices/${invoiceId}/payment-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      console.log('🔧 DEBUG: updatePaymentData response:', {
        status: response.status,
        ok: response.ok,
        url: response.url
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔧 DEBUG: updatePaymentData error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔧 DEBUG: updatePaymentData success:', data);
      return data;
    } catch (error) {
      console.error('Error updating payment data:', error);
      throw error;
    }
  }

  static async updateInvoiceStatus(invoiceId: string, status: string): Promise<void> {
    try {
      console.log('🔧 DEBUG: updateInvoiceStatus called with:', {
        baseUrl,
        fullUrl: `${baseUrl}/api/invoices/${invoiceId}/status`,
        status
      });
      
      const response = await fetch(`${baseUrl}/api/invoices/${invoiceId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      console.log('🔧 DEBUG: updateInvoiceStatus response:', {
        status: response.status,
        ok: response.ok,
        url: response.url
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔧 DEBUG: updateInvoiceStatus error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }
} 