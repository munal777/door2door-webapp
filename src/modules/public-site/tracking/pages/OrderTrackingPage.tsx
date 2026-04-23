import React from "react";
import { Package } from "lucide-react";
import { OrderTrackingSearch } from "@/modules/courier-crm/shipments/components/OrderTrackingSearch";
import Navbar from "@/components/shared/Navbar";

export const OrderTrackingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-blue-600 rounded-full">
              <Package size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Order Tracking
          </h1>
          <p className="text-gray-600 text-lg">
            Enter your order number to track your delivery in real-time
          </p>
        </div>

        {/* Tracking Component */}
        <OrderTrackingSearch />

        {/* Info Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              How to Track Your Order
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Find Your Order Number
                </h3>
                <p className="text-sm text-gray-600">
                  Your order number is on your receipt or confirmation email
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Enter Order Number
                </h3>
                <p className="text-sm text-gray-600">
                  Type it in the search box above and click "Track"
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  View Real-Time Updates
                </h3>
                <p className="text-sm text-gray-600">
                  See the complete journey of your package with live updates
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
