export interface CourierDocument {
  document_type: 'company_registration' | 'company_pan_vat' | 'company_additional';
  document_number: string;
  uploaded_file: File;
}

export interface CourierRegistrationData {
  name: string;
  company_email: string;
  company_phone: string;
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  documents: CourierDocument[];
}

export interface CourierRegistrationResponse {
  StatusCode: number;
  IsSuccess: boolean;
  ErrorMessage: any;
  Result?: {
    message: string;
  } | null;
}
