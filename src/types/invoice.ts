export interface Token {
  id?: string;
  name: string;
  symbol: string;
  network: string;
  contract_address: string;
  decimals: number;
  rate_to_usd?: number;
  amount_to_pay?: string;
  updated_at?: string;
}

export interface GroupedToken {
  symbol: string;
  name: string;
  networks: {
    network: string;
    contract_address: string;
    decimals: number;
    id?: string;
    rate_to_usd?: number;
    amount_to_pay?: string;
    updated_at?: string;
  }[];
}

export interface Invoice {
  id: string;
  commerce_id: string;
  commerce_name: string;
  amount_fiat: number;
  fiat_currency: string;
  amount_usd?: string;
  usd_to_fiat_rate?: number;
  status: 'Pending' | 'Paid' | 'Refunded' | 'Expired';
  tokens: Token[];
  expires_at?: string;
  commerce_icon_url?: string;
}

export interface InvoiceError {
  error: string;
}

export type InvoiceResponse = Invoice | InvoiceError;