import { api } from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type { 
  ProviderInvitation, 
  SendInvitationData, 
  InvitationFilters,
  InvitationListResponse 
} from '../types/invitation';

interface ApiResponse<T> {
  StatusCode: number;
  IsSuccess: boolean;
  ErrorMessage: any;
  Result: T;
}

const normalizeApiErrorMessage = (errorMessage: unknown): string => {
  if (errorMessage == null) return "";
  if (typeof errorMessage === "string") return errorMessage;

  if (Array.isArray(errorMessage)) {
    const joined = errorMessage.filter(Boolean).join(" ");
    return joined;
  }

  if (typeof errorMessage === "object") {
    const entries = Object.entries(errorMessage as Record<string, unknown>);
    const parts = entries
      .map(([key, value]) => {
        if (typeof value === "string") return `${key}: ${value}`;
        if (Array.isArray(value)) return `${key}: ${value.filter(Boolean).join(" ")}`;
        if (value == null) return "";
        return `${key}: ${String(value)}`;
      })
      .filter(Boolean);

    if (parts.length > 0) return parts.join("\n");
  }

  try {
    return JSON.stringify(errorMessage);
  } catch {
    return String(errorMessage);
  }
};

export const invitationService = {
  /**
   * Send an invitation (rider/admin/operations)
   */
  sendInvitation: async (invitationData: SendInvitationData): Promise<{ message: string }> => {
    try {
      const response = await api.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.INVITATIONS.SEND,
        invitationData
      );
      
      if (!response.data.IsSuccess) {
        const message = normalizeApiErrorMessage(response.data.ErrorMessage);
        throw new Error(message || 'Failed to send invitation');
      }
      return response.data.Result;
    } catch (error: any) {
      if (error.response?.data?.ErrorMessage) {
        throw new Error(normalizeApiErrorMessage(error.response.data.ErrorMessage) || 'Failed to send invitation');
      }
      throw error;
    }
  },

  /**
   * Get list of invitations with optional filters
   */
  getInvitations: async (filters?: InvitationFilters): Promise<InvitationListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);

    try {
      const response = await api.get<ApiResponse<InvitationListResponse>>(
        `${API_ENDPOINTS.INVITATIONS.LIST}?${params.toString()}`
      );
      
      if (!response.data.IsSuccess) {
        const message = normalizeApiErrorMessage(response.data.ErrorMessage);
        throw new Error(message || 'Failed to fetch invitations');
      }
      return response.data.Result;
    } catch (error: any) {
      if (error.response?.data?.ErrorMessage) {
        throw new Error(normalizeApiErrorMessage(error.response.data.ErrorMessage) || 'Failed to fetch invitations');
      }
      throw error;
    }
  },

  /**
   * Get invitation details by ID
   */
  getInvitationDetail: async (invitationId: number): Promise<ProviderInvitation> => {
    try {
      const response = await api.get<ApiResponse<ProviderInvitation>>(
        API_ENDPOINTS.INVITATIONS.DETAIL(invitationId)
      );
      
      if (!response.data.IsSuccess) {
        const message = normalizeApiErrorMessage(response.data.ErrorMessage);
        throw new Error(message || 'Failed to fetch invitation details');
      }
      return response.data.Result;
    } catch (error: any) {
      if (error.response?.data?.ErrorMessage) {
        throw new Error(normalizeApiErrorMessage(error.response.data.ErrorMessage) || 'Failed to fetch invitation details');
      }
      throw error;
    }
  },

  /**
   * Revoke a pending invitation
   */
  revokeInvitation: async (invitationId: number): Promise<{ message: string; invitation_id: number }> => {
    try {
      const response = await api.post<ApiResponse<{ message: string; invitation_id: number }>>(
        API_ENDPOINTS.INVITATIONS.REVOKE(invitationId)
      );
      
      if (!response.data.IsSuccess) {
        const message = normalizeApiErrorMessage(response.data.ErrorMessage);
        throw new Error(message || 'Failed to revoke invitation');
      }
      return response.data.Result;
    } catch (error: any) {
      if (error.response?.data?.ErrorMessage) {
        throw new Error(normalizeApiErrorMessage(error.response.data.ErrorMessage) || 'Failed to revoke invitation');
      }
      throw error;
    }
  },
};
