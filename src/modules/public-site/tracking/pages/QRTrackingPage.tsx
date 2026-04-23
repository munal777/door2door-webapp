import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Package,
  MapPin,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
  CarFront,
} from "lucide-react";
import { orderService } from "@/services/orderService";
import type { PublicOrderTracking } from "@/types/order";
import { Button } from "@/components/ui/button";

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

export const QRTrackingPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const [tracking, setTracking] = useState<PublicOrderTracking[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch tracking data
  const fetchTracking = async (showLoader = true) => {
    if (!orderNumber) {
      setError("No order number provided");
      setLoading(false);
      return;
    }

    if (showLoader) {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await orderService.trackOrder(orderNumber);
      setTracking(result);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(
        err.message ||
          "Order not found. Please check the QR code and try again.",
      );
      setTracking(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTracking();
  }, [orderNumber]);

  // Auto-refresh effect
  useEffect(() => {
    if (!orderNumber) return;

    const interval = setInterval(() => {
      fetchTracking(false); // Don't show loader on auto-refresh
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [orderNumber]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  };

  const getStatusIcon = (
    status: string,
    size: number = 18,
    isColored: boolean = false,
  ) => {
    const statusLower = status.toLowerCase();
    const colorClass = isColored ? "" : "text-white";

    if (statusLower.includes("delivered")) {
      return (
        <CheckCircle
          className={isColored ? "text-green-600" : colorClass}
          size={size}
        />
      );
    } else if (
      statusLower.includes("cancelled") ||
      statusLower.includes("returned")
    ) {
      return (
        <XCircle
          className={isColored ? "text-red-600" : colorClass}
          size={size}
        />
      );
    } else if (statusLower.includes("out_for_delivery")) {
      return (
        <CarFront
          className={isColored ? "text-orange-600" : colorClass}
          size={size}
        />
      );
    } else if (
      statusLower.includes("transit") ||
      statusLower.includes("pickup")
    ) {
      return (
        <Truck
          className={isColored ? "text-blue-600" : colorClass}
          size={size}
        />
      );
    } else {
      return (
        <Package
          className={isColored ? "text-gray-700" : colorClass}
          size={size}
        />
      );
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();

    if (statusLower.includes("delivered")) {
      return "from-green-500 to-green-600";
    } else if (
      statusLower.includes("cancelled") ||
      statusLower.includes("returned")
    ) {
      return "from-red-500 to-red-600";
    } else if (statusLower.includes("out_for_delivery")) {
      return "from-orange-500 to-orange-600";
    } else if (statusLower.includes("transit")) {
      return "from-blue-500 to-blue-600";
    } else if (statusLower.includes("destination")) {
      return "from-purple-500 to-purple-600";
    } else if (statusLower.includes("pickup")) {
      return "from-indigo-500 to-indigo-600";
    } else {
      return "from-gray-500 to-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <div className="animate-spin rounded-full h-14 w-14 border-b-3 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-xs w-full">
          <div className="w-16 h-16 bg-linear-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-white" size={32} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {error || "Unable to fetch tracking information"}
          </p>
          <Button
            onClick={() => fetchTracking()}
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const currentStatus = tracking[0];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-3 px-3">
      <div className="max-w-md mx-auto">
        {/* Hero Status Card */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl mb-3">
          <div
            className={`absolute inset-0 bg-linear-to-br ${getStatusColor(currentStatus.status)} opacity-90`}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />

          <div className="relative px-4 py-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                #{orderNumber}
              </span>
              {lastUpdated && (
                <span className="flex items-center gap-1 text-xs bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Live
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                {getStatusIcon(currentStatus.status, 32)}
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold leading-tight mb-1">
                  {currentStatus.status
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
                <div className="flex items-center gap-1.5 text-sm opacity-90">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{currentStatus.location_city}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5">
              <p className="text-xs leading-relaxed">{currentStatus.remarks}</p>
            </div>
          </div>
        </div>

        {/* Tracking History */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-3">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Tracking History
          </h3>

          <div className="space-y-0">
            {tracking.map((event, index) => {
              const isLatest = index === 0;

              return (
                <div key={index} className="relative pb-4 last:pb-0">
                  {index !== tracking.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
                  )}

                  <div className="flex gap-3">
                    <div
                      className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center z-10 ${
                        isLatest
                          ? `bg-linear-to-br ${getStatusColor(event.status)} shadow-md`
                          : "bg-gray-100"
                      }`}
                    >
                      {getStatusIcon(
                        event.status,
                        isLatest ? 18 : 14,
                        !isLatest,
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p
                          className={`font-semibold text-sm truncate ${
                            isLatest ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {event.status
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                        {isLatest && (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded shrink-0">
                            NOW
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{event.location_city}</span>
                      </div>

                      <p className="text-xs text-gray-700 leading-snug mb-1">
                        {event.remarks}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatDateTime(event.created_at)}</span>
                        {isLatest && lastUpdated && (
                          <span className="text-gray-400">
                            • {formatTimeAgo(new Date(lastUpdated))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
