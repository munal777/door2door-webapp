import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateOrderForm from "@/modules/courier-crm/orders/components/CreateOrderForm";
import OrderList from "@/modules/courier-crm/orders/components/OrderList";
import OrderDetail from "@/modules/courier-crm/orders/components/OrderDetail";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(
    null,
  );
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleViewOrder = (orderNumber: string) => {
    setSelectedOrderNumber(orderNumber);
    setShowDetailDialog(true);
  };

  const handleOrderCreated = () => {
    setActiveTab("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="h-full bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Professional Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Orders</h1>
              <p className="text-gray-500 text-sm">
                Manage and track all your orders
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs with integrated action button */}
          <div className="flex items-center justify-between border-b border-gray-200 mb-6">
            <TabsList className="bg-transparent rounded-none h-auto p-0 space-x-8">
              <TabsTrigger
                value="list"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-600 bg-transparent px-1 pb-3 pt-0 font-medium hover:text-gray-900 transition-colors shadow-none"
              >
                All Orders
              </TabsTrigger>
            </TabsList>
            <Button
              onClick={() => setActiveTab("create")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-9 mb-3"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>

          <TabsContent value="list" className="mt-0">
            <OrderList key={refreshTrigger} onViewOrder={handleViewOrder} />
          </TabsContent>

          <TabsContent value="create" className="mt-0">
            <div className="bg-white rounded-lg border border-gray-200">
              <CreateOrderForm onSuccess={handleOrderCreated} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedOrderNumber && (
        <OrderDetail
          orderNumber={selectedOrderNumber}
          open={showDetailDialog}
          onClose={() => {
            setShowDetailDialog(false);
            setSelectedOrderNumber(null);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
}
