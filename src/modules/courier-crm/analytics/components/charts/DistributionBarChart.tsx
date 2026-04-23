import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BarItem {
  label: string;
  value: number;
  helper?: string;
}

interface DistributionBarChartProps {
  title: string;
  bars: BarItem[];
  emptyMessage?: string;
}

export default function DistributionBarChart({
  title,
  bars,
  emptyMessage = "No data found for this view.",
}: DistributionBarChartProps) {
  if (!bars.length) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 py-12 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bars.map((bar) => {
            const width = `${Math.max((bar.value / maxValue) * 100, bar.value > 0 ? 6 : 0)}%`;
            return (
              <div key={bar.label} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-foreground">{bar.label}</span>
                  <span className="font-semibold">
                    {bar.value.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary/75 transition-all"
                    style={{ width }}
                  />
                </div>
                {bar.helper ? (
                  <p className="text-xs text-muted-foreground">{bar.helper}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
