// Shipping Batch Types

export interface ShippingBatch {
  id: number;
  bucket_number: string;
  origin_city: string;
  origin_state: string;
  created_by_name?: string;
  created_at: string;
  closed_at?: string;
  
  // Summary Data
  order_count?: number;
  orders?: ShippingOrder[];
  tracking_history?: ShippingTracking[];
  stops?: ShippingStop[];
}

// Keep the old name for backwards compatibility
export type TransportBucket = ShippingBatch;

export interface ShippingOrder {
  id: number;
  order_number: string;
  receiver_city: string;
  receiver_name: string;
  package_type: string;
  weight: string;
  added_at: string;
}

export interface ShippingStop {
  id: number;
  city: string;
  state: string;
  stop_order: number;
  orders_count: number;
}

export interface ShippingTracking {
  id: number;
  action: 'departed_origin' | 'arrived_transit' | 'departed_transit' | 'arrived_destination' | 'partial_unload';
  action_display?: string;
  location_city: string;
  stop_city?: string;
  orders_updated_count: number;
  scanned_by_name?: string;
  created_at: string;
  notes?: string;
}

export interface CreateShippingBatchData {
  origin_city: string;
  origin_state: string;
  stops: Array<{
    city: string;
    state: string;
    stop_order: number;
  }>;
}

export interface AddOrdersToShippingData {
  order_numbers: string[];
}

export interface UpdateShippingLocationData {
  action: 'departed_origin' | 'arrived_transit' | 'departed_transit' | 'arrived_destination' | 'partial_unload';
  location_city: string;
  bucket_stop_id?: number;
}

export interface ShippingBatchFilters {
  status?: 'open' | 'closed';
  origin_city?: string;
  destination_city?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

// Backwards compatibility aliases
export type BucketOrder = ShippingOrder;
export type BucketStop = ShippingStop;
export type BucketTracking = ShippingTracking;
export type CreateBucketData = CreateShippingBatchData;
export type AddOrdersToBucketData = AddOrdersToShippingData;
export type UpdateBucketLocationData = UpdateShippingLocationData;
export type BucketFilters = ShippingBatchFilters;

// Tracking event result
export interface TrackingEventResult {
  bucket_tracking_id: number;
  action: string;
  location_city: string;
  orders_updated: number;
  order_ids: number[];
  duplicate: boolean;
  timestamp: string;
}
