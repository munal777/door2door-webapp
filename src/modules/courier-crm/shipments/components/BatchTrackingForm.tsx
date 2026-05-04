import { useState } from "react";
import { bucketService } from "@/services/bucketService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Navigation, RefreshCw } from "lucide-react";
import type { TransportBucket, UpdateBucketLocationData, TrackingEventResult } from "@/types/bucket";

interface BatchTrackingFormProps {
  batch: TransportBucket;
  onSuccess: (result: TrackingEventResult) => void;
}

const SCAN_ACTIONS = [
  {
    value: "departed_origin",
    label: "Departed from Origin Hub",
    description: "Batch left the origin sorting facility",
    color: "text-blue-600",
  },
  {
    value: "arrived_transit",
    label: "Arrived at Transit Hub",
    description: "Batch arrived at an intermediate hub",
    color: "text-amber-600",
  },
  {
    value: "departed_transit",
    label: "Departed from Transit Hub",
    description: "Batch left a transit hub",
    color: "text-orange-600",
  },
  {
    value: "arrived_destination",
    label: "Arrived at Destination Hub",
    description: "Batch reached the final destination hub",
    color: "text-emerald-600",
  },
  {
    value: "partial_unload",
    label: "Partial Unload at Stop",
    description: "Some orders unloaded at an intermediate stop",
    color: "text-purple-600",
  },
] as const;

type ScanAction = (typeof SCAN_ACTIONS)[number]["value"];

export default function BatchTrackingForm({ batch, onSuccess }: BatchTrackingFormProps) {
  const [action, setAction] = useState<ScanAction>("departed_origin");
  const [locationCity, setLocationCity] = useState("");
  const [stopId, setStopId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<TrackingEventResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPartialUnload = action === "partial_unload";
  const hasStops = batch.stops && batch.stops.length > 0;

  const handleSubmit = async () => {
    if (!locationCity.trim()) {
      setError("Location city is required.");
      return;
    }
    if (isPartialUnload && !stopId) {
      setError("Please select a stop for partial unload.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const payload: UpdateBucketLocationData = {
      action,
      location_city: locationCity.trim(),
    };
    if (isPartialUnload && stopId) {
      payload.bucket_stop_id = parseInt(stopId);
    }

    try {
      const result = await bucketService.updateBucketLocation(batch.bucket_number, payload);
      setSuccess(result);
      onSuccess(result);
      setLocationCity("");
      setStopId("");
      setNotes("");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record tracking event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAction("departed_origin");
    setLocationCity("");
    setStopId("");
    setNotes("");
    setError(null);
  };

  const selectedAction = SCAN_ACTIONS.find((a) => a.value === action);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-gray-800">Record Tracking Scan</h3>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 ml-6">
          Record the current location and movement action for this batch — all orders will be updated automatically
        </p>
      </div>

      <div className="p-6 space-y-5">
        {/* Action Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Scan Action
          </label>
          <Select value={action} onValueChange={(v) => setAction(v as ScanAction)}>
            <SelectTrigger
              id="batch-scan-action"
              className="h-10 border-gray-300 focus:ring-indigo-600 focus:border-indigo-600"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCAN_ACTIONS.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  <div>
                    <p className={`font-medium text-sm ${a.color}`}>{a.label}</p>
                    <p className="text-xs text-gray-400">{a.description}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedAction && (
            <p className="text-xs text-gray-500 mt-1.5 ml-0.5">
              {selectedAction.description}
            </p>
          )}
        </div>

        {/* Location City */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Current Location City <span className="text-red-400">*</span>
          </label>
          <Input
            id="batch-location-city"
            placeholder="e.g. Kathmandu"
            value={locationCity}
            onChange={(e) => setLocationCity(e.target.value)}
            className="h-10 border-gray-300 focus-visible:ring-indigo-600 focus-visible:border-indigo-600"
          />
        </div>

        {/* Stop Selector — only for partial unload */}
        {isPartialUnload && hasStops && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Stop / Destination <span className="text-red-400">*</span>
            </label>
            <Select value={stopId} onValueChange={setStopId}>
              <SelectTrigger
                id="batch-stop-selector"
                className="h-10 border-gray-300 focus:ring-indigo-600 focus:border-indigo-600"
              >
                <SelectValue placeholder="Select stop..." />
              </SelectTrigger>
              <SelectContent>
                {batch.stops!.map((stop) => (
                  <SelectItem key={stop.id} value={String(stop.id)}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs py-0 px-1.5">
                        Stop {stop.stop_order}
                      </Badge>
                      <span>{stop.city}, {stop.state}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <Textarea
            id="batch-scan-notes"
            placeholder="Any additional notes about this scan (e.g. delay reason, partial load info)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="resize-none border-gray-300 text-sm focus-visible:ring-indigo-600 focus-visible:border-indigo-600"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">Tracking event recorded!</span>
            </div>
            <p className="text-xs text-emerald-600 ml-6">
              {success.orders_updated} order{success.orders_updated !== 1 ? "s" : ""} updated · Location: {success.location_city}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <Button
            id="batch-tracking-reset"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 h-9"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>
          <Button
            id="batch-tracking-submit"
            onClick={handleSubmit}
            disabled={isLoading || !locationCity.trim()}
            className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isLoading ? "Recording..." : "Record Scan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
