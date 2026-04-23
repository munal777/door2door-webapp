import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, Check, Printer } from "lucide-react";
import { orderService } from "@/services/orderService";
import { bucketService } from "@/services/bucketService";
import { Pagination } from "@/components/ui/pagination";
import { useBulkLabelPrinter } from "@/modules/courier-crm/orders/components/BulkShippingLabels";
import type { OrderListItem, PaginationInfo } from "@/types/order";
import { colors } from "@/constants/theme";

export const SelectOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const batchNumber = searchParams.get("batch");
  const originCity = searchParams.get("origin");
  const destinations = searchParams.get("destinations")?.split(",") || [];

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    page_size: 20,
    total_count: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { printBulkLabels } = useBulkLabelPrinter();

  useEffect(() => {
    loadOrders();
  }, [currentPage, pageSize]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrders({
        status: "confirmed",
        page: currentPage,
        size: pageSize,
      });

      // Filter orders matching the route
      const filtered = response.results.filter((order) => {
        const matchesOrigin =
          order.sender_city.toLowerCase() === originCity?.toLowerCase();
        const matchesDestination = destinations.some(
          (city) => city.toLowerCase() === order.receiver_city.toLowerCase(),
        );
        return matchesOrigin && matchesDestination;
      });

      setOrders(filtered);

      const paginationInfo = orderService.getPaginationInfo(
        response,
        currentPage,
        pageSize,
      );
      setPagination(paginationInfo);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (orderNumber: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderNumber)) {
      newSelected.delete(orderNumber);
    } else {
      newSelected.add(orderNumber);
    }
    setSelectedOrders(newSelected);
  };

  const handleSubmit = async () => {
    if (!batchNumber || selectedOrders.size === 0) return;

    setSubmitting(true);
    try {
      await bucketService.addOrdersToBucket(batchNumber, {
        order_numbers: Array.from(selectedOrders),
      });
      navigate(`/courier/batches/${batchNumber}`);
    } catch (error) {
      console.error("Failed to add orders:", error);
      alert("Failed to add orders to batch");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintLabels = () => {
    if (selectedOrders.size === 0) return;

    const selectedOrdersData = orders.filter((order) =>
      selectedOrders.has(order.order_number),
    );

    printBulkLabels(selectedOrdersData);
  };

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(query) ||
      order.sender_name.toLowerCase().includes(query) ||
      order.sender_city.toLowerCase().includes(query) ||
      order.receiver_city.toLowerCase().includes(query)
    );
  });

  return (
    <div
      style={{
        backgroundColor: "#FAFAFA",
        minHeight: "100vh",
        paddingBottom: "2rem",
      }}
    >
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
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={() => navigate(`/courier/batches/${batchNumber}`)}
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
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    color: colors.text,
                  }}
                >
                  Select Orders for Batch
                </h1>
                <p
                  style={{
                    margin: "0.25rem 0 0 0",
                    fontSize: "0.875rem",
                    color: colors.mutedForeground,
                  }}
                >
                  {batchNumber} • {originCity} → {destinations.join(", ")}
                </p>
              </div>
            </div>

            {/* Action Buttons in Header */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {selectedOrders.size > 0 && (
                <button
                  onClick={handlePrintLabels}
                  style={{
                    padding: "0.625rem 1.25rem",
                    border: `1px solid ${colors.primary}`,
                    borderRadius: "0.5rem",
                    backgroundColor: colors.background,
                    color: colors.primary,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background;
                  }}
                >
                  <Printer size={16} />
                  Print Labels ({selectedOrders.size})
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={submitting || selectedOrders.size === 0}
                style={{
                  padding: "0.625rem 1.5rem",
                  border: "none",
                  borderRadius: "0.5rem",
                  backgroundColor:
                    selectedOrders.size === 0 ? colors.muted : colors.primary,
                  color: colors.primaryForeground,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: selectedOrders.size === 0 ? "not-allowed" : "pointer",
                  opacity: selectedOrders.size === 0 ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (selectedOrders.size > 0 && !submitting) {
                    e.currentTarget.style.opacity = "0.9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedOrders.size > 0) {
                    e.currentTarget.style.opacity = "1";
                  }
                }}
              >
                {submitting
                  ? "Adding..."
                  : `Add ${selectedOrders.size} Order${selectedOrders.size !== 1 ? "s" : ""} to Batch`}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
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
                placeholder="Search by order number, origin, or destination..."
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
            <div
              style={{
                padding: "0.625rem 1.25rem",
                backgroundColor:
                  selectedOrders.size > 0 ? colors.primary : colors.secondary,
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                color:
                  selectedOrders.size > 0
                    ? colors.primaryForeground
                    : colors.mutedForeground,
                minWidth: "120px",
                textAlign: "center",
                transition: "all 0.2s",
              }}
            >
              {selectedOrders.size} Selected
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
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
              gridTemplateColumns: "48px 1fr 1fr 1fr 120px 120px 100px",
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
            <div></div>
            <div>Order Number</div>
            <div>Origin / Dispatch</div>
            <div>Destination</div>
            <div>Type</div>
            <div>Service</div>
            <div>Weight</div>
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
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                color: colors.mutedForeground,
              }}
            >
              No orders found for this route
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isSelected = selectedOrders.has(order.order_number);
              return (
                <div
                  key={order.order_number}
                  onClick={() => toggleOrder(order.order_number)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "48px 1fr 1fr 1fr 120px 120px 100px",
                    gap: "1rem",
                    padding: "1rem",
                    borderBottom: `1px solid ${colors.border}`,
                    cursor: "pointer",
                    backgroundColor: isSelected
                      ? colors.tableRowHover
                      : "transparent",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.backgroundColor = colors.muted;
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {/* Checkbox */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "4px",
                        border: `2px solid ${isSelected ? colors.primary : colors.border}`,
                        backgroundColor: isSelected
                          ? colors.primary
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isSelected && <Check size={14} color="white" />}
                    </div>
                  </div>

                  {/* Order Number */}
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

                  {/* Origin / Dispatch */}
                  <div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: colors.text,
                      }}
                    >
                      {order.sender_name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: colors.mutedForeground,
                      }}
                    >
                      {order.sender_city}
                    </div>
                  </div>

                  {/* Destination */}
                  <div style={{ fontSize: "0.875rem", color: colors.text }}>
                    {order.receiver_city}
                  </div>

                  {/* Type */}
                  <div>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.375rem",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        backgroundColor:
                          order.package_type_display.toLowerCase() ===
                          "document"
                            ? colors.infoLight
                            : colors.warningLight,
                        color:
                          order.package_type_display.toLowerCase() ===
                          "document"
                            ? colors.info
                            : colors.warning,
                      }}
                    >
                      {order.package_type_display}
                    </span>
                  </div>

                  {/* Service */}
                  <div>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.375rem",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        backgroundColor: order.service_type_display
                          .toLowerCase()
                          .includes("express")
                          ? colors.destructiveLight
                          : colors.successLight,
                        color: order.service_type_display
                          .toLowerCase()
                          .includes("express")
                          ? colors.destructive
                          : colors.success,
                      }}
                    >
                      {order.service_type_display}
                    </span>
                  </div>

                  {/* Weight */}
                  <div style={{ fontSize: "0.875rem", color: colors.text }}>
                    {order.weight} kg
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination */}
          {!loading && filteredOrders.length > 0 && (
            <div style={{ borderTop: `1px solid ${colors.border}` }}>
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                pageSize={pagination.page_size}
                totalCount={pagination.total_count}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                disabled={loading}
                showPageSizeSelector={true}
                showInfo={true}
                pageSizeOptions={[10, 20, 50, 100]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
