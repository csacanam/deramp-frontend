import { InvoiceResponse } from '../types/invoice';

export const getInvoice = async (invoiceId: string): Promise<InvoiceResponse> => {
  try {
    // Use proxy in development, full URL in production
    const baseUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_BACKEND_URL;
    
    // Validate that backend URL is configured in production
    if (!import.meta.env.DEV && !import.meta.env.VITE_BACKEND_URL) {
      console.error('VITE_BACKEND_URL environment variable is not configured');
      return { error: 'Backend configuration error' };
    }

    // Make API call to backend
    const response = await fetch(`${baseUrl}/api/invoices/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Handle HTTP errors
    if (!response.ok) {
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