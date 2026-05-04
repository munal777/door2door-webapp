import { useState } from "react";
import { orderService } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import type { OrderDetail, OrderUpdateData } from "@/types/order";

interface OrderStatusUpdateFormProps {
  order: OrderDetail;
  onUpdated: (updated: OrderDetail) => void;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-700 border-gray-200" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "pickup_assigned", label: "Pickup Assigned", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { value: "picked_up", label: "Picked Up", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "at_origin_hub", label: "At Origin Hub", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { value: "in_transit", label: "In Transit", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "at_destination_hub", label: "At Destination Hub", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "out_for_delivery", label: "Out for Delivery", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "delivered", label: "Delivered", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "returned", label: "Returned", color: "bg-rose-100 text-rose-700 border-rose-200" },
] as const;

const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "paid", label: "Paid", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "refunded", label: "Refunded", color: "bg-slate-100 text-slate-700 border-slate-200" },
] as const;

function currentStatusValue(display: string): string {
  return display.toLowerCase().replace(/\s+/g, "_");
}

export default function OrderStatusUpdateForm({ order, onUpdated }: OrderStatusUpdateFormProps) {
  const currentStatus = currentStatusValue(order.status_display);
  const currentPaymentStatus = currentStatusValue(order.payment_status_display);

  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges =
    status !== currentStatus || paymentStatus !== currentPaymentStatus;

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const payload: OrderUpdateData = {};
    if (status !== currentStatus) payload.status = status as OrderUpdateData["status"];
    if (paymentStatus !== currentPaymentStatus) payload.payment_status = paymentStatus as OrderUpdateData["payment_status"];
    if (remarks.trim()) payload.remarks = remarks.trim();

    try {
      const updated = await orderService.updateOrder(order.order_number, payload);
      onUpdated(updated);
      setSuccess(true);
      setRemarks("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStatus(currentStatus);
    setPaymentStatus(currentPaymentStatus);
    setRemarks("");
    setError(null);
  };

  const currentStatusOption = STATUS_OPTIONS.find((o) => o.value === currentStatus);
  const currentPaymentOption = PAYMENT_STATUS_OPTIONS.find((o) => o.value === currentPaymentStatus);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Status Update</h3>
          <p className="text-xs text-gray-500 mt-0.5">Update order and payment status</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-gray-500">Current:</span>
          {currentStatusOption && (
            <Badge variant="outline" className={`text-xs ${currentStatusOption.color}`}>
              {currentStatusOption.label}
            </Badge>
          )}
          {currentPaymentOption && (
            <Badge variant="outline" className={`text-xs ${currentPaymentOption.color}`}>
              {currentPaymentOption.label}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Order Status */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Order Status
          </label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger
              id="crm-order-status"
              className="h-10 border-gray-300 focus:ring-blue-600 focus:border-blue-600"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        opt.value === "delivered"
                          ? "bg-emerald-500"
                          : opt.value === "cancelled"
                          ? "bg-red-500"
                          : opt.value === "in_transit"
                          ? "bg-amber-500"
                          : opt.value === "confirmed"
                          ? "bg-blue-500"
                          : opt.value === "out_for_delivery"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                      }`}
                    />
                    {opt.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Status */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Payment Status
          </label>
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger
              id="crm-payment-status"
              className="h-10 border-gray-300 focus:ring-blue-600 focus:border-blue-600"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        opt.value === "paid"
                          ? "bg-green-500"
                          : opt.value === "failed"
                          ? "bg-red-500"
                          : opt.value === "refunded"
                          ? "bg-slate-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    {opt.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Optional Remarks */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Remarks <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <Textarea
            id="crm-status-remarks"
            placeholder="Add a note for this status change (e.g. customer confirmed delivery, exception reason)..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            className="resize-none border-gray-300 text-sm focus-visible:ring-blue-600 focus-visible:border-blue-600"
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
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            Status updated successfully!
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <Button
            id="crm-status-reset"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isLoading || !hasChanges}
            className="text-gray-500 hover:text-gray-700 h-9"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>
          <Button
            id="crm-status-save"
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
