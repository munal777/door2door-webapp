export interface OrderListItem {
  id: number;
  order_number: string;
  status_display: string;
  sender_name: string;
  sender_city: string;
  sender_phone: string;
  receiver_name: string;
  receiver_city: string;
  receiver_phone: string;
  package_type_display: string;
  service_type_display: string;
  payment_status_display: string;
  total_price: number;
  weight: number;
  total_quantity: number;
  created_at: string;
}

/**
 * Detailed order data for detail views
 * Matches OrderDetailSerializer from backend
 */
export interface OrderDetail {
  id: number;
  order_number: string;
  order_type_display: string;
  status_display: string;
  
  // Sender Information
  sender_name: string;
  sender_phone: string;
  sender_email?: string;
  sender_address: string;
  sender_city: string;
  sender_state: string;
  
  // Receiver Information
  receiver_name: string;
  receiver_phone: string;
  receiver_email?: string;
  receiver_address: string;
  receiver_city: string;
  receiver_state: string;
  
  // Package Information
  package_type_display: string;
  weight: number;
  total_quantity: number;
  length?: number;
  width?: number;
  height?: number;
  package_description?: string;
  
  // Service & Pricing
  service_type_display: string;
  estimated_delivery_hours: number;
  total_price: number;
  
  // Payment
  payment_method_display: string;
  payment_status_display: string;
  
  // Courier Information
  courier_provider_name: string;
  created_by_name?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  
  // Tracking History
  tracking_history?: OrderTracking[];
}

export interface CreateOrderData {
  service_type: 'standard' | 'express';
  
  // Sender Information
  sender_name: string;
  sender_phone: string;
  sender_email?: string;
  sender_address: string;
  sender_city: string;
  sender_state: string;
  
  // Receiver Information
  receiver_name: string;
  receiver_phone: string;
  receiver_email?: string;
  receiver_address: string;
  receiver_city: string;
  receiver_state: string;
  
  // Package Information
  package_type: 'document' | 'package';
  weight: number;
  total_quantity: number;
  length?: number;
  width?: number;
  height?: number;
  package_description?: string;
  
  // Payment
  payment_method: 'cod' | 'esewa';
  payment_status?: 'pending' | 'paid';
}

export interface OrderUpdateData {
  // Status updates
  status?: 'pending' | 'confirmed' | 'pickup_assigned' | 'picked_up' | 'at_origin_hub' | 'in_transit' | 'at_destination_hub' | 'delivery_assigned' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: 'cod' | 'esewa' | 'sender_prepaid';
  remarks?: string;
  // Parcel corrections
  weight?: number;
  total_quantity?: number;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  package_description?: string;
}

export interface OrderTracking {
  id: number;
  order: number;
  status: string;
  location_city: string;
  remarks: string;
  created_at: string;
}

export interface PublicOrderTracking {
  order_number: string;
  status: string;
  location_city: string;
  remarks: string;
  created_at: string;
}

export interface OrderStats {
  total_manual_orders: number;
  by_status: {
    pending: number;
    confirmed: number;
    picked_up: number;
    in_transit: number;
    delivery_assigned: number;
    out_for_delivery: number;
    delivered: number;
    cancelled: number;
    returned: number;
  };
  by_payment_status: {
    pending: number;
    paid: number;
    refunded: number;
  };
  by_service_type: {
    standard: number;
    express: number;
  };
}

export interface OrderFilters {
  status?: string;
  payment_status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  size?: number;
}

export interface NearbyOrderRequestListItem {
  id: number;
  request_number: string;
  pickup_city: string;
  pickup_state: string;
  delivery_city: string;
  delivery_state: string;
  package_type_display: string;
  weight: number;
  service_type_display: string;
  estimated_price: number;
  created_at: string;
  expires_at: string;
}

export interface NearbyOrderRequestDetail {
  id: number;
  request_number: string;
  pickup_name: string;
  pickup_phone: string;
  pickup_address: string;
  pickup_city: string;
  pickup_state: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  package_type_display: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  package_description?: string;
  service_type_display: string;
  estimated_price: number;
  created_at: string;
  expires_at: string;
}

export type NearbyOrderRequestAction = 'accept' | 'decline' | 'ignore';

export interface NearbyOrderRequestActionResponse {
  message: string;
  request_number: string;
  status?: string;
  accepted_by?: string;
  order_number?: string;
  action?: NearbyOrderRequestAction;
}

/**
 * Paginated response wrapper
 * Matches Django REST Framework's PageNumberPagination response
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Pagination metadata
 */
export interface PaginationInfo {
  current_page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}
