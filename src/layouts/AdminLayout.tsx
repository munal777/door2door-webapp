import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import CRMLayout from "@/layouts/CRMLayout";
import { adminNavigation } from "@/modules/platform-admin/navigation";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    // Check if user has admin privileges
    if (
      !user ||
      (user.user_type !== "admin" && user.user_type !== "superadmin")
    ) {
      logout();
      navigate("/");
      return;
    }
  }, [navigate, isAuthenticated, user, logout]);

  return (
    <CRMLayout
      portalTitle="Platform Admin"
      groups={adminNavigation}
      user={user}
      onLogout={logout}
    >
      <Outlet />
    </CRMLayout>
  );
}
