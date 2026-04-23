import api from './api';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import type { CourierRegistrationData, CourierRegistrationResponse } from '@/types/courier';
import type {
  CourierCompanyProfile,
  UpdateCourierCompanyProfilePayload,
} from '@/types/courierProfile';

interface ApiResponse<T> {
  StatusCode: number;
  IsSuccess: boolean;
  ErrorMessage: unknown;
  Result: T;
}

export const courierService = {
  /**
   * Register a new courier provider
   */
  registerCourier: async (
    data: CourierRegistrationData
  ): Promise<CourierRegistrationResponse> => {
    const formData = new FormData();

    // Append basic fields
    formData.append('name', data.name);
    formData.append('company_email', data.company_email);
    formData.append('company_phone', data.company_phone);
    formData.append('address_line', data.address_line);
    formData.append('city', data.city);
    formData.append('state', data.state);
    formData.append('postal_code', data.postal_code);
    formData.append('country', data.country);

    // Append documents in nested format
    data.documents.forEach((doc, index) => {
      formData.append(`documents[${index}][document_type]`, doc.document_type);
      formData.append(`documents[${index}][document_number]`, doc.document_number);
      formData.append(`documents[${index}][uploaded_file]`, doc.uploaded_file);
    });

    const response = await api.post<CourierRegistrationResponse>(
      API_ENDPOINTS.ACCOUNTS.PROVIDER.REGISTER,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getCompanyProfile: async (): Promise<CourierCompanyProfile> => {
    const response = await api.get<ApiResponse<CourierCompanyProfile>>(
      API_ENDPOINTS.ACCOUNTS.PROVIDER.ME,
    );

    if (!response.data.IsSuccess) {
      throw new Error('Failed to load courier company profile');
    }

    return response.data.Result;
  },

  updateCompanyProfile: async (
    payload: UpdateCourierCompanyProfilePayload,
  ): Promise<CourierCompanyProfile> => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (key === 'logo' && value instanceof File) {
        formData.append('logo', value);
        return;
      }

      formData.append(key, String(value));
    });

    const response = await api.patch<ApiResponse<CourierCompanyProfile>>(
      API_ENDPOINTS.ACCOUNTS.PROVIDER.ME,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    if (!response.data.IsSuccess) {
      throw new Error('Failed to update courier company profile');
    }

    return response.data.Result;
  },
};

export default courierService;
