export interface CourierRider {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  vehicle_type: string;
  vehicle_number: string;
  operational_status: string;
  availability_status: string;
}

export interface RiderAssignedOrderSummary {
  assignment_id: number;
  order_number: string;
  order_status: string;
  assigned_at: string;
  notes: string;
}

export interface RiderDetail extends CourierRider {
  company_name: string;
  vehicle_model?: string;
  vehicle_color?: string;
  assigned_orders: RiderAssignedOrderSummary[];
}

export interface ActiveRiderAssignment {
  id: number;
  order_number: string;
  order_status: string;
  rider: number;
  rider_name: string;
  rider_phone: string;
  notes: string;
  is_active: boolean;
  assigned_by_name?: string;
  assigned_at: string;
}

export interface AssignableOnlineOrder {
  id: number;
  order_number: string;
  order_type_display: string;
  status_display: string;
  sender_address: string;
  sender_city: string;
  receiver_address: string;
  receiver_city: string;
  package_type_display: string;
  service_type_display: string;
  active_assignment_id?: number;
  active_rider_name?: string;
}



export interface UpdateRiderStatusData {
  operational_status?: string;
  availability_status?: string;
}
