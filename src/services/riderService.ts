import { api } from './api';
import axios from 'axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type {
  ActiveRiderAssignment,
  AssignableOnlineOrder,
  AssignOrderToRiderData,
  CourierRider,
  RiderDetail,
  UpdateRiderStatusData,
} from '../types/rider';

interface ApiResponse<T> {
  StatusCode: number;
  IsSuccess: boolean;
  ErrorMessage: any;
  Result: T;
}

const normalizeErrorMessage = (errorMessage: unknown, fallback: string): string => {
  if (typeof errorMessage === 'string' && errorMessage.trim()) {
    return errorMessage;
  }

  if (Array.isArray(errorMessage)) {
    const joined = errorMessage
      .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
      .join(', ')
      .trim();
    if (joined) {
      return joined;
    }
  }

  if (errorMessage && typeof errorMessage === 'object') {
    const objectValues = Object.values(errorMessage as Record<string, unknown>)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .map((value) => (typeof value === 'string' ? value : JSON.stringify(value)))
      .join(', ')
      .trim();

    if (objectValues) {
      return objectValues;
    }
  }

  return fallback;
};

const toServiceError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as Partial<ApiResponse<unknown>> | undefined;
    const normalized = normalizeErrorMessage(apiError?.ErrorMessage, fallback);
    return new Error(normalized);
  }

  if (error instanceof Error && error.message.trim()) {
    return error;
  }

  return new Error(fallback);
};

export const riderService = {
  getRiders: async (filters?: {
    availability_status?: string;
    operational_status?: string;
  }): Promise<CourierRider[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.availability_status) {
        params.append('availability_status', filters.availability_status);
      }
      if (filters?.operational_status) {
        params.append('operational_status', filters.operational_status);
      }

      const query = params.toString();
      const response = await api.get<ApiResponse<CourierRider[]>>(
        `${API_ENDPOINTS.RIDERS.LIST}${query ? `?${query}` : ''}`,
      );

      if (!response.data.IsSuccess) {
        throw new Error(normalizeErrorMessage(response.data.ErrorMessage, 'Failed to load riders'));
      }

      return response.data.Result;
    } catch (error) {
      throw toServiceError(error, 'Failed to load riders');
    }
  },

  getRiderDetail: async (riderId: number): Promise<RiderDetail> => {
    try {
      const response = await api.get<ApiResponse<RiderDetail>>(
        API_ENDPOINTS.RIDERS.DETAIL(riderId),
      );

      if (!response.data.IsSuccess) {
        throw new Error(normalizeErrorMessage(response.data.ErrorMessage, 'Failed to load rider details'));
      }

      return response.data.Result;
    } catch (error) {
      throw toServiceError(error, 'Failed to load rider details');
    }
  },

  updateRiderStatus: async (
    riderId: number,
    payload: UpdateRiderStatusData,
  ): Promise<RiderDetail> => {
    try {
      const response = await api.patch<ApiResponse<RiderDetail>>(
        API_ENDPOINTS.RIDERS.UPDATE_STATUS(riderId),
        payload,
      );

      if (!response.data.IsSuccess) {
        throw new Error(normalizeErrorMessage(response.data.ErrorMessage, 'Failed to update rider status'));
      }

      return response.data.Result;
    } catch (error) {
      throw toServiceError(error, 'Failed to update rider status');
    }
  },

  getActiveAssignments: async (): Promise<ActiveRiderAssignment[]> => {
    try {
      const response = await api.get<ApiResponse<ActiveRiderAssignment[]>>(
        API_ENDPOINTS.RIDERS.ASSIGNMENTS.ACTIVE,
      );

      if (!response.data.IsSuccess) {
        throw new Error(normalizeErrorMessage(response.data.ErrorMessage, 'Failed to load active assignments'));
      }

      return response.data.Result;
    } catch (error) {
      throw toServiceError(error, 'Failed to load active assignments');
    }
  },

  getAssignableOnlineOrders: async (search?: string): Promise<AssignableOnlineOrder[]> => {
    try {
      const params = new URLSearchParams();
      if (search?.trim()) {
        params.append('search', search.trim());
      }

      const query = params.toString();
      const response = await api.get<ApiResponse<AssignableOnlineOrder[]>>(
        `${API_ENDPOINTS.RIDERS.ASSIGNMENTS.ASSIGNABLE_ORDERS}${query ? `?${query}` : ''}`,
      );

      if (!response.data.IsSuccess) {
        throw new Error(normalizeErrorMessage(response.data.ErrorMessage, 'Failed to load assignable orders'));
      }

      return response.data.Result;
    } catch (error) {
      throw toServiceError(error, 'Failed to load assignable orders');
    }
  },

  assignOnlineOrderToRider: async (
    orderNumber: string,
    payload: AssignOrderToRiderData,
  ): Promise<ActiveRiderAssignment> => {
    try {
      const response = await api.post<ApiResponse<ActiveRiderAssignment>>(
        API_ENDPOINTS.RIDERS.ASSIGNMENTS.ASSIGN_ORDER(orderNumber),
        payload,
      );

      if (!response.data.IsSuccess) {
        throw new Error(normalizeErrorMessage(response.data.ErrorMessage, 'Failed to assign order to rider'));
      }

      return response.data.Result;
    } catch (error) {
      throw toServiceError(error, 'Failed to assign order to rider');
    }
  },
};
