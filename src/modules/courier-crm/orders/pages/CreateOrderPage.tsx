import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CreateOrderForm from "@/modules/courier-crm/orders/components/CreateOrderForm";
import { Button } from "@/components/ui/button";
import OrdersHeader from "@/modules/courier-crm/orders/components/OrdersHeader";

export default function CreateOrderPage() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/courier/orders" className="inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <OrdersHeader
        title="Create Order"
        subtitle="Quick order entry for counter and phone bookings"
        showCreate={false}
      />

      <div className="mt-4">
        <CreateOrderForm onSuccess={() => navigate("/courier/orders")} />
      </div>
    </div>
  );
}
