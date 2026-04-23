// Pricing Types

export interface WeightSlab {
  id: number;
  package_type: 'document' | 'package';
  up_to_weight: string;
  length?: string | null;
  width?: string | null;
  height?: string | null;
  extra_charge: string;
  is_active: boolean;
}

export interface ServiceTypePricing {
  id: number;
  service_type: 'standard' | 'express';
  estimated_delivery_hours: number;
  price_multiplier: string;
  is_active: boolean;
}

export interface LocationPricing {
  id: number;
  city: string;
  state: string;
  area_type: 'city' | 'regional';
  base_price: string;
  price_multiplier: string;
  is_active: boolean;
}

// Simplified type for public location autocomplete
export interface PublicLocation {
  city: string;
  state: string;
}

export interface WeightSlabFormData {
  package_type: 'document' | 'package';
  up_to_weight: string;
  length?: string;
  width?: string;
  height?: string;
  extra_charge: string;
  is_active: boolean;
}

export interface ServiceTypePricingFormData {
  service_type: 'standard' | 'express';
  estimated_delivery_hours: number;
  price_multiplier: string;
  is_active: boolean;
}

export interface LocationPricingFormData {
  city: string;
  state: string;
  area_type: 'city' | 'regional';
  base_price: string;
  price_multiplier: string;
  is_active: boolean;
}
