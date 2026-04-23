import type { RouteObject } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/modules/public-site/home/pages/HomePage";
import NotFound from "@/modules/public-site/errors/pages/NotFoundPage";
import { OrderTrackingPage } from "@/modules/public-site/tracking/pages/OrderTrackingPage";
import { QRTrackingPage } from "@/modules/public-site/tracking/pages/QRTrackingPage";
import About from "@/modules/public-site/about/pages/AboutPage";
import Services from "@/modules/public-site/services/pages/ServicesPage";

import SystemAdminLogin from "@/modules/platform-admin/auth/pages/LoginPage";
import CourierLogin from "@/modules/courier-crm/auth/pages/LoginPage";
import CourierRegistration from "@/modules/courier-crm/auth/pages/RegistrationPage";
import StaffInvitationRegistrationPage from "@/modules/courier-crm/auth/pages/StaffInvitationRegistrationPage";

function GuestGuard() {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Wait for auth to initialize
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

  if (isAuthenticated && user) {
    const dashboardPath =
      user.user_type === "admin" || user.user_type === "superadmin"
        ? "/admin/dashboard"
        : "/courier/dashboard";
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
}

export const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/services",
    element: <Services />,
  },
  {
    path: "/track",
    element: <OrderTrackingPage />,
  },
  {
    path: "/qr-track/:orderNumber",
    element: <QRTrackingPage />,
  },
  {
    element: <GuestGuard />,
    children: [
      {
        path: "/register-courier",
        element: <CourierRegistration />,
      },
      {
        path: "/courier/login",
        element: <CourierLogin />,
      },
      {
        path: "/staff/register",
        element: <StaffInvitationRegistrationPage />,
      },
      {
        path: "/admin/login",
        element: <SystemAdminLogin />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
