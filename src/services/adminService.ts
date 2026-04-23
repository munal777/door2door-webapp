import api from './api';
import { authService } from './authService';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type {
  CourierProvider,
  CourierRider,
  ApprovalRequest,
  ApiResponse,
} from '@/types/admin';

class AdminService {
  private getAuthHeaders() {
    const token = authService.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Get list of all courier providers
   */
  async getCourierProviders(status?: string): Promise<ApiResponse<CourierProvider[]>> {
    try {
      const params = status ? { status } : {};
      const response = await api.get(API_ENDPOINTS.ADMIN.PROVIDERS.LIST, {
        params,
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get details of a specific courier provider
   */
  async getCourierProviderDetail(providerId: number): Promise<ApiResponse<CourierProvider>> {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.PROVIDERS.DETAIL(providerId), {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Approve or reject a courier provider
   */
  async approveRejectProvider(
    providerId: number,
    approvalData: ApprovalRequest
  ): Promise<ApiResponse<any>> {
    try {
      const response = await api.post(
        API_ENDPOINTS.ADMIN.PROVIDERS.APPROVE(providerId),
        approvalData,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get list of all courier riders
   */
  async getCourierRiders(filters?: {
    status?: string;
    company_id?: number;
    availability?: string;
  }): Promise<ApiResponse<CourierRider[]>> {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.RIDERS.LIST, {
        params: filters,
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get details of a specific courier rider
   */
  async getCourierRiderDetail(riderId: number): Promise<ApiResponse<CourierRider>> {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.RIDERS.DETAIL(riderId), {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Approve or reject a courier rider
   */
  async approveRejectRider(
    riderId: number,
    approvalData: ApprovalRequest
  ): Promise<ApiResponse<any>> {
    try {
      const response = await api.post(
        API_ENDPOINTS.ADMIN.RIDERS.APPROVE(riderId),
        approvalData,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}

export const adminService = new AdminService();

