export type AnalyticsRangePreset = "week" | "month" | "quarter" | "custom";
export type AnalyticsGroupBy = "auto" | "day" | "week" | "month";

export interface AnalyticsQueryParams {
  range?: AnalyticsRangePreset;
  start_date?: string;
  end_date?: string;
  group_by?: AnalyticsGroupBy;
}

export interface AnalyticsMeta {
  start_date: string;
  end_date: string;
  range: AnalyticsRangePreset;
  group_by: Exclude<AnalyticsGroupBy, "auto">;
  total_days: number;
}

export interface AnalyticsOverviewResponse {
  meta: AnalyticsMeta;
  summary: {
    total_orders: number;
    delivered_orders: number;
    delivery_rate: number;
    cancelled_orders: number;
    total_revenue: number;
    average_order_value: number;
    active_buckets: number;
    created_buckets: number;
  };
}

export interface OrdersTrendPoint {
  period_start: string;
  orders: number;
  delivered: number;
  cancelled: number;
  revenue: number;
}

export interface OrdersAnalyticsResponse {
  meta: AnalyticsMeta;
  summary: {
    total_orders: number;
    active_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    returned_orders: number;
    fulfillment_rate: number;
    total_revenue: number;
    average_order_value: number;
  };
  status_breakdown: Array<{ status: string; count: number }>;
  service_breakdown: Array<{ service_type: string; count: number }>;
  payment_breakdown: Array<{ payment_method: string; count: number }>;
  trend: OrdersTrendPoint[];
}

export interface RevenueTrendPoint {
  period_start: string;
  revenue: number;
  paid_revenue: number;
  order_count: number;
}

export interface RevenueBreakdownItem {
  revenue: number;
  orders: number;
}

export interface RevenueAnalyticsResponse {
  meta: AnalyticsMeta;
  summary: {
    total_revenue: number;
    paid_revenue: number;
    pending_revenue: number;
    order_count: number;
    average_order_value: number;
  };
  trend: RevenueTrendPoint[];
  breakdown: {
    service_type: Array<RevenueBreakdownItem & { service_type: string }>;
    payment_method: Array<RevenueBreakdownItem & { payment_method: string }>;
    order_type: Array<RevenueBreakdownItem & { order_type: string }>;
  };
  top_sender_cities: Array<{ city: string; revenue: number; orders: number }>;
  top_receiver_cities: Array<{ city: string; revenue: number; orders: number }>;
}

export interface ShipmentsTrendPoint {
  period_start: string;
  created_buckets: number;
  orders_loaded: number;
}

export interface ShipmentsAnalyticsResponse {
  meta: AnalyticsMeta;
  summary: {
    created_buckets: number;
    active_buckets: number;
    closed_buckets_in_range: number;
    orders_in_active_buckets: number;
    avg_orders_per_bucket: number;
    avg_close_time_hours: number;
  };
  trend: ShipmentsTrendPoint[];
  top_routes: Array<{
    from_city: string;
    to_city: string;
    order_count: number;
    total_revenue: number;
  }>;
}
