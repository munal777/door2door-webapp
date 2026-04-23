import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { bucketService } from "@/services/bucketService";
import { LocationTypeahead } from "@/components/ui/location-typeahead";
import type { CreateBucketData } from "@/types/bucket";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CreateShippingBatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (bucketNumber: string) => void;
}

export const CreateShippingBatchModal: React.FC<
  CreateShippingBatchModalProps
> = ({ open, onOpenChange, onSuccess }) => {
  const [originCity, setOriginCity] = useState("");
  const [originState, setOriginState] = useState("");
  const [originLocationDisplay, setOriginLocationDisplay] = useState("");
  const [stops, setStops] = useState<
    Array<{ city: string; state: string; stopOrder: number }>
  >([]);
  const [newStopCity, setNewStopCity] = useState("");
  const [newStopState, setNewStopState] = useState("");
  const [newStopLocationDisplay, setNewStopLocationDisplay] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setOriginCity("");
    setOriginState("");
    setOriginLocationDisplay("");
    setStops([]);
    setNewStopCity("");
    setNewStopState("");
    setNewStopLocationDisplay("");
    setError(null);
  };

  const handleOriginLocationSelect = (location: {
    city: string;
    state: string;
  }) => {
    setOriginCity(location.city);
    setOriginState(location.state);
    if (location.city && location.state) {
      setOriginLocationDisplay(`${location.city}, ${location.state}`);
    } else {
      setOriginLocationDisplay("");
    }
  };

  const handleNewStopLocationSelect = (location: {
    city: string;
    state: string;
  }) => {
    setNewStopCity(location.city);
    setNewStopState(location.state);
    if (location.city && location.state) {
      setNewStopLocationDisplay(`${location.city}, ${location.state}`);
    } else {
      setNewStopLocationDisplay("");
    }
  };

  const addStop = () => {
    if (!newStopCity.trim() || !newStopState.trim()) return;

    setStops([
      ...stops,
      {
        city: newStopCity.trim(),
        state: newStopState.trim(),
        stopOrder: stops.length + 1,
      },
    ]);
    setNewStopCity("");
    setNewStopState("");
    setNewStopLocationDisplay("");
  };

  const removeStop = (index: number) => {
    const updated = stops.filter((_, i) => i !== index);
    // Reorder
    const reordered = updated.map((stop, i) => ({
      ...stop,
      stopOrder: i + 1,
    }));
    setStops(reordered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!originCity.trim()) {
      setError("Origin city is required");
      return;
    }

    if (!originState.trim()) {
      setError("Origin state is required");
      return;
    }

    // Auto-add the selected destination if user hasn't clicked "Add Stop" yet
    let finalStops = [...stops];
    if (newStopCity.trim() && newStopState.trim()) {
      finalStops.push({
        city: newStopCity.trim(),
        state: newStopState.trim(),
        stopOrder: finalStops.length + 1,
      });
    }

    if (finalStops.length === 0) {
      setError("At least one destination city is required");
      return;
    }

    setSubmitting(true);

    try {
      const data: CreateBucketData = {
        origin_city: originCity.trim(),
        origin_state: originState.trim(),
        stops: finalStops.map((s) => ({
          city: s.city,
          state: s.state,
          stop_order: s.stopOrder,
        })),
      };

      const result = await bucketService.createBucket(data);
      resetForm();
      onOpenChange(false);
      if (onSuccess) {
        onSuccess(result.bucket_number);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create batch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create Shipping Batch
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Set up a new delivery route with origin and destination stops
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Origin Location */}
          <div className="space-y-2">
            <LocationTypeahead
              id="origin_location"
              label="Origin Location"
              value={originLocationDisplay}
              onLocationSelect={handleOriginLocationSelect}
              placeholder="Start typing origin city (e.g., Kathmandu)"
              required
            />
            <p className="text-xs text-gray-500">
              Where the shipping batch starts from
            </p>
          </div>

          {/* Delivery Cities */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Cities <span className="text-red-600">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Add cities in the order of delivery
              </p>
            </div>

            <div className="space-y-2">
              <LocationTypeahead
                id="new_stop_location"
                value={newStopLocationDisplay}
                onLocationSelect={handleNewStopLocationSelect}
                placeholder="Start typing delivery city (e.g., Pokhara)"
              />
              <Button
                type="button"
                onClick={addStop}
                disabled={!newStopCity || !newStopState}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Plus size={16} className="mr-2" />
                Add Stop
              </Button>
            </div>

            {/* Stops List */}
            {stops.length > 0 && (
              <div className="space-y-2 mt-4">
                {stops.map((stop, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
                      {stop.stopOrder}
                    </div>
                    <div className="flex-1 text-sm font-medium text-gray-900">
                      {stop.city}, {stop.state}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStop(index)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Batch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
