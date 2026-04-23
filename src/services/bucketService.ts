import { api } from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type {
  TransportBucket,
  CreateBucketData,
  AddOrdersToBucketData,
  UpdateBucketLocationData,
  BucketFilters,
  TrackingEventResult,
} from '../types/bucket';

interface ApiResponse<T> {
  StatusCode: number;
  IsSuccess: boolean;
  ErrorMessage: any;
  Result: T;
}

export const bucketService = {
  /**
   * Create a new transport bucket
   */
  createBucket: async (bucketData: CreateBucketData): Promise<TransportBucket> => {
    const response = await api.post<ApiResponse<TransportBucket>>(
      API_ENDPOINTS.ORDERS.SHIPPING.CREATE,
      bucketData
    );
    
    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || 'Failed to create transport bucket');
    }
    return response.data.Result;
  },

  /**
   * Get list of transport buckets with optional filters
   */
  getBuckets: async (filters?: BucketFilters): Promise<TransportBucket[]> => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.origin_city) params.append('origin_city', filters.origin_city);
    if (filters?.destination_city) params.append('destination_city', filters.destination_city);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);

    const response = await api.get<ApiResponse<TransportBucket[]>>(
      `${API_ENDPOINTS.ORDERS.SHIPPING.LIST}?${params.toString()}`
    );
    
    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || 'Failed to fetch transport buckets');
    }
    return response.data.Result;
  },

  /**
   * Get bucket details by bucket number
   */
  getBucketDetail: async (bucketNumber: string): Promise<TransportBucket> => {
    const response = await api.get<ApiResponse<TransportBucket>>(
      API_ENDPOINTS.ORDERS.SHIPPING.DETAIL(bucketNumber)
    );
    
    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || 'Failed to fetch bucket details');
    }
    return response.data.Result;
  },

  /**
   * Add orders to a bucket
   */
  addOrdersToBucket: async (
    bucketNumber: string,
    data: AddOrdersToBucketData
  ): Promise<TransportBucket> => {
    const response = await api.post<ApiResponse<TransportBucket>>(
      API_ENDPOINTS.ORDERS.SHIPPING.ADD_ORDERS(bucketNumber),
      data
    );
    
    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || 'Failed to add orders to bucket');
    }
    return response.data.Result;
  },

  /**
   * Update bucket location (record tracking event)
   */
  updateBucketLocation: async (
    bucketNumber: string,
    data: UpdateBucketLocationData
  ): Promise<TrackingEventResult> => {
    const response = await api.post<ApiResponse<TrackingEventResult>>(
      API_ENDPOINTS.ORDERS.SHIPPING.UPDATE_LOCATION(bucketNumber),
      data
    );
    
    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || 'Failed to update bucket location');
    }
    return response.data.Result;
  },

  /**
   * Close a bucket
   */
  closeBucket: async (bucketNumber: string): Promise<TransportBucket> => {
    const response = await api.post<ApiResponse<TransportBucket>>(
      API_ENDPOINTS.ORDERS.SHIPPING.CLOSE(bucketNumber)
    );
    
    if (!response.data.IsSuccess) {
      throw new Error(response.data.ErrorMessage || 'Failed to close bucket');
    }
    return response.data.Result;
  },
};
