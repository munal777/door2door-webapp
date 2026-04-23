import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface SummaryCardItem {
  key: string;
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
}

interface SummaryCardsProps {
  items: SummaryCardItem[];
}

export default function SummaryCards({ items }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.key} className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
            {item.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">
              {item.value}
            </div>
            {item.helper ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {item.helper}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
