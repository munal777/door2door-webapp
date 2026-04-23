import { useState } from "react";
import OrderList from "@/modules/courier-crm/orders/components/OrderList";
import OrderDetail from "@/modules/courier-crm/orders/components/OrderDetail";
import OrdersHeader from "@/modules/courier-crm/orders/components/OrdersHeader";

export default function OrderListPage() {
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const handleViewOrder = (orderNumber: string) => {
    setSelectedOrderNumber(orderNumber);
    setDetailOpen(true);
  };

  return (
    <div>
      <OrdersHeader
        title="Orders"
        subtitle="Track and manage all courier orders from one dashboard"
      />

      <OrderList onViewOrder={handleViewOrder} />

      {selectedOrderNumber && (
        <OrderDetail
          orderNumber={selectedOrderNumber}
          open={detailOpen}
          onClose={() => {
            setDetailOpen(false);
            setSelectedOrderNumber(null);
          }}
        />
      )}
    </div>
  );
}
