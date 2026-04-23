export interface CourierProvider {
  id: number;
  name: string;
  company_email: string;
  company_phone: string;
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  operational_status: string;
  is_active: boolean;
  is_verified: boolean;
  max_riders: number;
  total_riders: number;
  documents: Document[];
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  document_type: string;
  document_number: string;
  uploaded_file: string | null;
  status: string;
  uploaded_at: string;
  verified_at: string | null;
  rejection_reason: string | null;
}

export interface CourierRider {
  id: number;
  user_details: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    phone_number: string;
    is_active: boolean;
  };
  company_details: {
    id: number;
    name: string;
    company_email: string;
    company_phone: string;
  };
  date_of_birth: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  vehicle_type: string;
  vehicle_number: string;
  vehicle_model: string;
  vehicle_color: string;
  operational_status: string;
  documents: Document[];
  created_at: string;
  updated_at: string;
}

export interface ApprovalRequest {
  action: 'approve' | 'reject';
  rejection_reason?: string;
}

export interface ApiResponse<T> {
  StatusCode: number;
  IsSuccess: boolean;
  ErrorMessage: string | string[] | null;
  Result: T;
}
