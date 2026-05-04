import { useState } from "react";
import { orderService } from "@/services/orderService";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ClipboardEdit,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  CreditCard,
  Clock,
  ArrowRight,
} from "lucide-react";
import type { OrderDetail } from "@/types/order";
import OrderCRMSearchBar from "@/modules/courier-crm/orders/components/OrderCRMSearchBar";
import OrderStatusUpdateForm from "@/modules/courier-crm/orders/components/OrderStatusUpdateForm";
import ParcelDetailsUpdateForm from "@/modules/courier-crm/orders/components/ParcelDetailsUpdateForm";

/* ─── helpers ─────────────────────────────────────────────── */
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR" }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusColorMap: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  picked_up: "bg-purple-100 text-purple-700 border-purple-200",
  in_transit: "bg-amber-100 text-amber-700 border-amber-200",
  out_for_delivery: "bg-orange-100 text-orange-700 border-orange-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  returned: "bg-rose-100 text-rose-700 border-rose-200",
};

const paymentColorMap: Record<string, string> = {
  paid: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  refunded: "bg-slate-100 text-slate-700 border-slate-200",
};

function getColor(map: Record<string, string>, display: string) {
  const key = display.toLowerCase().replace(/\s+/g, "_");
  return map[key] || "bg-gray-100 text-gray-700 border-gray-200";
}

/* ─── component ────────────────────────────────────────────── */
export default function OrderUpdateView() {
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (orderNumber: string) => {
    setIsSearching(true);
    setSearchError(null);
    setOrder(null);
    try {
      const data = await orderService.getOrderDetail(orderNumber);
      setOrder(data);
    } catch {
      setSearchError(`No order found with number "${orderNumber}". Please check the order number and try again.`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    setOrder(null);
    setSearchError(null);
  };

  return (
    <div className="space-y-6">

        {/* Search Bar */}
        <div className="mb-6">
          <OrderCRMSearchBar
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

        {/* Order Found */}
        {order && (
          <div className="space-y-5 animate-in fade-in-0 slide-in-from-top-2 duration-300">
            {/* Order Summary Banner */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-blue-50 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Order Number</p>
                    <p className="text-xl font-bold text-gray-900 font-mono">{order.order_number}</p>
                  </div>
                  <Separator orientation="vertical" className="h-10 hidden sm:block" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Type</p>
                    <p className="text-sm font-medium text-gray-700">{order.order_type_display}</p>
                  </div>
                  <Separator orientation="vertical" className="h-10 hidden sm:block" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Service</p>
                    <p className="text-sm font-medium text-gray-700">{order.service_type_display}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-sm font-medium px-3 py-1 ${getColor(statusColorMap, order.status_display)}`}
                  >
                    {order.status_display}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-sm font-medium px-3 py-1 ${getColor(paymentColorMap, order.payment_status_display)}`}
                  >
                    {order.payment_status_display}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              {/* Left column: forms */}
              <div className="xl:col-span-2 space-y-5">
                <OrderStatusUpdateForm
                  order={order}
                  onUpdated={setOrder}
                />
                <ParcelDetailsUpdateForm
                  order={order}
                  onUpdated={setOrder}
                />
              </div>

              {/* Right column: info cards */}
              <div className="space-y-5">
                {/* Sender / Receiver */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="px-5 py-4 border-b border-gray-100">
                    <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      Route Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 py-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sender</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-800">{order.sender_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600">{order.sender_phone}</span>
                        </div>
                        {order.sender_email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600">{order.sender_email}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">
                            {order.sender_city}, {order.sender_state}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Receiver</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-800">{order.receiver_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600">{order.receiver_phone}</span>
                        </div>
                        {order.receiver_email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600">{order.receiver_email}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">
                            {order.receiver_city}, {order.receiver_state}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Summary */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="px-5 py-4 border-b border-gray-100">
                    <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      Payment Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 py-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Total Price</span>
                      <span className="text-base font-bold text-gray-900">{formatCurrency(order.total_price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Method</span>
                      <Badge variant="outline" className="text-xs">{order.payment_method_display}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getColor(paymentColorMap, order.payment_status_display)}`}
                      >
                        {order.payment_status_display}
                      </Badge>
                    </div>
                    {order.created_by_name && (
                      <>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Created by</span>
                          <span className="text-sm font-medium text-gray-700">{order.created_by_name}</span>
                        </div>
                      </>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Created</span>
                      <span className="text-xs text-gray-600">{formatDate(order.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Tracking History */}
                {order.tracking_history && order.tracking_history.length > 0 && (
                  <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="px-5 py-4 border-b border-gray-100">
                      <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        Tracking History
                        <span className="ml-auto text-xs font-normal text-gray-400">
                          {order.tracking_history.length} events
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-4">
                      <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                        {order.tracking_history.map((track, idx) => (
                          <div key={track.id} className="flex gap-3">
                            <div className="flex flex-col items-center pt-1">
                              <div
                                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                  idx === 0 ? "bg-blue-500" : "bg-gray-300"
                                }`}
                              />
                              {idx < order.tracking_history!.length - 1 && (
                                <div className="w-px flex-1 bg-gray-200 mt-1" />
                              )}
                            </div>
                            <div className="pb-3 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs py-0">
                                  {track.status.replace(/_/g, " ")}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {formatDate(track.created_at)}
                                </span>
                              </div>
                              {track.remarks && (
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                  {track.remarks}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!order && !searchError && !isSearching && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
              <ClipboardEdit className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Search for an Order
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Enter an order number above to load order details and make manual updates for walk-in or exception cases.
            </p>
          </div>
        )}
    </div>
  );
}
