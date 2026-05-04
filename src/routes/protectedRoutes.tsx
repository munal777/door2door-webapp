import type { RouteObject } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/layouts/AdminLayout";
import CourierLayout from "@/layouts/CourierLayout";

import AdminDashboard from "@/modules/platform-admin/dashboard/pages/DashboardPage";
import AdminSettings from "@/modules/platform-admin/settings/pages/SettingsPage";
import CourierProviders from "@/modules/platform-admin/users/pages/CourierProvidersPage";
import CourierProviderDetail from "@/modules/platform-admin/users/pages/CourierProviderDetailPage";
import CourierRiders from "@/modules/platform-admin/users/pages/CourierRidersPage";
import CourierRiderDetail from "@/modules/platform-admin/users/pages/CourierRiderDetailPage";
import PricingManagement from "@/modules/platform-admin/pricing/pages/PricingManagementPage";
import WeightSlabForm from "@/modules/platform-admin/pricing/pages/WeightSlabFormPage";
import ServiceTypeForm from "@/modules/platform-admin/pricing/pages/ServiceTypeFormPage";
import LocationPricingForm from "@/modules/platform-admin/pricing/pages/LocationPricingFormPage";

import CourierDashboard from "@/modules/courier-crm/dashboard/pages/DashboardPage";
import OnlineOrderRequestsPage from "@/modules/courier-crm/requests/pages/OnlineOrderRequestsPage";
import CourierRiderDetailPage from "@/modules/courier-crm/users/pages/CourierRiderDetailPage";
import RiderOrdersPage from "@/modules/courier-crm/users/pages/RiderOrdersPage";
import StaffDetailPage from "@/modules/courier-crm/users/pages/StaffDetailPage";
import InvitationsPage from "@/modules/courier-crm/invitations/pages/InvitationsPage";
import { ShippingBatchesPage } from "@/modules/courier-crm/shipments/pages/ShipmentListPage";
import { ShippingBatchDetailPage } from "@/modules/courier-crm/shipments/pages/ShippingBatchDetailPage";
import { SelectOrdersPage } from "@/modules/courier-crm/shipments/pages/SelectOrdersPage";
import BillingPage from "@/modules/courier-crm/billing/pages/BillingPage";
import OrderListPage from "@/modules/courier-crm/orders/pages/OrderListPage";
import CreateOrderPage from "@/modules/courier-crm/orders/pages/CreateOrderPage";
import UsersPage from "@/modules/courier-crm/users/pages/UsersPage";
import SettingsPage from "@/modules/courier-crm/settings/pages/SettingsPage";

import OrderStatsPage from "@/modules/courier-crm/analytics/pages/OrderStatsPage";
import RevenueStatsPage from "@/modules/courier-crm/analytics/pages/RevenueStatsPage";
import ShipmentsStatsPage from "@/modules/courier-crm/analytics/pages/ShipmentsStatsPage";
import StatusManagementPage from "@/modules/courier-crm/status-management/pages/StatusManagementPage";

function ProtectedGuard() {
  const { isAuthenticated, isLoading } = useAuth();

  // Wait for auth to initialize before checking
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/courier/login" replace />
  );
}

export const protectedRoutes: RouteObject[] = [
  {
    element: <ProtectedGuard />,
    children: [
      {
        path: "/courier",
        element: <CourierLayout />,
        children: [
          {
            index: true,
            element: <CourierDashboard />,
          },
          {
            path: "dashboard",
            element: <CourierDashboard />,
          },
          {
            path: "analytics",
            element: <Navigate to="/courier/analytics/orders" replace />,
          },
          {
            path: "analytics/orders",
            element: <OrderStatsPage />,
          },
          {
            path: "analytics/revenue",
            element: <RevenueStatsPage />,
          },
          {
            path: "analytics/shipments",
            element: <ShipmentsStatsPage />,
          },
          {
            path: "orders",
            element: <OrderListPage />,
          },
          {
            path: "orders/create",
            element: <CreateOrderPage />,
          },
          {
            path: "order-requests",
            element: <OnlineOrderRequestsPage />,
          },
          {
            path: "riders",
            element: <Navigate to="/courier/management/staff-riders" replace />,
          },
          {
            path: "riders/:riderId",
            element: <Navigate to="/courier/management/staff-riders" replace />,
          },
          {
            path: "users",
            element: <Navigate to="/courier/management/staff-riders" replace />,
          },
          {
            path: "management/staff-riders",
            element: <UsersPage />,
          },
          {
            path: "management/rider-orders",
            element: <RiderOrdersPage />,
          },
          {
            path: "management/riders/:riderId",
            element: <CourierRiderDetailPage />,
          },
          {
            path: "management/staff/:staffId",
            element: <StaffDetailPage />,
          },
          {
            path: "invitations",
            element: <InvitationsPage />,
          },
          {
            path: "status-management",
            element: <StatusManagementPage />,
          },
          {
            path: "batches",
            element: <ShippingBatchesPage />,
          },
          {
            path: "batches/:batchNumber",
            element: <ShippingBatchDetailPage />,
          },
          {
            path: "shipments",
            element: <ShippingBatchesPage />,
          },

          {
            path: "shipments/:batchNumber",
            element: <ShippingBatchDetailPage />,
          },
          {
            path: "shipments/tracking",
            element: <Navigate to="/courier/analytics/shipments" replace />,
          },
          {
            path: "orders/select",
            element: <SelectOrdersPage />,
          },
          {
            path: "billing",
            element: <BillingPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
        ],
      },
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            path: "dashboard",
            element: <AdminDashboard />,
          },
          {
            path: "settings",
            element: <AdminSettings />,
          },
          {
            path: "providers",
            element: <CourierProviders />,
          },
          {
            path: "providers/:providerId",
            element: <CourierProviderDetail />,
          },
          {
            path: "riders",
            element: <CourierRiders />,
          },
          {
            path: "riders/:riderId",
            element: <CourierRiderDetail />,
          },
          {
            path: "pricing",
            element: <PricingManagement />,
          },
          {
            path: "pricing/weight-slabs/new",
            element: <WeightSlabForm />,
          },
          {
            path: "pricing/weight-slabs/:id/edit",
            element: <WeightSlabForm />,
          },
          {
            path: "pricing/service-types/new",
            element: <ServiceTypeForm />,
          },
          {
            path: "pricing/service-types/:id/edit",
            element: <ServiceTypeForm />,
          },
          {
            path: "pricing/locations/new",
            element: <LocationPricingForm />,
          },
          {
            path: "pricing/locations/:id/edit",
            element: <LocationPricingForm />,
          },
        ],
      },
    ],
  },
];
