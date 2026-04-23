import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  MapPin,
  Package,
  Clock,
  User,
  Ban,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { bucketService } from "@/services/bucketService";
import type { TransportBucket } from "@/types/bucket";
import { colors } from "@/constants/theme";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ShippingBatchDetailPage: React.FC = () => {
  const { batchNumber } = useParams<{ batchNumber: string }>();
  const navigate = useNavigate();

  const [batch, setBatch] = useState<TransportBucket | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    loadBatchDetails();
  }, [batchNumber]);

  const loadBatchDetails = async () => {
    if (!batchNumber) return;
    setLoading(true);
    try {
      const data = await bucketService.getBucketDetail(batchNumber);
      setBatch(data);
    } catch (error) {
      console.error("Failed to load batch details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrders = () => {
    if (!batch) return;
    const destinations = batch.stops?.map((s) => s.city).join(",") || "";
    navigate(
      `/courier/orders/select?batch=${batch.bucket_number}&origin=${batch.origin_city}&destinations=${destinations}`,
    );
  };

  const handleCloseBatch = async () => {
    if (!batchNumber || !batch || batch.closed_at) return;

    setIsClosing(true);
    try {
      await bucketService.closeBucket(batchNumber);
      setShowCloseDialog(false);
      loadBatchDetails();
    } catch (error) {
      alert("Failed to close batch");
    } finally {
      setIsClosing(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "3rem",
          textAlign: "center",
          color: colors.mutedForeground,
        }}
      >
        Loading batch details...
      </div>
    );
  }

  if (!batch) {
    return (
      <div
        style={{
          padding: "3rem",
          textAlign: "center",
          color: colors.mutedForeground,
        }}
      >
        Batch not found
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: colors.background,
          borderBottom: `1px solid ${colors.border}`,
          padding: "1.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <button
              onClick={() => navigate("/courier/batches")}
              style={{
                padding: "0.5rem",
                border: "none",
                background: "none",
                cursor: "pointer",
                color: colors.mutedForeground,
              }}
            >
              <ArrowLeft size={24} />
            </button>
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: colors.text,
                  fontFamily: "monospace",
                }}
              >
                {batch.bucket_number}
              </h1>
              <p
                style={{
                  margin: "0.25rem 0 0 0",
                  fontSize: "0.875rem",
                  color: colors.mutedForeground,
                }}
              >
                {batch.origin_city}, {batch.origin_state} →{" "}
                {batch.stops?.[batch.stops.length - 1]?.city || "N/A"}
                {batch.stops?.[batch.stops.length - 1]?.state &&
                  `, ${batch.stops[batch.stops.length - 1].state}`}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={handleAddOrders}
                disabled={!!batch.closed_at}
                style={{
                  padding: "0.625rem 1.25rem",
                  backgroundColor: batch.closed_at
                    ? colors.muted
                    : colors.primary,
                  color: batch.closed_at
                    ? colors.mutedForeground
                    : colors.primaryForeground,
                  border: "none",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: batch.closed_at ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Plus size={18} />
                Add Orders
              </button>
              {!batch.closed_at && (
                <button
                  onClick={() => setShowCloseDialog(true)}
                  style={{
                    padding: "0.625rem 1.25rem",
                    backgroundColor: colors.background,
                    color: colors.destructive,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "border-color 0.2s, background-color 0.2s",
                  }}
                >
                  <Ban size={18} />
                  Close Batch
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{ maxWidth: "1400px", margin: "2rem auto", padding: "0 2rem" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "350px 1fr",
            gap: "1.5rem",
          }}
        >
          {/* Left Column - Batch Info */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* Status Card */}
            <div
              style={{
                backgroundColor: colors.background,
                borderRadius: "0.75rem",
                padding: "1.5rem",
                border: `1px solid ${colors.border}`,
              }}
            >
              <h3
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: colors.mutedForeground,
                  textTransform: "uppercase",
                }}
              >
                Status
              </h3>
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  backgroundColor: batch.closed_at
                    ? colors.mutedForeground + "20"
                    : colors.successLight,
                  color: batch.closed_at
                    ? colors.mutedForeground
                    : colors.success,
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                {batch.closed_at ? "Closed" : "Open"}
              </div>
            </div>

            {/* Route Card */}
            <div
              style={{
                backgroundColor: colors.background,
                borderRadius: "0.75rem",
                padding: "1.5rem",
                border: `1px solid ${colors.border}`,
              }}
            >
              <h3
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: colors.mutedForeground,
                  textTransform: "uppercase",
                }}
              >
                Route
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <MapPin size={16} color={colors.primary} />
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: colors.mutedForeground,
                      }}
                    >
                      Origin
                    </div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: colors.text,
                      }}
                    >
                      {batch.origin_city}, {batch.origin_state}
                    </div>
                  </div>
                </div>
                {batch.stops && batch.stops.length > 0 && (
                  <div
                    style={{
                      paddingLeft: "2rem",
                      borderLeft: `2px dashed ${colors.border}`,
                    }}
                  >
                    {batch.stops.map((stop, idx) => (
                      <div key={stop.id} style={{ marginBottom: "0.75rem" }}>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: colors.mutedForeground,
                          }}
                        >
                          Stop {idx + 1}
                        </div>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: colors.text,
                          }}
                        >
                          {stop.city}, {stop.state}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div
              style={{
                backgroundColor: colors.background,
                borderRadius: "0.75rem",
                padding: "1.5rem",
                border: `1px solid ${colors.border}`,
              }}
            >
              <h3
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: colors.mutedForeground,
                  textTransform: "uppercase",
                }}
              >
                Information
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <Clock size={16} color={colors.mutedForeground} />
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: colors.mutedForeground,
                      }}
                    >
                      Created
                    </div>
                    <div style={{ fontSize: "0.875rem", color: colors.text }}>
                      {formatDateTime(batch.created_at)}
                    </div>
                  </div>
                </div>
                {batch.created_by_name && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <User size={16} color={colors.mutedForeground} />
                    <div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: colors.mutedForeground,
                        }}
                      >
                        Created By
                      </div>
                      <div style={{ fontSize: "0.875rem", color: colors.text }}>
                        {batch.created_by_name}
                      </div>
                    </div>
                  </div>
                )}
                {batch.closed_at && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <Lock size={16} color={colors.mutedForeground} />
                    <div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: colors.mutedForeground,
                        }}
                      >
                        Closed
                      </div>
                      <div style={{ fontSize: "0.875rem", color: colors.text }}>
                        {formatDateTime(batch.closed_at)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Orders */}
          <div
            style={{
              backgroundColor: colors.background,
              borderRadius: "0.75rem",
              border: `1px solid ${colors.border}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1.5rem",
                borderBottom: `1px solid ${colors.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: colors.text,
                }}
              >
                Orders ({batch.order_count || 0})
              </h3>
            </div>

            {/* Orders List */}
            {!batch.orders || batch.orders.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <Package
                  size={48}
                  color={colors.mutedForeground}
                  style={{ margin: "0 auto 1rem" }}
                />
                <p
                  style={{
                    color: colors.mutedForeground,
                    margin: 0,
                    fontSize: "0.875rem",
                  }}
                >
                  No orders in this batch yet
                </p>
                {!batch.closed_at && (
                  <button
                    onClick={handleAddOrders}
                    style={{
                      marginTop: "1rem",
                      padding: "0.5rem 1rem",
                      backgroundColor: colors.primary,
                      color: colors.primaryForeground,
                      border: "none",
                      borderRadius: "0.375rem",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Add Orders
                  </button>
                )}
              </div>
            ) : (
              <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                {batch.orders.map((order, idx) => (
                  <div
                    key={order.id}
                    style={{
                      padding: "1rem 1.5rem",
                      borderBottom:
                        idx < batch.orders!.length - 1
                          ? `1px solid ${colors.border}`
                          : "none",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr auto",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: colors.mutedForeground,
                        }}
                      >
                        Order Number
                      </div>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: colors.text,
                          fontFamily: "monospace",
                        }}
                      >
                        {order.order_number}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: colors.mutedForeground,
                        }}
                      >
                        Receiver
                      </div>
                      <div style={{ fontSize: "0.875rem", color: colors.text }}>
                        {order.receiver_name}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: colors.mutedForeground,
                        }}
                      >
                        Destination
                      </div>
                      <div style={{ fontSize: "0.875rem", color: colors.text }}>
                        {order.receiver_city}
                      </div>
                    </div>
                    <div>
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.375rem",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          backgroundColor:
                            order.package_type === "document"
                              ? colors.infoLight
                              : colors.warningLight,
                          color:
                            order.package_type === "document"
                              ? colors.info
                              : colors.warning,
                        }}
                      >
                        {order.package_type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close Batch Confirmation Dialog */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-lg font-semibold">
                  Close Shipping Batch?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="mt-3 text-sm text-gray-600">
              Are you sure you want to close batch{" "}
              <span className="font-mono font-semibold text-gray-900">
                {batch?.bucket_number}
              </span>
              ? This action cannot be undone.
              <div className="mt-3 rounded-md bg-amber-50 p-3 border border-amber-200">
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> Once closed, you will not be able to:
                </p>
                <ul className="mt-2 space-y-1 text-xs text-amber-700">
                  <li>• Add new orders to this batch</li>
                  <li>• Remove orders from this batch</li>
                  <li>• Modify batch details</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isClosing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseBatch}
              disabled={isClosing}
              className="bg-primary hover:bg-primary/90 focus:ring-primary"
            >
              {isClosing ? "Closing..." : "Yes, Close Batch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
