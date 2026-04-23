import axios from 'axios';

import { api } from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type {
  CourierStaffDetail,
  CourierStaffSummary,
  UpdateCourierStaffAccessPayload,
} from '../types/staff';

interface ApiResponse<T> {
  StatusCode: number;
  IsSuccess: boolean;
  ErrorMessage: unknown;
  Result: T;
}

interface ValidateStaffInvitationResponse {
  email: string;
  role: 'admin' | 'operations' | 'rider';
  courier_name: string;
  courier_city: string;
  courier_state: string;
  expires_at: string;
  is_valid: boolean;
}

interface StaffInvitationRegistrationPayload {
  invitation_token: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    confirm_password: string;
  };
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
    return new Error(normalizeErrorMessage(apiError?.ErrorMessage, fallback));
  }

  if (error instanceof Error && error.message.trim()) {
    return error;
  }

  return new Error(fallback);
};

export const staffService = {
  validateStaffInvitationToken: async (
    invitationToken: string,
  ): Promise<ValidateStaffInvitationResponse> => {
    try {
      const response = await api.post<ApiResponse<ValidateStaffInvitationResponse>>(
        API_ENDPOINTS.INVITATIONS.VALIDATE,
        {
          invitation_token: invitationToken,
          registration_type: 'staff',
        },
      );

      if (!response.data.IsSuccess) {
        throw new Error(
          normalizeErrorMessage(
            response.data.ErrorMessage,
            'Invitation link is invalid or expired',
          ),
        );
      }

      return response.data.Result;
    } catch (error) {
      throw toServiceError(error, 'Invitation link is invalid or expired');
    }
  },

  registerWithInvitation: async (
    payload: StaffInvitationRegistrationPayload,
  ): Promise<{ message: string }> => {
    try {
      const response = await api.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.ACCOUNTS.STAFF.REGISTER,
        payload,
      );

      if (!response.data.IsSuccess) {
        throw new Error(
          normalizeErrorMessage(
            response.data.ErrorMessage,
            'Failed to complete staff registration',
          ),
        );
      }

      return response.data.Result;
    } catch (error) {
      throw toServiceError(error, 'Failed to complete staff registration');
    }
  },

  getStaffList: async (): Promise<CourierStaffSummary[]> => {
    try {
      const response = await api.get<ApiResponse<CourierStaffSummary[]>>(
        API_ENDPOINTS.ACCOUNTS.STAFF.LIST,
      );

      if (!response.data.IsSuccess) {
        throw new Error(normalizeErrorMessage(response.data.ErrorMessage, 'Failed to load staff members'));
      }

      return response.data.Result;
    } catch (error) {
      throw toServiceError(error, 'Failed to load staff members');
    }
  },

  getStaffDetail: async (staffId: number): Promise<CourierStaffDetail> => {
    try {
      const response = await api.get<ApiResponse<CourierStaffDetail>>(
        API_ENDPOINTS.ACCOUNTS.STAFF.DETAIL(staffId),
      );

      if (!response.data.IsSuccess) {
        throw new Error(normalizeErrorMessage(response.data.ErrorMessage, 'Failed to load staff details'));
      }

      return response.data.Result;
    } catch (error) {
      throw toServiceError(error, 'Failed to load staff details');
    }
  },

  updateStaffAccess: async (
    staffId: number,
    payload: UpdateCourierStaffAccessPayload,
  ): Promise<CourierStaffDetail> => {
    try {
      const response = await api.patch<ApiResponse<CourierStaffDetail>>(
        API_ENDPOINTS.ACCOUNTS.STAFF.UPDATE_PERMISSIONS(staffId),
        payload,
      );

      if (!response.data.IsSuccess) {
        throw new Error(normalizeErrorMessage(response.data.ErrorMessage, 'Failed to update staff access'));
      }

      return response.data.Result;
    } catch (error) {
      throw toServiceError(error, 'Failed to update staff access');
    }
  },
};
