import { api } from './api';
import type { 
  InvoiceListItem, 
  InvoiceDetail, 
  InvoiceFilters 
} from '@/types/billing';
import type { PaginatedResponse, PaginationInfo } from '@/types/order';

interface ApiResponse<T> {
  StatusCode: number;
  IsSuccess: boolean;
  ErrorMessage: any;
  Result: T;
}

class BillingService {
  /**
   * Fetch a paginated list of invoices based on filters
   */
  async getInvoices(filters: InvoiceFilters = {}): Promise<PaginatedResponse<InvoiceListItem>> {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.invoice_number) params.append('invoice_number', filters.invoice_number);
    if (filters.order_number) params.append('order_number', filters.order_number);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.size) params.append('page_size', filters.size.toString());

    const response = await api.get<ApiResponse<PaginatedResponse<InvoiceListItem>>>(
        `/billing/invoices/?${params.toString()}`
    );
    
    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || 'Failed to fetch invoices');
    }
    return response.data.Result;
  }

  /**
   * Fetch details for a specific invoice
   */
  async getInvoiceByNumber(invoiceNumber: string): Promise<InvoiceDetail> {
    const response = await api.get<ApiResponse<InvoiceDetail>>(`/billing/invoices/${invoiceNumber}/`);
    
    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || 'Failed to fetch invoice detail');
    }
    return response.data.Result;
  }

  /**
   * Get pagination info from response
   */
  getPaginationInfo(
    response: PaginatedResponse<any>,
    currentPage: number,
    pageSize: number
  ): PaginationInfo {
    return {
      current_page: currentPage,
      page_size: pageSize,
      total_count: response.count,
      total_pages: Math.ceil(response.count / pageSize),
      has_next: !!response.next,
      has_previous: !!response.previous,
    };
  }
}

export const billingService = new BillingService();
