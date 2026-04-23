import { api } from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type { 
  OrderListItem,
  OrderDetail,
  CreateOrderData, 
  OrderStats, 
  OrderFilters, 
  PublicOrderTracking,
  NearbyOrderRequestListItem,
  NearbyOrderRequestDetail,
  NearbyOrderRequestAction,
  NearbyOrderRequestActionResponse,
  PaginatedResponse,
  PaginationInfo
} from '../types/order';

interface ApiResponse<T> {
  StatusCode: number;
  IsSuccess: boolean;
  ErrorMessage: any;
  Result: T;
}

export const orderService = {
  /**
   * Create a new manual order
   */
  createOrder: async (orderData: CreateOrderData): Promise<OrderDetail> => {
    const response = await api.post<ApiResponse<OrderDetail>>(API_ENDPOINTS.ORDERS.MANUAL.CREATE, orderData);
    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || 'Failed to create order');
    }
    return response.data.Result;
  },

  /**
   * Get list of manual orders with optional filters (paginated)
   */
  getOrders: async (filters?: OrderFilters): Promise<PaginatedResponse<OrderListItem>> => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.payment_status) params.append('payment_status', filters.payment_status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.size) params.append('size', filters.size.toString());

    const response = await api.get<ApiResponse<PaginatedResponse<OrderListItem>>>(
      `${API_ENDPOINTS.ORDERS.MANUAL.LIST}?${params.toString()}`
    );
    
    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || 'Failed to fetch orders');
    }
    return response.data.Result;
  },

  /**
   * Get order details by order number
   */
  getOrderDetail: async (orderNumber: string): Promise<OrderDetail> => {
    const response = await api.get<ApiResponse<OrderDetail>>(
      API_ENDPOINTS.ORDERS.MANUAL.DETAIL(orderNumber)
    );
    
    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || 'Failed to fetch order details');
    }
    return response.data.Result;
  },

  /**
   * Update payment status of an order
   */
  updatePaymentStatus: async (
    orderNumber: string,
    paymentStatus: 'pending' | 'paid'
  ): Promise<OrderDetail> => {
    const response = await api.patch<ApiResponse<OrderDetail>>(
      API_ENDPOINTS.ORDERS.PAYMENT(orderNumber),
      { payment_status: paymentStatus }
    );
    
    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || 'Failed to update payment status');
    }
    return response.data.Result;
  },

  /**
   * Get order statistics
   */
  getOrderStats: async (): Promise<OrderStats> => {
    const response = await api.get<ApiResponse<OrderStats>>(API_ENDPOINTS.ORDERS.STATS);
    
    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || 'Failed to fetch order stats');
    }
    return response.data.Result;
  },

  /**
   * Track order publicly (no authentication required)
   */
  trackOrder: async (orderNumber: string): Promise<PublicOrderTracking[]> => {
    const response = await api.get<ApiResponse<PublicOrderTracking[]>>(
      API_ENDPOINTS.ORDERS.TRACKING.PUBLIC(orderNumber)
    );
    
    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || 'Order not found');
    }
    return response.data.Result;
  },

  /**
   * Get nearby online order requests for courier location
   */
  getNearbyOrderRequests: async (): Promise<NearbyOrderRequestListItem[]> => {
    const response = await api.get<ApiResponse<NearbyOrderRequestListItem[]>>(
      API_ENDPOINTS.ORDERS.REQUESTS.NEARBY_LIST
    );

    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || 'Failed to fetch nearby order requests');
    }

    return response.data.Result;
  },

  /**
   * Get detail of one nearby online order request
   */
  getNearbyOrderRequestDetail: async (requestNumber: string): Promise<NearbyOrderRequestDetail> => {
    const response = await api.get<ApiResponse<NearbyOrderRequestDetail>>(
      API_ENDPOINTS.ORDERS.REQUESTS.NEARBY_DETAIL(requestNumber)
    );

    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || 'Failed to fetch order request detail');
    }

    return response.data.Result;
  },

  /**
   * Perform action on nearby online order request (accept/decline/ignore)
   */
  actOnNearbyOrderRequest: async (
    requestNumber: string,
    action: NearbyOrderRequestAction,
    reason?: string,
  ): Promise<NearbyOrderRequestActionResponse> => {
    const payload: { action: NearbyOrderRequestAction; reason?: string } = { action };
    if (reason && reason.trim()) {
      payload.reason = reason.trim();
    }

    const response = await api.post<ApiResponse<NearbyOrderRequestActionResponse>>(
      API_ENDPOINTS.ORDERS.REQUESTS.NEARBY_ACTION(requestNumber),
      payload,
    );

    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || `Failed to ${action} order request`);
    }

    return response.data.Result;
  },

  /**
   * Helper function to extract pagination info from paginated response
   */
  getPaginationInfo: (
    paginatedResponse: PaginatedResponse<any>,
    currentPage: number,
    pageSize: number
  ): PaginationInfo => {
    const totalCount = paginatedResponse.count;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      current_page: currentPage,
      page_size: pageSize,
      total_count: totalCount,
      total_pages: totalPages,
      has_next: paginatedResponse.next !== null,
      has_previous: paginatedResponse.previous !== null,
    };
  },
};
