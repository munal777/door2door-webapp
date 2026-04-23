import { useEffect, useState } from "react";
import { Banknote, CreditCard, DollarSign, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AnalyticsDateFilter from "@/modules/courier-crm/analytics/components/filters/AnalyticsDateFilter";
import SummaryCards from "@/modules/courier-crm/analytics/components/summary/SummaryCards";
import LineTrendChart from "@/modules/courier-crm/analytics/components/charts/LineTrendChart";
import DistributionBarChart from "@/modules/courier-crm/analytics/components/charts/DistributionBarChart";
import { analyticsService } from "@/services/analyticsService";
import type {
  AnalyticsQueryParams,
  RevenueAnalyticsResponse,
} from "@/types/analytics";

const currency = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 0,
});

const pretty = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function RevenueStatsPage() {
  const [query, setQuery] = useState<AnalyticsQueryParams>({
    range: "month",
    group_by: "auto",
  });
  const [data, setData] = useState<RevenueAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (nextQuery = query) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await analyticsService.getRevenue(nextQuery);
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch revenue analytics",
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
        <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Explore revenue trends, payment quality, and top-performing corridors.
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
            Loading revenue analytics...
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
                key: "total-revenue",
                label: "Total Revenue",
                value: currency.format(data.summary.total_revenue),
                helper: `${data.summary.order_count.toLocaleString()} orders`,
                icon: <DollarSign className="h-4 w-4 text-primary" />,
              },
              {
                key: "paid-revenue",
                label: "Paid Revenue",
                value: currency.format(data.summary.paid_revenue),
                helper: "Settled collections",
                icon: <Wallet className="h-4 w-4 text-primary" />,
              },
              {
                key: "pending-revenue",
                label: "Pending Revenue",
                value: currency.format(data.summary.pending_revenue),
                helper: "Outstanding settlements",
                icon: <CreditCard className="h-4 w-4 text-primary" />,
              },
              {
                key: "avg-order-value",
                label: "Average Order Value",
                value: currency.format(data.summary.average_order_value),
                helper: `${data.meta.total_days}-day selected range`,
                icon: <Banknote className="h-4 w-4 text-primary" />,
              },
            ]}
          />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <LineTrendChart
              title="Revenue Trend"
              points={data.trend.map((item) => ({
                label: item.period_start,
                value: item.revenue,
              }))}
            />

            <LineTrendChart
              title="Paid Revenue Trend"
              colorClassName="stroke-emerald-600"
              points={data.trend.map((item) => ({
                label: item.period_start,
                value: item.paid_revenue,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <DistributionBarChart
              title="Revenue by Service Type"
              bars={data.breakdown.service_type.map((item) => ({
                label: pretty(item.service_type),
                value: item.revenue,
                helper: `${item.orders} orders`,
              }))}
            />

            <DistributionBarChart
              title="Revenue by Payment Method"
              bars={data.breakdown.payment_method.map((item) => ({
                label: item.payment_method.toUpperCase(),
                value: item.revenue,
                helper: `${item.orders} orders`,
              }))}
            />

            <DistributionBarChart
              title="Revenue by Order Type"
              bars={data.breakdown.order_type.map((item) => ({
                label: pretty(item.order_type),
                value: item.revenue,
                helper: `${item.orders} orders`,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <DistributionBarChart
              title="Top Sender Cities"
              bars={data.top_sender_cities.map((item) => ({
                label: item.city,
                value: item.revenue,
                helper: `${item.orders} orders`,
              }))}
            />

            <DistributionBarChart
              title="Top Receiver Cities"
              bars={data.top_receiver_cities.map((item) => ({
                label: item.city,
                value: item.revenue,
                helper: `${item.orders} orders`,
              }))}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
