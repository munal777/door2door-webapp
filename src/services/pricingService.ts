import api from './api';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { ApiResponse } from '@/types/auth';
import type { PublicLocation } from '@/types/pricing';
import type {
  WeightSlab,
  ServiceTypePricing,
  LocationPricing,
  WeightSlabFormData,
  ServiceTypePricingFormData,
  LocationPricingFormData,
} from '@/types/pricing';

export const pricingService = {
  // Weight Slabs
  getWeightSlabs: async (params?: {
    package_type?: 'document' | 'package';
    is_active?: boolean;
  }): Promise<ApiResponse<WeightSlab[]>> => {
    const response = await api.get<ApiResponse<WeightSlab[]>>(
      API_ENDPOINTS.PRICINGS.WEIGHT_SLABS.LIST,
      { params }
    );
    return response.data;
  },

  getWeightSlab: async (id: number): Promise<ApiResponse<WeightSlab>> => {
    const response = await api.get<ApiResponse<WeightSlab>>(
      API_ENDPOINTS.PRICINGS.WEIGHT_SLABS.DETAIL(id)
    );
    return response.data;
  },

  createWeightSlab: async (
    data: WeightSlabFormData
  ): Promise<ApiResponse<WeightSlab>> => {
    const response = await api.post<ApiResponse<WeightSlab>>(
      API_ENDPOINTS.PRICINGS.WEIGHT_SLABS.LIST,
      data
    );
    return response.data;
  },

  updateWeightSlab: async (
    id: number,
    data: Partial<WeightSlabFormData>
  ): Promise<ApiResponse<WeightSlab>> => {
    const response = await api.patch<ApiResponse<WeightSlab>>(
      API_ENDPOINTS.PRICINGS.WEIGHT_SLABS.DETAIL(id),
      data
    );
    return response.data;
  },

  deleteWeightSlab: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(
      API_ENDPOINTS.PRICINGS.WEIGHT_SLABS.DETAIL(id)
    );
    return response.data;
  },

  // Service Type Pricing
  getServiceTypePricings: async (params?: {
    service_type?: 'standard' | 'express';
    is_active?: boolean;
  }): Promise<ApiResponse<ServiceTypePricing[]>> => {
    const response = await api.get<ApiResponse<ServiceTypePricing[]>>(
      API_ENDPOINTS.PRICINGS.SERVICE_TYPES.LIST,
      { params }
    );
    return response.data;
  },

  getServiceTypePricing: async (
    id: number
  ): Promise<ApiResponse<ServiceTypePricing>> => {
    const response = await api.get<ApiResponse<ServiceTypePricing>>(
      API_ENDPOINTS.PRICINGS.SERVICE_TYPES.DETAIL(id)
    );
    return response.data;
  },

  createServiceTypePricing: async (
    data: ServiceTypePricingFormData
  ): Promise<ApiResponse<ServiceTypePricing>> => {
    const response = await api.post<ApiResponse<ServiceTypePricing>>(
      API_ENDPOINTS.PRICINGS.SERVICE_TYPES.LIST,
      data
    );
    return response.data;
  },

  updateServiceTypePricing: async (
    id: number,
    data: Partial<ServiceTypePricingFormData>
  ): Promise<ApiResponse<ServiceTypePricing>> => {
    const response = await api.patch<ApiResponse<ServiceTypePricing>>(
      API_ENDPOINTS.PRICINGS.SERVICE_TYPES.DETAIL(id),
      data
    );
    return response.data;
  },

  deleteServiceTypePricing: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(
      API_ENDPOINTS.PRICINGS.SERVICE_TYPES.DETAIL(id)
    );
    return response.data;
  },

  // Location Pricing
  getLocationPricings: async (params?: {
    city?: string;
    state?: string;
    area_type?: 'city' | 'regional';
    is_active?: boolean;
  }): Promise<ApiResponse<LocationPricing[]>> => {
    const response = await api.get<ApiResponse<LocationPricing[]>>(
      API_ENDPOINTS.PRICINGS.LOCATIONS.LIST,
      { params }
    );
    return response.data;
  },

  getLocationPricing: async (
    id: number
  ): Promise<ApiResponse<LocationPricing>> => {
    const response = await api.get<ApiResponse<LocationPricing>>(
      API_ENDPOINTS.PRICINGS.LOCATIONS.DETAIL(id)
    );
    return response.data;
  },

  createLocationPricing: async (
    data: LocationPricingFormData
  ): Promise<ApiResponse<LocationPricing>> => {
    const response = await api.post<ApiResponse<LocationPricing>>(
      API_ENDPOINTS.PRICINGS.LOCATIONS.LIST,
      data
    );
    return response.data;
  },

  updateLocationPricing: async (
    id: number,
    data: Partial<LocationPricingFormData>
  ): Promise<ApiResponse<LocationPricing>> => {
    const response = await api.patch<ApiResponse<LocationPricing>>(
      API_ENDPOINTS.PRICINGS.LOCATIONS.DETAIL(id),
      data
    );
    return response.data;
  },

  deleteLocationPricing: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(
      API_ENDPOINTS.PRICINGS.LOCATIONS.DETAIL(id)
    );
    return response.data;
  },

  // Public endpoint for location search (no auth required)
  getPublicLocations: async (params?: {
    search?: string;
    state?: string;
  }): Promise<ApiResponse<PublicLocation[]>> => {
    const response = await api.get<ApiResponse<PublicLocation[]>>(
      API_ENDPOINTS.PRICINGS.LOCATIONS.PUBLIC_LIST,
      { params }
    );
    return response.data;
  },
};

export default pricingService;
