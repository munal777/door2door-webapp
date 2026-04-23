import { useCallback, useEffect, useRef, useState } from "react";
import { orderService } from "@/services/orderService";
import type {
  NearbyOrderRequestAction,
  NearbyOrderRequestListItem,
} from "@/types/order";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const POLL_INTERVAL_MS = 10000;

export default function OnlineOrderRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<NearbyOrderRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actingRequest, setActingRequest] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isFetchingRef = useRef(false);
  const latestRequestNumbersRef = useRef<Set<string>>(new Set());

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
    }).format(amount);

  const fetchRequests = useCallback(
    async (silent = false) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setError(null);
      try {
        const result = await orderService.getNearbyOrderRequests();

        if (silent) {
          const previous = latestRequestNumbersRef.current;
          const newItems = result.filter(
            (item) => !previous.has(item.request_number),
          );

          if (newItems.length > 0) {
            toast({
              title: "New request received",
              description:
                newItems.length === 1
                  ? `1 new nearby order request is available.`
                  : `${newItems.length} new nearby order requests are available.`,
            });
          }
        }

        setRequests(result);
        latestRequestNumbersRef.current = new Set(
          result.map((item) => item.request_number),
        );
        setLastUpdated(new Date());
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load online requests";
        setError(message);
      } finally {
        isFetchingRef.current = false;
        if (!silent) {
          setLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchRequests(false);
  }, [fetchRequests]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRequests(true);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchRequests]);

  const handleAction = async (
    requestNumber: string,
    action: NearbyOrderRequestAction,
  ) => {
    setActingRequest(requestNumber);
    try {
      const response = await orderService.actOnNearbyOrderRequest(
        requestNumber,
        action,
      );

      toast({
        title: action === "accept" ? "Request accepted" : "Request updated",
        description:
          action === "accept" && response.order_number
            ? `Order ${response.order_number} created successfully.`
            : response.message,
      });

      await fetchRequests(true);
    } catch (err) {
      toast({
        title: "Action failed",
        description:
          err instanceof Error ? err.message : "Could not update this request",
        variant: "destructive",
      });
    } finally {
      setActingRequest(null);
    }
  };

  return (
    <div className="h-full bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Online Order Requests
            </h1>
            <p className="text-sm text-gray-500">
              Requests appear automatically for your nearby service area every{" "}
              {POLL_INTERVAL_MS / 1000} seconds.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Bell className="h-4 w-4" />
            <span>
              {lastUpdated
                ? `Last updated ${lastUpdated.toLocaleTimeString()}`
                : "Waiting for first sync..."}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRequests(true)}
              disabled={loading || isRefreshing}
              className="ml-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Nearby Request Feed
            </h2>
            <div className="text-xs text-gray-500">
              {requests.length} request{requests.length === 1 ? "" : "s"}{" "}
              available
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center text-gray-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading online requests...
            </div>
          ) : error ? (
            <div className="py-10 flex flex-col items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <p className="text-sm">{error}</p>
              <Button variant="outline" onClick={() => fetchRequests(false)}>
                Try again
              </Button>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Clock3 className="h-6 w-6 mx-auto mb-2" />
              No nearby online requests available right now.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => {
                    const isActing = actingRequest === request.request_number;
                    return (
                      <TableRow key={request.request_number}>
                        <TableCell className="font-medium">
                          {request.request_number}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">
                              {request.pickup_city}, {request.pickup_state}
                            </p>
                            <p className="text-gray-500">
                              to {request.delivery_city},{" "}
                              {request.delivery_state}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="w-fit">
                              {request.package_type_display}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {request.weight} kg •{" "}
                              {request.service_type_display}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(request.estimated_price)}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {request.expires_at}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleAction(request.request_number, "accept")
                              }
                              disabled={isActing}
                            >
                              {isActing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              <span className="ml-1">Accept</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleAction(request.request_number, "decline")
                              }
                              disabled={isActing}
                            >
                              <XCircle className="h-4 w-4" />
                              <span className="ml-1">Decline</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleAction(request.request_number, "ignore")
                              }
                              disabled={isActing}
                            >
                              Ignore
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
