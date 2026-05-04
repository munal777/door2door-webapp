import { useState } from "react";
import { Activity, ClipboardEdit, Route } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderUpdateView from "../views/OrderUpdateView";
import BatchUpdateView from "../views/BatchUpdateView";

export default function StatusManagementPage() {
  const [activeTab, setActiveTab] = useState("order");

  return (
    <div className="min-h-full bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Status Management</h1>
              <p className="text-gray-500 text-sm">
                Unified dashboard to manually update individual orders or bulk shipment batches.
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="order" className="flex items-center gap-2 px-6 py-2">
              <ClipboardEdit className="h-4 w-4" />
              Order Status Update
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center gap-2 px-6 py-2">
              <Route className="h-4 w-4" />
              Shipment Batch Update
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="order" className="mt-0 outline-none animate-in fade-in-50 duration-300">
            <OrderUpdateView />
          </TabsContent>
          
          <TabsContent value="batch" className="mt-0 outline-none animate-in fade-in-50 duration-300">
            <BatchUpdateView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
