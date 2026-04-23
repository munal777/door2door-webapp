import { api } from "@/services/api";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type {
  AnalyticsOverviewResponse,
  AnalyticsQueryParams,
  OrdersAnalyticsResponse,
  RevenueAnalyticsResponse,
  ShipmentsAnalyticsResponse,
} from "@/types/analytics";

interface ApiResponse<T> {
  StatusCode: number;
  IsSuccess: boolean;
  ErrorMessage: string | string[];
  Result: T;
}

const buildQueryString = (params?: AnalyticsQueryParams) => {
  const query = new URLSearchParams();
  if (!params) return "";

  if (params.group_by) query.append("group_by", params.group_by);

  if (params.start_date || params.end_date) {
    if (params.start_date) query.append("start_date", params.start_date);
    if (params.end_date) query.append("end_date", params.end_date);
    return query.toString();
  }

  if (params.range && params.range !== "custom") {
    query.append("range", params.range);
  }

  return query.toString();
};

const unwrap = <T>(response: ApiResponse<T>, fallbackMessage: string): T => {
  if (!response.IsSuccess) {
    const message =
      typeof response.ErrorMessage === "string"
        ? response.ErrorMessage
        : response.ErrorMessage?.[0] || fallbackMessage;
    throw new Error(message || fallbackMessage);
  }
  return response.Result;
};

const fetchAnalytics = async <T>(
  endpoint: string,
  params: AnalyticsQueryParams | undefined,
  fallbackMessage: string,
): Promise<T> => {
  const query = buildQueryString(params);
  const url = query ? `${endpoint}?${query}` : endpoint;
  const response = await api.get<ApiResponse<T>>(url);
  return unwrap(response.data, fallbackMessage);
};

export const analyticsService = {
  getOverview: (params?: AnalyticsQueryParams) =>
    fetchAnalytics<AnalyticsOverviewResponse>(
      API_ENDPOINTS.ANALYTICS.OVERVIEW,
      params,
      "Failed to fetch analytics overview",
    ),

  getOrders: (params?: AnalyticsQueryParams) =>
    fetchAnalytics<OrdersAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.ORDERS,
      params,
      "Failed to fetch orders analytics",
    ),

  getRevenue: (params?: AnalyticsQueryParams) =>
    fetchAnalytics<RevenueAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.REVENUE,
      params,
      "Failed to fetch revenue analytics",
    ),

  getShipments: (params?: AnalyticsQueryParams) =>
    fetchAnalytics<ShipmentsAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.SHIPMENTS,
      params,
      "Failed to fetch shipments analytics",
    ),
};
