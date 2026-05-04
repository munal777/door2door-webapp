import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { bucketService } from "@/services/bucketService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Package,
  ExternalLink,
  Route,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";
import type { TransportBucket, TrackingEventResult } from "@/types/bucket";
import BatchSearchBar from "@/modules/courier-crm/shipments/components/BatchSearchBar";
import BatchTrackingForm from "@/modules/courier-crm/shipments/components/BatchTrackingForm";

/* ─── helpers ─────────────────────────────────────────────── */
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const ACTION_LABELS: Record<string, string> = {
  departed_origin: "Departed Origin",
  arrived_transit: "Arrived Transit",
  departed_transit: "Departed Transit",
  arrived_destination: "Arrived Destination",
  partial_unload: "Partial Unload",
};

const ACTION_COLORS: Record<string, string> = {
  departed_origin: "bg-blue-100 text-blue-700 border-blue-200",
  arrived_transit: "bg-amber-100 text-amber-700 border-amber-200",
  departed_transit: "bg-orange-100 text-orange-700 border-orange-200",
  arrived_destination: "bg-emerald-100 text-emerald-700 border-emerald-200",
  partial_unload: "bg-purple-100 text-purple-700 border-purple-200",
};

/* ─── component ────────────────────────────────────────────── */
export default function BatchUpdateView() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [batch, setBatch] = useState<TransportBucket | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentEvents, setRecentEvents] = useState<TrackingEventResult[]>([]);

  const handleSearch = async (bucketNumber: string) => {
    setIsSearching(true);
    setSearchError(null);
    setBatch(null);
    setRecentEvents([]);
    try {
      const data = await bucketService.getBucketDetail(bucketNumber);
      setBatch(data);
    } catch {
      setSearchError(
        `No shipment batch found with number "${bucketNumber}". Please check and try again.`
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    setBatch(null);
    setSearchError(null);
    setRecentEvents([]);
  };

  const handleTrackingSuccess = async (result: TrackingEventResult) => {
    setRecentEvents((prev) => [result, ...prev]);
    // Refresh batch data to get latest tracking history
    if (batch) {
      try {
        const updated = await bucketService.getBucketDetail(batch.bucket_number);
        setBatch(updated);
      } catch {
        // non-critical — just keep stale data
      }
    }
  };

  const destinationStop = batch?.stops?.[batch.stops.length - 1];

  return (
    <div className="space-y-6">

        {/* Search Bar */}
        <div className="mb-6">
          <BatchSearchBar
            onSearch={handleSearch}
            isLoading={isSearching}
            value={searchValue}
            onChange={setSearchValue}
            onClear={handleClear}
          />
        </div>

        {/* Search Error */}
        {searchError && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-800 text-sm">
            {searchError}
          </div>
        )}

        {/* Batch Found */}
        {batch && (
          <div className="space-y-5 animate-in fade-in-0 slide-in-from-top-2 duration-300">
            {/* Batch Summary Banner */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-indigo-50 rounded-lg">
                    <Package className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</p>
                    <p className="text-xl font-bold text-gray-900 font-mono">{batch.bucket_number}</p>
                  </div>
                  <Separator orientation="vertical" className="h-10 hidden sm:block" />
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{batch.origin_city}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                    {destinationStop ? (
                      <span className="font-medium">{destinationStop.city}</span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                  <Separator orientation="vertical" className="h-10 hidden sm:block" />
                  <div className="flex items-center gap-1.5 text-sm">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-700">{batch.order_count ?? batch.orders?.length ?? 0}</span>
                    <span className="text-gray-500">orders</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {batch.closed_at ? (
                    <Badge variant="outline" className="text-sm px-3 py-1 bg-gray-100 text-gray-600 border-gray-200">
                      Closed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-sm px-3 py-1 bg-emerald-100 text-emerald-700 border-emerald-200">
                      Open
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/courier/batches/${batch.bucket_number}`)}
                    className="h-9 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Full Detail
                  </Button>
                </div>
              </div>

              {/* Stops Route */}
              {batch.stops && batch.stops.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Route Stops</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Circle className="h-3.5 w-3.5 text-indigo-400 fill-indigo-400" />
                      <span className="font-medium text-gray-700">{batch.origin_city}</span>
                      <span className="text-gray-400 text-xs">(Origin)</span>
                    </div>
                    {batch.stops.map((stop, idx) => (
                      <div key={stop.id} className="flex items-center gap-2">
                        <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                        <div className="flex items-center gap-1.5 text-sm">
                          {idx === batch.stops!.length - 1 ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          )}
                          <span className="font-medium text-gray-700">{stop.city}</span>
                          <Badge variant="outline" className="text-xs py-0 px-1.5 border-gray-200 text-gray-500">
                            Stop {stop.stop_order}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              {/* Left: Tracking Form */}
              <div className="xl:col-span-2 space-y-5">
                {batch.closed_at ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                    <CheckCircle2 className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Batch Closed</h3>
                    <p className="text-xs text-gray-500">
                      This batch was closed on {formatDate(batch.closed_at)} and can no longer receive tracking events.
                    </p>
                  </div>
                ) : (
                  <BatchTrackingForm batch={batch} onSuccess={handleTrackingSuccess} />
                )}

                {/* Recent Events (this session) */}
                {recentEvents.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="text-sm font-semibold text-gray-800">Session Events</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Events recorded in this session</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {recentEvents.map((evt, idx) => (
                        <div key={idx} className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">{evt.location_city}</p>
                              <p className="text-xs text-gray-500">{evt.orders_updated} orders updated</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={`text-xs ${ACTION_COLORS[evt.action] ?? ""}`}>
                            {ACTION_LABELS[evt.action] ?? evt.action}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Info cards */}
              <div className="space-y-5">
                {/* Orders in Batch */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="px-5 py-4 border-b border-gray-100">
                    <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      Orders in Batch
                      <span className="ml-auto text-xs font-normal text-gray-400">
                        {batch.orders?.length ?? 0}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 py-0">
                    {batch.orders && batch.orders.length > 0 ? (
                      <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                        {batch.orders.map((bo) => (
                          <div key={bo.id} className="px-5 py-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-mono font-semibold text-indigo-600">
                                {bo.order_number}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {bo.package_type}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-500">{bo.receiver_name}</p>
                              <p className="text-xs text-gray-400">{bo.weight} kg</p>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-gray-300" />
                              <p className="text-xs text-gray-400">{bo.receiver_city}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-5 py-8 text-center text-xs text-gray-400">
                        No orders in this batch
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tracking History */}
                {batch.tracking_history && batch.tracking_history.length > 0 && (
                  <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="px-5 py-4 border-b border-gray-100">
                      <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        Tracking History
                        <span className="ml-auto text-xs font-normal text-gray-400">
                          {batch.tracking_history.length} events
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-4">
                      <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                        {batch.tracking_history.map((track, idx) => (
                          <div key={track.id} className="flex gap-3">
                            <div className="flex flex-col items-center pt-1">
                              <div
                                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                  idx === 0 ? "bg-indigo-500" : "bg-gray-300"
                                }`}
                              />
                              {idx < batch.tracking_history!.length - 1 && (
                                <div className="w-px flex-1 bg-gray-200 mt-1" />
                              )}
                            </div>
                            <div className="pb-3 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className={`text-xs py-0 ${ACTION_COLORS[track.action] ?? ""}`}
                                >
                                  {ACTION_LABELS[track.action] ?? track.action}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {formatDate(track.created_at)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{track.location_city}</p>
                              {track.orders_updated_count > 0 && (
                                <p className="text-xs text-gray-400">
                                  {track.orders_updated_count} orders updated
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Batch Info */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="px-5 py-4 border-b border-gray-100">
                    <CardTitle className="text-sm font-semibold text-gray-800">Batch Info</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 py-4 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created</span>
                      <span className="text-gray-700">{formatDate(batch.created_at)}</span>
                    </div>
                    {batch.created_by_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Created by</span>
                        <span className="text-gray-700">{batch.created_by_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status</span>
                      {batch.closed_at ? (
                        <span className="text-gray-500 text-xs">Closed · {formatDate(batch.closed_at)}</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Open</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!batch && !searchError && !isSearching && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
              <Route className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Search for a Batch</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Enter a shipment batch number above to load batch details and record a scan tracking event for all orders inside.
            </p>
          </div>
        )}
    </div>
  );
}
