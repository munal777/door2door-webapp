export interface CourierCompanyProfile {
  id: number;
  name: string;
  logo: string | null;
  logo_url: string | null;
  company_email: string;
  company_phone: string;
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  operational_status: string;
  is_active: boolean;
  max_riders: number;
  updated_at: string;
}

export interface UpdateCourierCompanyProfilePayload {
  name?: string;
  logo?: File | null;
  company_email?: string;
  company_phone?: string;
  address_line?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}
