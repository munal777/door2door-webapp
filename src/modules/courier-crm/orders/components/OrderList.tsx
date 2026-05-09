import { useState, useEffect } from "react";
import { orderService } from "@/services/orderService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import {
  Loader2,
  Eye,
  Search,
  X,
  Package,
  Filter,
  CreditCard,
  ListFilter,
} from "lucide-react";
import type {
  OrderListItem,
  OrderFilters,
  PaginationInfo,
} from "@/types/order";

interface OrderListProps {
  onViewOrder?: (orderNumber: string) => void;
}

const statusColors: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  picked_up: "bg-purple-100 text-purple-800 border-purple-200",
  in_transit: "bg-amber-100 text-amber-800 border-amber-200",
  delivery_assigned: "bg-orange-50 text-orange-800 border-orange-200",
  out_for_delivery: "bg-orange-100 text-orange-800 border-orange-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
};

export default function OrderList({ onViewOrder }: OrderListProps) {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    page_size: 10,
    total_count: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  });

  const [filters, setFilters] = useState<OrderFilters>({
    search: "",
    status: "",
    payment_status: "",
    page: 1,
    size: 10,
  });

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrders(filters);
      setOrders(response.results);

      const paginationInfo = orderService.getPaginationInfo(
        response,
        filters.page || 1,
        filters.size || 10,
      );
      setPagination(paginationInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters.status, filters.payment_status, filters.page, filters.size]);

  const handleSearch = () => {
    // Reset to page 1 when searching
    setFilters({ ...filters, page: 1 });
    fetchOrders();
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handlePageSizeChange = (size: number) => {
    setFilters({ ...filters, size, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      payment_status: "",
      page: 1,
      size: 10,
    });
  };

  const hasActiveFilters =
    filters.search || filters.status || filters.payment_status;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
    }).format(amount);
  };

  const getStatusColor = (status_display: string): string => {
    const statusKey = status_display.toLowerCase().replace(/\s+/g, "_");
    return (
      statusColors[statusKey] || "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getPaymentStatusColor = (payment_status_display: string): string => {
    const statusKey = payment_status_display.toLowerCase().replace(/\s+/g, "_");
    return (
      paymentStatusColors[statusKey] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load orders
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={fetchOrders}
            variant="outline"
            className="border-gray-300"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-700">
              Search & Filter Orders
            </h3>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-6">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Search Orders
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Order number, sender, receiver, phone..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 h-10 border-gray-300 focus-visible:ring-blue-600 focus-visible:border-blue-600"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <div className="relative">
                <ListFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      status: value === "all" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger className="h-10 pl-10 border-gray-300 focus:ring-blue-600 focus:border-blue-600">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Confirmed
                      </div>
                    </SelectItem>
                    <SelectItem value="picked_up">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        Picked Up
                      </div>
                    </SelectItem>
                    <SelectItem value="in_transit">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        In Transit
                      </div>
                    </SelectItem>
                    <SelectItem value="out_for_delivery">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        Out for Delivery
                      </div>
                    </SelectItem>
                    <SelectItem value="delivery_assigned">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                        Delivery Assigned
                      </div>
                    </SelectItem>
                    <SelectItem value="delivered">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        Delivered
                      </div>
                    </SelectItem>
                    <SelectItem value="cancelled">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Cancelled
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Filter */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                <Select
                  value={filters.payment_status || "all"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      payment_status: value === "all" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger className="h-10 pl-10 border-gray-300 focus:ring-blue-600 focus:border-blue-600">
                    <SelectValue placeholder="All Payments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="paid">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Paid
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Active Filters & Actions */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-gray-600">
                    Active Filters:
                  </span>
                  {filters.search && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-0.5"
                    >
                      Search: "{filters.search}"
                    </Badge>
                  )}
                  {filters.status && (
                    <Badge
                      variant="secondary"
                      className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2 py-0.5"
                    >
                      Status: {formatStatus(filters.status)}
                    </Badge>
                  )}
                  {filters.payment_status && (
                    <Badge
                      variant="secondary"
                      className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5"
                    >
                      Payment: {formatStatus(filters.payment_status)}
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600 text-sm">Loading orders...</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or create a new order
            </p>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-gray-300"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Order #
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Service
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Sender
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Receiver
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Payment
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900 text-sm">
                      {order.order_number}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {order.service_type_display}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {order.sender_name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {order.sender_phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {order.receiver_name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {order.receiver_phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${getStatusColor(order.status_display)}`}
                      >
                        {order.status_display}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${getPaymentStatusColor(order.payment_status_display)}`}
                      >
                        {order.payment_status_display}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 text-sm">
                      {formatCurrency(order.total_price)}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          onViewOrder && onViewOrder(order.order_number)
                        }
                        className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            pageSize={pagination.page_size}
            totalCount={pagination.total_count}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            disabled={isLoading}
            showPageSizeSelector={true}
            showInfo={true}
          />
        </div>
      )}
    </div>
  );
}
