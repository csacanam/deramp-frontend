import { InvoiceResponse } from '../types/invoice';

export interface CreateInvoiceRequest {
  commerce_id: string;
  amount_fiat: number;
}

export interface CreateInvoiceResponse {
  success: boolean;
  data?: {
    id: string;
    commerce_id: string;
    amount_fiat: number;
    fiat_currency: string;
    status: string;
    expires_at: string | null;
    created_at: string;
  };
  error?: string;
}

export const createInvoice = async (request: CreateInvoiceRequest): Promise<CreateInvoiceResponse> => {
  try {
    // Use proxy in development, full URL in production
    const baseUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_BACKEND_URL;
    
    // Validate that backend URL is configured in production
    if (!import.meta.env.DEV && !import.meta.env.VITE_BACKEND_URL) {
      console.error('VITE_BACKEND_URL environment variable is not configured');
      return { success: false, error: 'Backend configuration error' };
    }

    const response = await fetch(`${baseUrl}/api/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to create invoice'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.'
    };
  }
};

export const getInvoice = async (invoiceId: string): Promise<InvoiceResponse> => {
  try {
    // Use proxy in development, full URL in production
    const baseUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_BACKEND_URL;
    
    // Validate that backend URL is configured in production
    if (!import.meta.env.DEV && !import.meta.env.VITE_BACKEND_URL) {
      console.error('VITE_BACKEND_URL environment variable is not configured');
      return { error: 'Backend configuration error' };
    }

    // Build the full URL for debugging
    const fullUrl = `${baseUrl}/api/invoices/${invoiceId}`;
    
    // Debug logging
    console.log('🔍 getInvoice Debug Info:');
    console.log('  - Environment:', import.meta.env.DEV ? 'DEVELOPMENT' : 'PRODUCTION');
    console.log('  - Base URL:', baseUrl || '(using proxy)');
    console.log('  - Invoice ID:', invoiceId);
    console.log('  - Full URL:', fullUrl);
    console.log('  - VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL || 'NOT SET');

    // Make API call to backend
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Debug response info
    console.log('📡 Response Info:');
    console.log('  - Status:', response.status);
    console.log('  - Status Text:', response.statusText);
    console.log('  - OK:', response.ok);
    console.log('  - URL:', response.url);

    // Handle HTTP errors
    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status, response.statusText);
      if (response.status === 404) {
        return { error: 'Invoice not found' };
      }
      if (response.status >= 500) {
        return { error: 'Server error. Please try again later.' };
      }
      return { error: `Request failed with status ${response.status}` };
    }

    // Parse and return response
    const data = await response.json();
    return data;

  } catch (error) {
    // Handle network errors
    console.error('Error fetching invoice:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { error: 'Network error. Please check your connection and try again.' };
    }
    
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};