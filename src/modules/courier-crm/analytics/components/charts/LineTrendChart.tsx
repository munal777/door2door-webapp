import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendPoint {
  label: string;
  value: number;
}

interface LineTrendChartProps {
  title: string;
  points: TrendPoint[];
  colorClassName?: string;
  emptyMessage?: string;
}

export default function LineTrendChart({
  title,
  points,
  colorClassName = "stroke-primary",
  emptyMessage = "No trend data available for this range.",
}: LineTrendChartProps) {
  if (!points.length) {
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

  const width = 900;
  const height = 260;
  const padding = 24;
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  const getX = (index: number) =>
    points.length === 1
      ? width / 2
      : padding + (index * (width - padding * 2)) / (points.length - 1);
  const getY = (value: number) =>
    height - padding - (value / maxValue) * (height - padding * 2);

  const polylinePoints = points
    .map((point, index) => `${getX(index)},${getY(point.value)}`)
    .join(" ");

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-64 min-w-[680px] w-full"
          >
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              className="stroke-border"
            />

            <polyline
              fill="none"
              strokeWidth="2.5"
              points={polylinePoints}
              className={colorClassName}
            />

            {points.map((point, index) => (
              <circle
                key={`${point.label}-${index}`}
                cx={getX(index)}
                cy={getY(point.value)}
                r="3.5"
                className="fill-primary"
              >
                <title>{`${point.label}: ${point.value}`}</title>
              </circle>
            ))}
          </svg>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground md:grid-cols-4 xl:grid-cols-6">
          {points.slice(-12).map((point, index) => (
            <div key={`${point.label}-${index}`} className="truncate">
              {point.label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
