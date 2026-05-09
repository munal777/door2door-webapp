import React, { useState } from "react";
import {
  Search,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from "lucide-react";
import { orderService } from "@/services/orderService";
import type { PublicOrderTracking } from "@/types/order";

export const OrderTrackingSearch: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [tracking, setTracking] = useState<PublicOrderTracking[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim()) {
      setError("Please enter an order number");
      return;
    }

    setError(null);
    setLoading(true);
    setTracking(null);

    try {
      const result = await orderService.trackOrder(orderNumber.trim());
      setTracking(result);
    } catch (err: any) {
      setError(
        err.message ||
          "Order not found. Please check your order number and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();

    if (statusLower.includes("delivered")) {
      return <CheckCircle size={20} />;
    } else if (
      statusLower.includes("cancelled") ||
      statusLower.includes("returned")
    ) {
      return <XCircle size={20} />;
    } else if (
      statusLower.includes("transit") ||
      statusLower.includes("pickup")
    ) {
      return <Truck size={20} />;
    } else {
      return <Package size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();

    if (statusLower.includes("delivered")) {
      return "bg-green-50 text-green-700 border-green-200";
    } else if (
      statusLower.includes("cancelled") ||
      statusLower.includes("returned")
    ) {
      return "bg-red-50 text-red-700 border-red-200";
    } else if (statusLower.includes("transit")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    } else {
      return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Track Your Order
        </h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Enter your order number (e.g., 202603040001)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/60 font-mono transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Search size={20} />
            {loading ? "Searching..." : "Track"}
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Tracking Results */}
      {tracking && tracking.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Order #{tracking[0].order_number}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Tracking history ({tracking.length} update
                {tracking.length !== 1 ? "s" : ""})
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-full border-2 ${getStatusColor(tracking[0].status)}`}
            >
              <span className="font-semibold text-sm">
                {tracking[0].status.replace(/_/g, " ").toUpperCase()}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {tracking.map((event, index) => (
              <div key={index} className="flex gap-4 pb-8 last:pb-0">
                {/* Timeline Icon */}
                <div className="flex flex-col items-center">
                  <div
                    className={`p-3 rounded-full flex items-center justify-center transition-colors ${
                      index === 0
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-gray-50 text-gray-400 border border-gray-200"
                    }`}
                  >
                    {getStatusIcon(event.status)}
                  </div>
                  {index < tracking.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 min-h-16 my-2"></div>
                  )}
                </div>

                {/* Event Details */}
                <div className="flex-1 pt-1.5">
                  <div className={`rounded-xl p-5 border transition-colors ${
                    index === 0 
                      ? "bg-white border-primary/20 shadow-sm" 
                      : "bg-gray-50/50 border-gray-100"
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <h4 className={`font-bold ${index === 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                        {event.status
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h4>
                      {index === 0 && (
                        <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                          Latest
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin size={14} />
                      <span>{event.location_city}</span>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">
                      {event.remarks}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>{formatDateTime(event.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-secondary border border-primary/30 rounded-md p-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Need Help?
            </h4>
            <p className="text-sm text-foreground/80">
              If you have any questions about your order, please contact our
              customer support with your order number.
            </p>
          </div>
        </div>
      )}

      {/* No Results */}
      {tracking && tracking.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Tracking Information
          </h3>
          <p className="text-gray-600">
            No tracking updates found for this order number.
          </p>
        </div>
      )}
    </div>
  );
};
