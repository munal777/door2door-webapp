import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Clock3, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AnalyticsDateFilter from "@/modules/courier-crm/analytics/components/filters/AnalyticsDateFilter";
import SummaryCards from "@/modules/courier-crm/analytics/components/summary/SummaryCards";
import LineTrendChart from "@/modules/courier-crm/analytics/components/charts/LineTrendChart";
import DistributionBarChart from "@/modules/courier-crm/analytics/components/charts/DistributionBarChart";
import { analyticsService } from "@/services/analyticsService";
import type {
  AnalyticsQueryParams,
  OrdersAnalyticsResponse,
} from "@/types/analytics";

const currency = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 0,
});

const prettify = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function OrderStatsPage() {
  const [query, setQuery] = useState<AnalyticsQueryParams>({
    range: "month",
    group_by: "auto",
  });
  const [data, setData] = useState<OrdersAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (nextQuery = query) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await analyticsService.getOrders(nextQuery);
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch order analytics",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders Analytics</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track operational volume, fulfillment, and trend performance over
          custom ranges.
        </p>
      </div>

      <AnalyticsDateFilter
        value={query}
        isLoading={isLoading}
        onApply={(next) => {
          setQuery(next);
          fetchData(next);
        }}
      />

      {isLoading ? (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Loading order analytics...
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <Card className="border-red-200 bg-red-50/60 shadow-sm">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <p className="text-sm text-red-700">{error}</p>
            <Button variant="outline" onClick={() => fetchData()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error && data ? (
        <>
          <SummaryCards
            items={[
              {
                key: "total",
                label: "Total Orders",
                value: data.summary.total_orders.toLocaleString(),
                helper: `${data.meta.total_days}-day selected range`,
                icon: <Package className="h-4 w-4 text-primary" />,
              },
              {
                key: "active",
                label: "Active Orders",
                value: data.summary.active_orders.toLocaleString(),
                helper: "Not yet completed/cancelled/returned",
                icon: <Activity className="h-4 w-4 text-primary" />,
              },
              {
                key: "delivered",
                label: "Delivered",
                value: data.summary.delivered_orders.toLocaleString(),
                helper: `${data.summary.fulfillment_rate.toFixed(2)}% fulfillment rate`,
                icon: <CheckCircle2 className="h-4 w-4 text-primary" />,
              },
              {
                key: "avg-order-value",
                label: "Average Order Value",
                value: currency.format(data.summary.average_order_value),
                helper: currency.format(data.summary.total_revenue),
                icon: <Clock3 className="h-4 w-4 text-primary" />,
              },
            ]}
          />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <LineTrendChart
              title="Order Volume Trend"
              points={data.trend.map((item) => ({
                label: item.period_start,
                value: item.orders,
              }))}
            />
            <LineTrendChart
              title="Delivered Orders Trend"
              colorClassName="stroke-emerald-600"
              points={data.trend.map((item) => ({
                label: item.period_start,
                value: item.delivered,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <DistributionBarChart
              title="Order Status Breakdown"
              bars={data.status_breakdown.map((item) => ({
                label: prettify(item.status),
                value: item.count,
              }))}
            />

            <DistributionBarChart
              title="Service Type Distribution"
              bars={data.service_breakdown.map((item) => ({
                label: prettify(item.service_type),
                value: item.count,
              }))}
            />

            <DistributionBarChart
              title="Payment Method Distribution"
              bars={data.payment_breakdown.map((item) => ({
                label: item.payment_method.toUpperCase(),
                value: item.count,
              }))}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
