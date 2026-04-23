import { useEffect, useState } from "react";
import { CalendarRange, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AnalyticsGroupBy,
  AnalyticsQueryParams,
  AnalyticsRangePreset,
} from "@/types/analytics";

interface AnalyticsDateFilterProps {
  value: AnalyticsQueryParams;
  onApply: (query: AnalyticsQueryParams) => void;
  isLoading?: boolean;
}

const defaultValue: AnalyticsQueryParams = {
  range: "month",
  group_by: "auto",
};

export default function AnalyticsDateFilter({
  value,
  onApply,
  isLoading = false,
}: AnalyticsDateFilterProps) {
  const [draft, setDraft] = useState<AnalyticsQueryParams>({
    ...defaultValue,
    ...value,
  });

  useEffect(() => {
    setDraft({
      ...defaultValue,
      ...value,
    });
  }, [value]);

  const handleRangeChange = (range: AnalyticsRangePreset) => {
    setDraft((prev) => {
      if (range === "custom") {
        return { ...prev, range };
      }
      return {
        ...prev,
        range,
        start_date: undefined,
        end_date: undefined,
      };
    });
  };

  const applyFilters = () => {
    if (draft.range === "custom") {
      onApply({
        range: "custom",
        group_by: draft.group_by || "auto",
        start_date: draft.start_date,
        end_date: draft.end_date,
      });
      return;
    }

    onApply({
      range: draft.range,
      group_by: draft.group_by || "auto",
    });
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-md border border-border/70 bg-muted/40 p-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Analytics Filters</h3>
          <p className="text-xs text-muted-foreground">
            Use preset ranges or pick an exact date interval.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label className="text-xs">Range</Label>
          <Select
            value={draft.range || "month"}
            onValueChange={(value) =>
              handleRangeChange(value as AnalyticsRangePreset)
            }
          >
            <SelectTrigger className="h-10 border-border/70 bg-background shadow-sm focus:border-primary/60 focus:ring-2 focus:ring-primary/15">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className="border-border/70">
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Start Date</Label>
          <div className="relative">
            <CalendarRange className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={draft.start_date || ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, start_date: e.target.value }))
              }
              disabled={draft.range !== "custom"}
              className="h-10 border-border/70 pl-10 shadow-sm focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/15"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">End Date</Label>
          <div className="relative">
            <CalendarRange className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={draft.end_date || ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, end_date: e.target.value }))
              }
              disabled={draft.range !== "custom"}
              className="h-10 border-border/70 pl-10 shadow-sm focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/15"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Aggregation</Label>
          <Select
            value={draft.group_by || "auto"}
            onValueChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                group_by: value as AnalyticsGroupBy,
              }))
            }
          >
            <SelectTrigger className="h-10 border-border/70 bg-background shadow-sm focus:border-primary/60 focus:ring-2 focus:ring-primary/15">
              <SelectValue placeholder="Auto" />
            </SelectTrigger>
            <SelectContent className="border-border/70">
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          onClick={applyFilters}
          disabled={isLoading}
          className="min-w-28"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
