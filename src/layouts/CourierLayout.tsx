import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import CRMLayout from "@/layouts/CRMLayout";
import { courierNavigation } from "@/modules/courier-crm/navigation";

export default function CourierLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    // Check if user has courier privileges
    if (!user || user.user_type !== "courier_staff") {
      logout();
      navigate("/");
      return;
    }
  }, [navigate, isAuthenticated, user, logout]);

  // Don't render until auth check is complete
  if (!isAuthenticated || !user || user.user_type !== "courier_staff") {
    return null;
  }

  return (
    <CRMLayout
      portalTitle="Courier CRM"
      groups={courierNavigation}
      user={user}
      onLogout={logout}
    >
      <Outlet />
    </CRMLayout>
  );
}
