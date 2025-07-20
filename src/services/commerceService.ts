export interface CommerceData {
  id: string;
  name: string;
  description_spanish?: string;
  description_english?: string;
  icon_url?: string;
  currency: string;
  currency_symbol: string;
  supported_tokens?: string[];
  min_amount?: number;
  max_amount?: number;
}

export interface CommerceResponse {
  success: boolean;
  data?: CommerceData;
  error?: string;
}

export const getCommerce = async (commerceId: string): Promise<CommerceResponse> => {
  try {
    // Use proxy in development, full URL in production
    const baseUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_BACKEND_URL;
    
    // Validate that backend URL is configured in production
    if (!import.meta.env.DEV && !import.meta.env.VITE_BACKEND_URL) {
      console.error('VITE_BACKEND_URL environment variable is not configured');
      return { success: false, error: 'Backend configuration error' };
    }

    // Build the full URL for debugging
    const fullUrl = `${baseUrl}/api/commerces/${commerceId}`;
    
    // Debug logging
    console.log('🔍 getCommerce Debug Info:');
    console.log('  - Environment:', import.meta.env.DEV ? 'DEVELOPMENT' : 'PRODUCTION');
    console.log('  - Base URL:', baseUrl || '(using proxy)');
    console.log('  - Commerce ID:', commerceId);
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
        return { success: false, error: 'Commerce not found' };
      }
      if (response.status >= 500) {
        return { success: false, error: 'Server error. Please try again later.' };
      }
      return { success: false, error: `Request failed with status ${response.status}` };
    }

    // Parse and return response
    const data = await response.json();
    return data;

  } catch (error) {
    // Handle network errors
    console.error('Error fetching commerce:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
    
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}; 