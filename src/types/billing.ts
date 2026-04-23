export type InvoiceStatus = 'issued' | 'paid' | 'cancelled';

export interface InvoiceListItem {
  invoice_number: string;
  status: InvoiceStatus;
  order: number;
  order_number: string;
  total_quantity: number;
  currency: string;
  total_amount: string; // Decimal from API
  issue_date: string;
  created_at: string;
}

export interface InvoiceDetail {
  invoice_number: string;
  status: InvoiceStatus;
  courier_provider_name: string;
  order_number: string;
  total_quantity: number;
  
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  sender_city: string;
  
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  receiver_city: string;

  currency: string;
  total_amount: string;
  issue_date: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceFilters {
  status?: string;
  date_from?: string;
  date_to?: string;
  invoice_number?: string;
  order_number?: string;
  page?: number;
  size?: number;
}
