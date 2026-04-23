import { useEffect, useState } from "react";
import { Boxes, Route, Truck, Warehouse } from "lucide-react";
import AnalyticsDateFilter from "@/modules/courier-crm/analytics/components/filters/AnalyticsDateFilter";
import SummaryCards from "@/modules/courier-crm/analytics/components/summary/SummaryCards";
import LineTrendChart from "@/modules/courier-crm/analytics/components/charts/LineTrendChart";
import DistributionBarChart from "@/modules/courier-crm/analytics/components/charts/DistributionBarChart";
import { analyticsService } from "@/services/analyticsService";
import { Button } from "@/components/ui/button";
import type {
  AnalyticsQueryParams,
  ShipmentsAnalyticsResponse,
} from "@/types/analytics";
import { Card, CardContent } from "@/components/ui/card";

const currency = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 0,
});

export default function ShipmentsStatsPage() {
  const [query, setQuery] = useState<AnalyticsQueryParams>({
    range: "month",
    group_by: "auto",
  });
  const [data, setData] = useState<ShipmentsAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (nextQuery = query) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await analyticsService.getShipments(nextQuery);
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch shipments analytics",
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
        <h1 className="text-3xl font-bold tracking-tight">
          Shipments Analytics
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Analyze transport bucket throughput, route demand, and loading trends.
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
            Loading shipments analytics...
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
                key: "created-buckets",
                label: "Buckets Created",
                value: data.summary.created_buckets.toLocaleString(),
                helper: `${data.meta.total_days}-day selected range`,
                icon: <Warehouse className="h-4 w-4 text-primary" />,
              },
              {
                key: "active-buckets",
                label: "Active Buckets",
                value: data.summary.active_buckets.toLocaleString(),
                helper: "Open transport manifests",
                icon: <Truck className="h-4 w-4 text-primary" />,
              },
              {
                key: "orders-active",
                label: "Orders In Active Buckets",
                value: data.summary.orders_in_active_buckets.toLocaleString(),
                helper: `Avg ${data.summary.avg_orders_per_bucket.toFixed(2)} orders/bucket`,
                icon: <Boxes className="h-4 w-4 text-primary" />,
              },
              {
                key: "avg-close-time",
                label: "Avg Close Time",
                value: `${data.summary.avg_close_time_hours.toFixed(2)}h`,
                helper: "Measured from created to closed bucket",
                icon: <Route className="h-4 w-4 text-primary" />,
              },
            ]}
          />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <LineTrendChart
              title="Buckets Created Trend"
              points={data.trend.map((point) => ({
                label: point.period_start,
                value: point.created_buckets,
              }))}
            />

            <LineTrendChart
              title="Orders Loaded Trend"
              colorClassName="stroke-emerald-600"
              points={data.trend.map((point) => ({
                label: point.period_start,
                value: point.orders_loaded,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <DistributionBarChart
              title="Top Routes By Orders"
              bars={data.top_routes.map((route) => ({
                label: `${route.from_city} -> ${route.to_city}`,
                value: route.order_count,
                helper: currency.format(route.total_revenue),
              }))}
              emptyMessage="No route activity found for the selected range."
            />

            <DistributionBarChart
              title="Top Routes By Revenue"
              bars={data.top_routes.map((route) => ({
                label: `${route.from_city} -> ${route.to_city}`,
                value: route.total_revenue,
                helper: `${route.order_count} orders`,
              }))}
              emptyMessage="No revenue route data found for the selected range."
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
