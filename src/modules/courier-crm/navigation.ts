import {
  Activity,
  BarChart3,
  Bell,
  ClipboardList,
  LayoutDashboard,
  Mail,
  Receipt,
  Route,
  Settings,
  Users,
} from "lucide-react";
import type { NavigationGroup } from "@/components/shared/crm/navigationTypes";

export const courierNavigation: NavigationGroup[] = [
  {
    title: "Core",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        to: "/courier/dashboard",
      },
    ],
  },
  {
    title: "Logistics",
    items: [
      {
        label: "Orders",
        icon: ClipboardList,
        requiredPermission: "can_manage_orders",
        children: [
          { label: "Order List", to: "/courier/orders" },
          { label: "Create Order", to: "/courier/orders/create" },
        ],
      },
      {
        label: "Shipments",
        icon: Route,
        requiredPermission: "can_manage_shippings",
        children: [
          { label: "Shipment List", to: "/courier/shipments" },
          { label: "Create Shipment", to: "/courier/shipments/create" },
        ],
      },
      {
        label: "Status Management",
        icon: Activity,
        to: "/courier/status-management",
        requiredPermission: "can_manage_orders",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Workforce",
        icon: Users,
        children: [
          {
            label: "Rider Orders",
            to: "/courier/management/rider-orders",
            requiredPermission: "can_manage_riders",
          },
          {
            label: "Staff & Riders",
            to: "/courier/management/staff-riders",
            requiredPermission: "can_manage_riders",
          },
        ],
      },
      {
        label: "Settings",
        icon: Settings,
        to: "/courier/settings",
        requiredPermission: "can_manage_settings",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Online Requests",
        icon: Bell,
        to: "/courier/order-requests",
        requiredPermission: "can_manage_orders",
      },
      {
        label: "Invitations",
        icon: Mail,
        to: "/courier/invitations",
        requiredPermission: "can_manage_invitations",
      },
      {
        label: "Billing",
        icon: Receipt,
        to: "/courier/billing",
      },
      {
        label: "Analytics",
        icon: BarChart3,
        children: [
          { label: "Orders", to: "/courier/analytics/orders" },
          { label: "Revenue", to: "/courier/analytics/revenue" },
          { label: "Shipments", to: "/courier/analytics/shipments" },
        ],
      },
    ],
  },
];
