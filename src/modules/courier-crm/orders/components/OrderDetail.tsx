import { useState, useEffect } from "react";
import { orderService } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Package,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
} from "lucide-react";
import type { OrderDetail as OrderDetailType } from "@/types/order";
import { OrderQRCode } from "./OrderQRCode";

interface OrderDetailProps {
  orderNumber: string;
  open: boolean;
  onClose: () => void;
}

export default function OrderDetail({
  orderNumber,
  open,
  onClose,
}: OrderDetailProps) {
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && orderNumber) {
      fetchOrderDetail();
    }
  }, [open, orderNumber]);

  const fetchOrderDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrderDetail(orderNumber);
      setOrder(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch order details",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePayment = async (status: "pending" | "paid") => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const updatedOrder = await orderService.updatePaymentStatus(
        orderNumber,
        status,
      );
      setOrder(updatedOrder);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to update payment status",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
    }).format(amount);
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Complete information about order {orderNumber}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchOrderDetail} className="mt-4">
              Retry
            </Button>
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Order Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order Number</p>
                    <p className="font-semibold">{order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service Type</p>
                    <Badge variant="outline">
                      {order.service_type_display}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Status</p>
                    <Badge>{order.status_display}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <Badge>{order.payment_status_display}</Badge>
                  </div>
                </div>

                {/* QR Code Section */}
                <Separator className="my-4" />
                <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">
                      Tracking QR Code
                    </p>
                    <p className="text-sm text-gray-600">
                      Share this QR code with your customer for easy tracking
                    </p>
                  </div>
                  <OrderQRCode orderNumber={order.order_number} />
                </div>
              </CardContent>
            </Card>

            {/* Sender & Receiver */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Sender Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-1 text-gray-500" />
                    <div>
                      <p className="font-medium">{order.sender_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-1 text-gray-500" />
                    <p>{order.sender_phone}</p>
                  </div>
                  {order.sender_email && (
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 mt-1 text-gray-500" />
                      <p>{order.sender_email}</p>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                    <div>
                      <p>{order.sender_address}</p>
                      <p className="text-sm text-gray-500">
                        {order.sender_city}, {order.sender_state}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Receiver Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-1 text-gray-500" />
                    <div>
                      <p className="font-medium">{order.receiver_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-1 text-gray-500" />
                    <p>{order.receiver_phone}</p>
                  </div>
                  {order.receiver_email && (
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 mt-1 text-gray-500" />
                      <p>{order.receiver_email}</p>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                    <div>
                      <p>{order.receiver_address}</p>
                      <p className="text-sm text-gray-500">
                        {order.receiver_city}, {order.receiver_state}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Package & Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Package Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Package Type</p>
                    <Badge variant="outline">
                      {order.package_type_display}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="font-medium">{order.weight} kg</p>
                  </div>
                  {(order.length || order.width || order.height) && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Dimensions (L×W×H)
                      </p>
                      <p className="font-medium">
                        {order.length || "?"} × {order.width || "?"} ×{" "}
                        {order.height || "?"} cm
                      </p>
                    </div>
                  )}
                  {order.package_description && (
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="font-medium">{order.package_description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <p className="font-semibold">Total Price</p>
                    <p className="font-semibold text-lg">
                      {formatCurrency(order.total_price)}
                    </p>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <p className="text-gray-500">Payment Method</p>
                    <Badge variant="outline">
                      {order.payment_method_display}
                    </Badge>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant={
                        order.payment_status_display === "paid"
                          ? "outline"
                          : "default"
                      }
                      onClick={() => handleUpdatePayment("paid")}
                      disabled={
                        isUpdating ||
                        order.payment_status_display.toLowerCase() === "paid"
                      }
                    >
                      Mark as Paid
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        order.payment_status_display.toLowerCase() === "pending"
                          ? "outline"
                          : "default"
                      }
                      onClick={() => handleUpdatePayment("pending")}
                      disabled={
                        isUpdating ||
                        order.payment_status_display.toLowerCase() === "pending"
                      }
                    >
                      Mark as Pending
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tracking History */}
            {order.tracking_history && order.tracking_history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tracking History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.tracking_history.map((track) => (
                      <div key={track.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <div className="w-0.5 h-full bg-gray-200" />
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2">
                            <Badge className="text-xs">
                              {formatStatus(track.status)}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(track.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{track.remarks}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
