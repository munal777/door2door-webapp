import type { LucideIcon } from "lucide-react";
import type { CourierStaffPermissions } from "@/types/auth";

export interface NavigationItem {
  label: string;
  icon: LucideIcon;
  to?: string;
  requiredRole?: "admin" | "operations";
  requiredPermission?: keyof CourierStaffPermissions;
  children?: Array<{
    label: string;
    to: string;
    requiredRole?: "admin" | "operations";
    requiredPermission?: keyof CourierStaffPermissions;
  }>;
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}
