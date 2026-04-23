import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

import { staffService } from "@/services/staffService";
import type {
  CourierStaffDetail,
  UpdateCourierStaffAccessPayload,
} from "@/types/staff";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StaffDetailPage() {
  const navigate = useNavigate();
  const { staffId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [staff, setStaff] = useState<CourierStaffDetail | null>(null);

  const [role, setRole] = useState<"admin" | "operations">("operations");
  const [isActive, setIsActive] = useState(true);
  const [canManageOrders, setCanManageOrders] = useState(true);
  const [canManageShippings, setCanManageShippings] = useState(true);
  const [canManageRiders, setCanManageRiders] = useState(false);
  const [canManageInvitations, setCanManageInvitations] = useState(false);
  const [canManageSettings, setCanManageSettings] = useState(false);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const loadStaffDetail = async () => {
      if (!staffId) {
        navigate("/courier/management/staff-riders");
        return;
      }

      try {
        setLoading(true);
        const detail = await staffService.getStaffDetail(Number(staffId));
        setStaff(detail);

        setRole(detail.role);
        setIsActive(detail.is_active);
        setCanManageOrders(detail.permissions.can_manage_orders);
        setCanManageShippings(detail.permissions.can_manage_shippings);
        setCanManageRiders(detail.permissions.can_manage_riders);
        setCanManageInvitations(detail.permissions.can_manage_invitations);
        setCanManageSettings(detail.permissions.can_manage_settings);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to load staff details",
          description:
            error instanceof Error
              ? error.message
              : "Unable to fetch staff profile",
        });
        navigate("/courier/management/staff-riders");
      } finally {
        setLoading(false);
      }
    };

    loadStaffDetail();
  }, [staffId, navigate, toast]);

  const isSelfProfile = useMemo(() => {
    if (!staff || !user) {
      return false;
    }

    return staff.email === user.email;
  }, [staff, user]);

  const handleSave = async () => {
    if (!staff || !isAdmin) {
      return;
    }

    const payload: UpdateCourierStaffAccessPayload = {
      role,
      is_active: isActive,
      can_manage_orders: canManageOrders,
      can_manage_shippings: canManageShippings,
      can_manage_riders: canManageRiders,
      can_manage_invitations: canManageInvitations,
      can_manage_settings: canManageSettings,
    };

    setSaving(true);
    try {
      const updated = await staffService.updateStaffAccess(staff.id, payload);
      setStaff(updated);

      setRole(updated.role);
      setIsActive(updated.is_active);
      setCanManageOrders(updated.permissions.can_manage_orders);
      setCanManageShippings(updated.permissions.can_manage_shippings);
      setCanManageRiders(updated.permissions.can_manage_riders);
      setCanManageInvitations(updated.permissions.can_manage_invitations);
      setCanManageSettings(updated.permissions.can_manage_settings);

      toast({
        title: "Staff access updated",
        description: `${updated.full_name} role and permissions were updated.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update staff access",
        description:
          error instanceof Error
            ? error.message
            : "Could not save staff settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!staff) {
    return null;
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/courier/management/staff-riders")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Staff Details</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Staff ID: #{staff.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={staff.role === "admin" ? "default" : "secondary"}>
            {staff.role}
          </Badge>
          {staff.is_active ? (
            <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
          ) : (
            <Badge variant="outline">Inactive</Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
          <CardDescription>
            Identity and account details for this staff member.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-muted-foreground">Full Name</Label>
            <p className="font-medium mt-1">{staff.full_name}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Email</Label>
            <p className="font-medium mt-1">{staff.email}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Phone</Label>
            <p className="font-medium mt-1">{staff.phone_number || "-"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Joined</Label>
            <p className="font-medium mt-1">
              {new Date(staff.joined_at).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5" />
            Roles & Permissions
          </CardTitle>
          <CardDescription>
            {isAdmin
              ? "Update role and access flags. Changes apply immediately."
              : "You can view permissions, but only courier admins can edit access."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(value: "admin" | "operations") =>
                  setRole(value)
                }
                disabled={!isAdmin || isSelfProfile}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Account Status</Label>
              <div className="rounded-md border p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Active Access</p>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable staff login access
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={!isAdmin || isSelfProfile}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-md border p-3 flex items-center justify-between">
              <Label>Manage Orders</Label>
              <Switch
                checked={canManageOrders}
                onCheckedChange={setCanManageOrders}
                disabled={!isAdmin || role === "admin"}
              />
            </div>
            <div className="rounded-md border p-3 flex items-center justify-between">
              <Label>Manage Shipments</Label>
              <Switch
                checked={canManageShippings}
                onCheckedChange={setCanManageShippings}
                disabled={!isAdmin || role === "admin"}
              />
            </div>
            <div className="rounded-md border p-3 flex items-center justify-between">
              <Label>Manage Riders</Label>
              <Switch
                checked={canManageRiders}
                onCheckedChange={setCanManageRiders}
                disabled={!isAdmin || role === "admin"}
              />
            </div>
            <div className="rounded-md border p-3 flex items-center justify-between">
              <Label>Manage Invitations</Label>
              <Switch
                checked={canManageInvitations}
                onCheckedChange={setCanManageInvitations}
                disabled={!isAdmin || role === "admin"}
              />
            </div>
            <div className="rounded-md border p-3 flex items-center justify-between md:col-span-2">
              <Label>Manage Settings</Label>
              <Switch
                checked={canManageSettings}
                onCheckedChange={setCanManageSettings}
                disabled={!isAdmin || role === "admin"}
              />
            </div>
          </div>

          {isAdmin && (
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving || isSelfProfile}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save Access Changes
              </Button>
            </div>
          )}

          {isSelfProfile && (
            <p className="text-xs text-amber-700">
              For safety, self role updates are disabled on this page.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Accessible Modules</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {staff.accessible_modules.map((module) => (
            <Badge key={module} variant="outline">
              {module}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
