import { Building2, LayoutDashboard, Package, Settings, UserCheck } from "lucide-react";
import type { NavigationGroup } from "@/components/shared/crm/navigationTypes";

export const adminNavigation: NavigationGroup[] = [
  {
    title: "Core",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        to: "/admin/dashboard",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Courier Providers",
        icon: Building2,
        to: "/admin/providers",
      },
      {
        label: "Courier Riders",
        icon: UserCheck,
        to: "/admin/riders",
      },
      {
        label: "Pricing",
        icon: Package,
        to: "/admin/pricing",
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        label: "Settings",
        icon: Settings,
        to: "/admin/settings",
      },
    ],
  },
];
