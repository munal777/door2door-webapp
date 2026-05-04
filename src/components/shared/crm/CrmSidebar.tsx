import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { User } from "@/types/auth";
import BrandLogo from "@/components/shared/BrandLogo";
import type {
  NavigationGroup,
  NavigationItem,
} from "@/components/shared/crm/navigationTypes";

interface CrmSidebarProps {
  title: string;
  groups: NavigationGroup[];
  user: User | null;
  onLogout: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

function getInitials(user: User | null) {
  if (!user) {
    return "NA";
  }

  const first = user.first_name?.charAt(0) ?? "";
  const last = user.last_name?.charAt(0) ?? "";
  const initials = `${first}${last}`.trim();

  return initials || "NA";
}

function formatRole(role: User["user_type"] | undefined) {
  if (!role) {
    return "User";
  }

  return role.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function hasItemAccess(user: User | null, item: NavigationItem) {
  if (!item.requiredRole && !item.requiredPermission) {
    return true;
  }

  if (!user || user.user_type !== "courier_staff") {
    return false;
  }

  const isAdmin = user.role === "admin";

  if (item.requiredRole && user.role !== item.requiredRole) {
    return false;
  }

  if (!item.requiredPermission) {
    return true;
  }

  if (isAdmin) {
    return true;
  }

  return Boolean(user.permissions?.[item.requiredPermission]);
}

function isItemActive(pathname: string, item: NavigationItem) {
  if (item.to) {
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
  }

  if (item.children?.length) {
    return item.children.some(
      (child) => pathname === child.to || pathname.startsWith(`${child.to}/`),
    );
  }

  return false;
}

export default function CrmSidebar({
  groups,
  user,
  onLogout,
  collapsed,
  onToggle,
}: CrmSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const fullName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
    : "Team Member";
  const isAdminPortal =
    user?.user_type === "admin" || user?.user_type === "superadmin";
  const courierName =
    !isAdminPortal && fullName !== "Team Member" ? fullName : null;
  const roleLabel = formatRole(user?.user_type);

  const visibleGroups = useMemo(() => {
    return groups
      .map((group) => ({
        ...group,
        items: group.items
          .map((item) => {
            if (item.children?.length) {
              const visibleChildren = item.children.filter((child) =>
                hasItemAccess(user, {
                  ...item,
                  to: child.to,
                  requiredRole: child.requiredRole,
                  requiredPermission: child.requiredPermission,
                  children: undefined,
                }),
              );

              if (!visibleChildren.length && !hasItemAccess(user, item)) {
                return null;
              }

              return {
                ...item,
                children: visibleChildren,
              };
            }

            return hasItemAccess(user, item) ? item : null;
          })
          .filter((item): item is NavigationItem => item !== null),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, user]);

  const initialExpanded = useMemo(() => {
    const expanded = new Set<string>();

    visibleGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children?.length && isItemActive(location.pathname, item)) {
          expanded.add(item.label);
        }
      });
    });

    return expanded;
  }, [visibleGroups, location.pathname]);

  const [expandedItems, setExpandedItems] =
    useState<Set<string>>(initialExpanded);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.children?.length) {
      if (collapsed) {
        navigate(item.children[0].to);
        return;
      }
      toggleExpanded(item.label);
      return;
    }

    if (item.to) {
      navigate(item.to);
    }
  };

  return (
    <aside
      className={cn(
        "relative hidden shrink-0 self-stretch flex-col overflow-visible border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 lg:flex min-h-full",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div
        className={cn(
          "border-b border-sidebar-border px-3 py-4",
          collapsed ? "flex justify-center" : "px-4",
        )}
      >
        <div
          className={cn(
            "flex w-full flex-col gap-1.5",
            collapsed ? "items-center justify-center" : "items-start",
          )}
        >
          <BrandLogo className={collapsed ? "h-8 w-8" : "h-10"} />
          {!collapsed && (
            <div className="min-w-0 w-full overflow-hidden">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {courierName}
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-14 z-20 hidden h-7 w-7 items-center justify-center rounded-full border border-sidebar-border bg-card text-muted-foreground shadow-sm transition hover:text-foreground lg:inline-flex"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <div className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {visibleGroups.map((group) => (
          <section key={group.title} className="space-y-2">
            {!collapsed && (
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {group.title}
              </p>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isItemActive(location.pathname, item);
                const hasChildren = Boolean(item.children?.length);
                const opened = expandedItems.has(item.label);
                const Icon = item.icon;

                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center px-2",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                      {!collapsed && hasChildren && (
                        <ChevronDown
                          className={cn(
                            "ml-auto h-4 w-4 shrink-0 transition-transform",
                            opened && "rotate-180",
                          )}
                        />
                      )}
                    </button>

                    {!collapsed && hasChildren && opened && (
                      <div className="mt-1 space-y-1 pl-9 pr-1">
                        {item.children?.map((child) => {
                          const childActive =
                            location.pathname === child.to ||
                            (location.pathname.startsWith(`${child.to}/`) &&
                              !item.children?.some(
                                (c) =>
                                  c !== child &&
                                  location.pathname.startsWith(c.to),
                              ));

                          return (
                            <button
                              type="button"
                              key={child.to}
                              onClick={() => navigate(child.to)}
                              className={cn(
                                "w-full rounded-lg px-2 py-2 text-left text-xs font-medium transition",
                                childActive
                                  ? "bg-accent text-accent-foreground"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                              )}
                            >
                              {child.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="border-t border-sidebar-border p-3">
        {collapsed ? (
          <div className="rounded-xl border border-sidebar-border bg-card/60 p-2">
            <p className="truncate text-center text-[10px] font-semibold text-sidebar-foreground">
              {getInitials(user)}
            </p>
            <button
              type="button"
              onClick={onLogout}
              className="mt-2 w-full rounded-lg border border-sidebar-border px-1 py-1 text-[10px] text-sidebar-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              aria-label="Logout"
            >
              Out
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-sidebar-border bg-card/60 p-3">
            <div className="min-w-0 space-y-0.5">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {fullName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {roleLabel}
              </p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="mt-2 w-full rounded-lg border border-sidebar-border px-3 py-2 text-sm font-medium text-sidebar-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
