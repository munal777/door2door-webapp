import React, { useState } from "react";
import { X, MapPin, CheckCircle } from "lucide-react";
import { bucketService } from "@/services/bucketService";
import type { UpdateBucketLocationData, BucketStop } from "@/types/bucket";

interface RecordTrackingEventFormProps {
  bucketNumber: string;
  currentLocation?: string;
  stops?: BucketStop[];
  onSuccess: () => void;
  onCancel: () => void;
}

const SCAN_ACTIONS = [
  {
    value: "departed_origin",
    label: "Departed from Origin",
    description: "Shipping batch has left the origin hub",
  },
  {
    value: "arrived_transit",
    label: "Arrived at Transit Hub",
    description: "Shipping batch reached a transit hub",
  },
  {
    value: "departed_transit",
    label: "Departed from Transit Hub",
    description: "Shipping batch left the transit hub",
  },
  {
    value: "arrived_destination",
    label: "Arrived at Destination",
    description: "Shipping batch reached the destination hub",
  },
  {
    value: "partial_unload",
    label: "Partial Unload",
    description: "Unloading orders at a specific stop",
  },
] as const;

export const RecordTrackingEventForm: React.FC<
  RecordTrackingEventFormProps
> = ({ bucketNumber, currentLocation, stops = [], onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<UpdateBucketLocationData>({
    action: "departed_origin",
    location_city: "",
    bucket_stop_id: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (field: keyof UpdateBucketLocationData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await bucketService.updateBucketLocation(
        bucketNumber,
        formData,
      );

      setSuccess(
        `Successfully recorded tracking event! ${result.orders_updated} order${result.orders_updated !== 1 ? "s" : ""} updated.`,
      );

      // Delay before closing to show success message
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to record tracking event");
      setLoading(false);
    }
  };

  const selectedAction = SCAN_ACTIONS.find((a) => a.value === formData.action);
  const showStopSelection =
    formData.action === "partial_unload" && stops.length > 0;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-primary px-6 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Record Tracking Event
            </h2>
            <p className="text-primary-foreground/80 text-sm mt-1 font-mono">
              {bucketNumber}
            </p>
            {currentLocation && (
              <p className="text-sm text-primary-foreground/80 mt-1 flex items-center gap-1">
                <MapPin size={14} />
                Current: {currentLocation}
              </p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
                <span className="font-semibold">Error: </span>
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle size={20} />
                <span className="font-semibold">{success}</span>
              </div>
            )}

            {/* Scan Action */}
            <div className="bg-secondary rounded-lg p-5 space-y-3">
              <label className="block text-sm font-semibold text-gray-800">
                Tracking Event Type <span className="text-red-500">*</span>
              </label>

              <div className="space-y-3">
                {SCAN_ACTIONS.map((action) => (
                  <label
                    key={action.value}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.action === action.value
                        ? "border-primary bg-secondary shadow-sm"
                        : "border-gray-300 bg-white hover:border-primary/40 hover:bg-secondary"
                    }`}
                  >
                    <input
                      type="radio"
                      name="action"
                      value={action.value}
                      checked={formData.action === action.value}
                      onChange={(e) => handleChange("action", e.target.value)}
                      className="mt-1 w-4 h-4 text-primary"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-semibold text-gray-900">
                        {action.label}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {action.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Location City */}
            <div className="bg-card rounded-lg border border-border p-5">
              <label className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <MapPin className="text-primary" size={18} />
                Location City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location_city}
                onChange={(e) => handleChange("location_city", e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/60 transition-colors"
                placeholder="e.g., Kathmandu"
              />
              <p className="text-sm text-gray-600 mt-2">
                📍 Enter the city where this event is taking place
              </p>
            </div>

            {/* Stop Selection (for partial unload) */}
            {showStopSelection && (
              <div className="bg-secondary rounded-lg p-5">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Select Stop <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.bucket_stop_id || ""}
                  onChange={(e) =>
                    handleChange(
                      "bucket_stop_id",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  required={formData.action === "partial_unload"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/60 transition-colors"
                >
                  <option value="">Select a stop...</option>
                  {stops.map((stop) => (
                    <option key={stop.id} value={stop.id}>
                      {stop.city} ({stop.orders_count} orders)
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 mt-2">
                  📦 Select which stop's orders are being unloaded
                </p>
              </div>
            )}

            {/* Information Box */}
            <div className="bg-secondary border-l-4 border-primary rounded-lg p-4">
              <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="text-lg">💡</span> What happens next:
              </h4>
              <p className="text-sm text-foreground/80">
                {selectedAction?.value === "departed_origin" &&
                  'All orders in this bucket will be marked as "In Transit" with a customer notification.'}
                {selectedAction?.value === "arrived_transit" &&
                  'Orders will remain "In Transit" with an update showing they arrived at a transit facility.'}
                {selectedAction?.value === "departed_transit" &&
                  'Orders will continue as "In Transit" with an update that they left the transit hub.'}
                {selectedAction?.value === "arrived_destination" &&
                  'Orders reaching their destination city will be marked as "At Destination Hub", ready for delivery.'}
                {selectedAction?.value === "partial_unload" &&
                  'Only the selected stop\'s orders will be marked as "At Destination Hub".'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || success !== null}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Recording...
                  </span>
                ) : (
                  "Record Event"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
