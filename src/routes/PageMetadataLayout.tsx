import { Outlet, matchPath, useLocation } from "react-router-dom";
import { useEffect } from "react";

type RouteTitle = {
  path: string;
  title: string;
};

const APP_NAME = "Door2Door";
const COURIER_SUFFIX = "Door2Door Courier";
const ADMIN_SUFFIX = "Door2Door Admin";

const routeTitles: RouteTitle[] = [
  { path: "/", title: `Home | ${APP_NAME}` },
  { path: "/about", title: `About | ${APP_NAME}` },
  { path: "/services", title: `Services | ${APP_NAME}` },
  { path: "/track", title: `Track Shipment | ${APP_NAME}` },
  { path: "/qr-track/:orderNumber", title: `Track Shipment | ${APP_NAME}` },
  { path: "/register-courier", title: `Courier Registration | ${APP_NAME}` },
  { path: "/staff/register", title: `Staff Registration | ${APP_NAME}` },
  { path: "/courier/login", title: `Courier Login | ${APP_NAME}` },
  { path: "/admin/login", title: `Admin Login | ${APP_NAME}` },

  { path: "/courier", title: `Dashboard | ${COURIER_SUFFIX}` },
  { path: "/courier/dashboard", title: `Dashboard | ${COURIER_SUFFIX}` },
  { path: "/courier/analytics", title: `Analytics | ${COURIER_SUFFIX}` },
  {
    path: "/courier/analytics/orders",
    title: `Order Analytics | ${COURIER_SUFFIX}`,
  },
  {
    path: "/courier/analytics/revenue",
    title: `Revenue Analytics | ${COURIER_SUFFIX}`,
  },
  {
    path: "/courier/analytics/shipments",
    title: `Shipment Analytics | ${COURIER_SUFFIX}`,
  },
  { path: "/courier/orders", title: `Orders | ${COURIER_SUFFIX}` },
  { path: "/courier/orders/create", title: `Create Order | ${COURIER_SUFFIX}` },
  {
    path: "/courier/order-requests",
    title: `Order Requests | ${COURIER_SUFFIX}`,
  },
  { path: "/courier/riders", title: `Riders | ${COURIER_SUFFIX}` },
  {
    path: "/courier/riders/:riderId",
    title: `Rider Details | ${COURIER_SUFFIX}`,
  },
  { path: "/courier/users", title: `Users | ${COURIER_SUFFIX}` },
  {
    path: "/courier/management/staff-riders",
    title: `Staff & Riders | ${COURIER_SUFFIX}`,
  },
  {
    path: "/courier/management/rider-orders",
    title: `Rider Orders | ${COURIER_SUFFIX}`,
  },
  {
    path: "/courier/management/riders/:riderId",
    title: `Rider Details | ${COURIER_SUFFIX}`,
  },
  {
    path: "/courier/management/staff/:staffId",
    title: `Staff Details | ${COURIER_SUFFIX}`,
  },
  { path: "/courier/invitations", title: `Invitations | ${COURIER_SUFFIX}` },
  { path: "/courier/batches", title: `Shipments | ${COURIER_SUFFIX}` },
  {
    path: "/courier/batches/:batchNumber",
    title: `Shipment Details | ${COURIER_SUFFIX}`,
  },
  { path: "/courier/shipments", title: `Shipments | ${COURIER_SUFFIX}` },
  {
    path: "/courier/shipments/create",
    title: `Create Shipment | ${COURIER_SUFFIX}`,
  },
  {
    path: "/courier/shipments/:batchNumber",
    title: `Shipment Details | ${COURIER_SUFFIX}`,
  },
  {
    path: "/courier/shipments/tracking",
    title: `Shipment Analytics | ${COURIER_SUFFIX}`,
  },
  {
    path: "/courier/orders/select",
    title: `Select Orders | ${COURIER_SUFFIX}`,
  },
  { path: "/courier/billing", title: `Billing | ${COURIER_SUFFIX}` },
  { path: "/courier/settings", title: `Settings | ${COURIER_SUFFIX}` },

  { path: "/admin/dashboard", title: `Dashboard | ${ADMIN_SUFFIX}` },
  { path: "/admin/settings", title: `Settings | ${ADMIN_SUFFIX}` },
  { path: "/admin/providers", title: `Courier Providers | ${ADMIN_SUFFIX}` },
  {
    path: "/admin/providers/:providerId",
    title: `Provider Details | ${ADMIN_SUFFIX}`,
  },
  { path: "/admin/riders", title: `Riders | ${ADMIN_SUFFIX}` },
  { path: "/admin/riders/:riderId", title: `Rider Details | ${ADMIN_SUFFIX}` },
  { path: "/admin/pricing", title: `Pricing | ${ADMIN_SUFFIX}` },
  {
    path: "/admin/pricing/weight-slabs/new",
    title: `New Weight Slab | ${ADMIN_SUFFIX}`,
  },
  {
    path: "/admin/pricing/weight-slabs/:id/edit",
    title: `Edit Weight Slab | ${ADMIN_SUFFIX}`,
  },
  {
    path: "/admin/pricing/service-types/new",
    title: `New Service Type | ${ADMIN_SUFFIX}`,
  },
  {
    path: "/admin/pricing/service-types/:id/edit",
    title: `Edit Service Type | ${ADMIN_SUFFIX}`,
  },
  {
    path: "/admin/pricing/locations/new",
    title: `New Location Pricing | ${ADMIN_SUFFIX}`,
  },
  {
    path: "/admin/pricing/locations/:id/edit",
    title: `Edit Location Pricing | ${ADMIN_SUFFIX}`,
  },
];

function getPageTitle(pathname: string): string {
  const match = routeTitles.find((item) =>
    Boolean(matchPath({ path: item.path, end: true }, pathname)),
  );

  if (match) {
    return match.title;
  }

  if (pathname.startsWith("/courier")) {
    return `Courier Portal | ${COURIER_SUFFIX}`;
  }

  if (pathname.startsWith("/admin")) {
    return `Admin Portal | ${ADMIN_SUFFIX}`;
  }

  return `Page Not Found | ${APP_NAME}`;
}

export default function PageMetadataLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = getPageTitle(pathname);
  }, [pathname]);

  return <Outlet />;
}
