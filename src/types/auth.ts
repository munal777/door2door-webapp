export interface CourierStaffPermissions {
  can_manage_orders: boolean;
  can_manage_shippings: boolean;
  can_manage_riders: boolean;
  can_manage_invitations: boolean;
  can_manage_settings: boolean;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_type: 'consumer' | 'courier_staff' | 'rider' | 'admin' | 'superadmin';
  role?: 'admin' | 'operations';
  permissions?: CourierStaffPermissions;
  is_active: boolean;
  is_verified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  StatusCode: number;
  IsSuccess: boolean;
  ErrorMessage: any;
  Result?: {
    refresh: string;
    access: string;
    user: User;
  } | null;
}

export interface ApiResponse<T = any> {
  StatusCode: number;
  IsSuccess: boolean;
  ErrorMessage: any;
  Result?: T | null;
}
