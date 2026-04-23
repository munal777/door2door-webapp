import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Search, Package, MapPin } from "lucide-react";
import { bucketService } from "@/services/bucketService";
import type { TransportBucket, BucketFilters } from "@/types/bucket";
import { colors } from "@/constants/theme";
import { CreateShippingBatchModal } from "@/modules/courier-crm/shipments/components/CreateShippingBatchModal";

export const ShippingBatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [batches, setBatches] = useState<TransportBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">(
    "all",
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [openedViaRoute, setOpenedViaRoute] = useState(false);

  const isCreateRoute = location.pathname === "/courier/shipments/create";

  useEffect(() => {
    loadBatches();
  }, [statusFilter]);

  useEffect(() => {
    if (isCreateRoute) {
      setOpenedViaRoute(true);
      setShowCreateModal(true);
      return;
    }

    if (openedViaRoute) {
      setShowCreateModal(false);
      setOpenedViaRoute(false);
    }
  }, [isCreateRoute, openedViaRoute]);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const filters: BucketFilters = {};
      if (statusFilter !== "all") {
        filters.status = statusFilter as "open" | "closed";
      }
      const data = await bucketService.getBuckets(filters);
      setBatches(data);
    } catch (error) {
      console.error("Failed to load batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter((batch) => {
    const query = searchQuery.toLowerCase();
    const destinationCity = batch.stops?.[batch.stops.length - 1]?.city || "";
    const destinationState = batch.stops?.[batch.stops.length - 1]?.state || "";
    return (
      batch.bucket_number.toLowerCase().includes(query) ||
      batch.origin_city.toLowerCase().includes(query) ||
      batch.origin_state.toLowerCase().includes(query) ||
      destinationCity.toLowerCase().includes(query) ||
      destinationState.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCreateSuccess = (bucketNumber: string) => {
    loadBatches();
    navigate(`/courier/batches/${bucketNumber}`);
  };

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
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: colors.text,
                }}
              >
                Shipping Batches
              </h1>
              <p
                style={{
                  margin: "0.25rem 0 0 0",
                  fontSize: "0.875rem",
                  color: colors.mutedForeground,
                }}
              >
                Manage and track delivery batches
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: "0.625rem 1.25rem",
                backgroundColor: colors.primary,
                color: colors.primaryForeground,
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Plus size={18} />
              Create Batch
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search
                size={20}
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: colors.mutedForeground,
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search batches..."
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem 0.625rem 2.5rem",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                  e.target.style.boxShadow = `0 0 0 2px ${colors.primary}22`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{
                padding: "0.625rem 2.5rem 0.625rem 0.75rem",
                border: `1px solid ${colors.border}`,
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                cursor: "pointer",
                backgroundColor: colors.background,
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary}22`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batches Table */}
      <div
        style={{ maxWidth: "1400px", margin: "2rem auto", padding: "0 2rem" }}
      >
        <div
          style={{
            backgroundColor: colors.background,
            borderRadius: "0.75rem",
            overflow: "hidden",
            border: `1px solid ${colors.border}`,
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "200px 1fr 1fr 100px 120px 100px",
              gap: "1rem",
              padding: "0.75rem 1rem",
              backgroundColor: colors.tableHeader,
              borderBottom: `1px solid ${colors.border}`,
              fontSize: "0.75rem",
              fontWeight: 600,
              color: colors.mutedForeground,
              textTransform: "uppercase",
            }}
          >
            <div>Batch Number</div>
            <div>Route</div>
            <div>Created</div>
            <div>Orders</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                color: colors.mutedForeground,
              }}
            >
              Loading batches...
            </div>
          ) : filteredBatches.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <Package
                size={48}
                color={colors.mutedForeground}
                style={{ margin: "0 auto 1rem" }}
              />
              <p style={{ color: colors.mutedForeground, margin: 0 }}>
                {searchQuery || statusFilter !== "all"
                  ? "No batches found"
                  : "No batches yet. Create your first batch to get started."}
              </p>
            </div>
          ) : (
            filteredBatches.map((batch) => (
              <div
                key={batch.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px 1fr 1fr 100px 120px 100px",
                  gap: "1rem",
                  padding: "1rem",
                  borderBottom: `1px solid ${colors.border}`,
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                }}
                onClick={() =>
                  navigate(`/courier/batches/${batch.bucket_number}`)
                }
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.muted)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {/* Batch Number */}
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: colors.primary,
                    fontFamily: "monospace",
                  }}
                >
                  {batch.bucket_number}
                </div>

                {/* Route */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <MapPin size={16} color={colors.mutedForeground} />
                  <span style={{ fontSize: "0.875rem", color: colors.text }}>
                    {batch.origin_city}, {batch.origin_state} →{" "}
                    {batch.stops?.[batch.stops.length - 1]?.city || "N/A"}
                    {batch.stops?.[batch.stops.length - 1]?.state &&
                      `, ${batch.stops[batch.stops.length - 1].state}`}
                  </span>
                </div>

                {/* Created */}
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: colors.mutedForeground,
                  }}
                >
                  {formatDate(batch.created_at)}
                </div>

                {/* Orders Count */}
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: colors.text,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                  }}
                >
                  <Package size={14} color={colors.mutedForeground} />
                  {batch.order_count || 0}
                </div>

                {/* Status */}
                <div>
                  {batch.closed_at ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        padding: "0.25rem 0.625rem",
                        borderRadius: "0.375rem",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        backgroundColor: colors.mutedForeground + "20",
                        color: colors.mutedForeground,
                      }}
                    >
                      Closed
                    </span>
                  ) : (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        padding: "0.25rem 0.625rem",
                        borderRadius: "0.375rem",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        backgroundColor: colors.successLight,
                        color: colors.success,
                      }}
                    >
                      Open
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/courier/batches/${batch.bucket_number}`);
                    }}
                    style={{
                      padding: "0.375rem 0.75rem",
                      border: `1px solid ${colors.border}`,
                      borderRadius: "0.375rem",
                      backgroundColor: colors.background,
                      color: colors.text,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Batch Modal */}
      <CreateShippingBatchModal
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open && isCreateRoute) {
            setOpenedViaRoute(false);
            navigate("/courier/shipments", { replace: true });
          }
        }}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};
