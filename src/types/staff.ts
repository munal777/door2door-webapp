import type { CourierStaffPermissions } from './auth';

export interface CourierStaffSummary {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  role: 'admin' | 'operations';
  is_active: boolean;
  permissions: CourierStaffPermissions;
  joined_at: string;
}

export interface CourierStaffDetail extends CourierStaffSummary {
  accessible_modules: string[];
  updated_at: string;
}

export interface UpdateCourierStaffAccessPayload {
  role?: 'admin' | 'operations';
  is_active?: boolean;
  can_manage_orders?: boolean;
  can_manage_shippings?: boolean;
  can_manage_riders?: boolean;
  can_manage_invitations?: boolean;
  can_manage_settings?: boolean;
}
