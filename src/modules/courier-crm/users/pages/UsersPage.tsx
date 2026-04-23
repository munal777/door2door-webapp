import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { riderService } from "@/services/riderService";
import { staffService } from "@/services/staffService";
import type { CourierRider } from "@/types/rider";
import type { CourierStaffSummary } from "@/types/staff";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Bike, Loader2, ShieldCheck, UserRound, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function UsersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [riders, setRiders] = useState<CourierRider[]>([]);
  const [staffMembers, setStaffMembers] = useState<CourierStaffSummary[]>([]);

  const isAdmin = user?.role === "admin";

  const activeStaffCount = useMemo(
    () => staffMembers.filter((staff) => staff.is_active).length,
    [staffMembers],
  );

  const activeRidersCount = useMemo(
    () =>
      riders.filter((rider) => rider.operational_status === "active").length,
    [riders],
  );

  const availableRiderCount = useMemo(
    () =>
      riders.filter((rider) => rider.availability_status === "available")
        .length,
    [riders],
  );

  const loadData = async () => {
    setLoading(true);

    try {
      const [riderList, staffList] = await Promise.all([
        riderService.getRiders(),
        staffService.getStaffList(),
      ]);
      setRiders(riderList);
      setStaffMembers(staffList);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load management data",
        description:
          error instanceof Error
            ? error.message
            : "Could not load staff and riders",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAvailabilityBadge = (status: string) => {
    if (status === "available") {
      return (
        <Badge className="bg-emerald-100 text-emerald-700">Available</Badge>
      );
    }
    if (status === "busy") {
      return <Badge className="bg-amber-100 text-amber-700">Busy</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getOperationalBadge = (status: string) => {
    if (status === "active") {
      return <Badge className="bg-blue-100 text-blue-700">Active</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Staff & Riders</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Unified management directory for courier operations teams and
            riders.
          </p>
        </div>
        <Button onClick={() => navigate("/courier/management/rider-orders")}>
          Rider Orders
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardDescription>Total Staff</CardDescription>
            <CardTitle className="text-2xl">{staffMembers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardDescription>Active Staff</CardDescription>
            <CardTitle className="text-2xl">{activeStaffCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardDescription>Total Riders</CardDescription>
            <CardTitle className="text-2xl">{riders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardDescription>Available Riders</CardDescription>
            <CardTitle className="text-2xl">{availableRiderCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff" className="gap-2">
            <Users className="h-4 w-4" />
            Staff Members
          </TabsTrigger>
          <TabsTrigger value="riders" className="gap-2">
            <Bike className="h-4 w-4" />
            Riders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5" />
                Operations Team
              </CardTitle>
              <CardDescription>
                Staff roles, access levels, and permission visibility across
                modules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-10 flex items-center justify-center text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading staff...
                </div>
              ) : staffMembers.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  No staff members found.
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Key Access</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffMembers.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell>
                            <div className="font-medium">{staff.full_name}</div>
                            <p className="text-xs text-muted-foreground">
                              {staff.email}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                staff.role === "admin" ? "default" : "secondary"
                              }
                            >
                              {staff.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {staff.is_active ? (
                              <Badge className="bg-emerald-100 text-emerald-700">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {staff.permissions.can_manage_orders && (
                                <Badge variant="outline">Orders</Badge>
                              )}
                              {staff.permissions.can_manage_shippings && (
                                <Badge variant="outline">Shipments</Badge>
                              )}
                              {staff.permissions.can_manage_riders && (
                                <Badge variant="outline">Riders</Badge>
                              )}
                              {staff.permissions.can_manage_invitations && (
                                <Badge variant="outline">Invitations</Badge>
                              )}
                              {staff.permissions.can_manage_settings && (
                                <Badge variant="outline">Settings</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/courier/management/staff/${staff.id}`,
                                )
                              }
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="riders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bike className="h-5 w-5" />
                Rider Pool
              </CardTitle>
              <CardDescription>
                Rider availability and operational coverage across your fleet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-10 flex items-center justify-center text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading riders...
                </div>
              ) : riders.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  No riders available.
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rider</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Operational</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riders.map((rider) => (
                        <TableRow key={rider.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <UserRound className="h-4 w-4 text-muted-foreground" />
                              {rider.full_name}
                            </div>
                          </TableCell>
                          <TableCell>{rider.phone_number}</TableCell>
                          <TableCell>
                            {rider.vehicle_type} • {rider.vehicle_number}
                          </TableCell>
                          <TableCell>
                            {getOperationalBadge(rider.operational_status)}
                          </TableCell>
                          <TableCell>
                            {getAvailabilityBadge(rider.availability_status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/courier/management/riders/${rider.id}`,
                                )
                              }
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Management Summary</CardTitle>
          <CardDescription>
            {isAdmin
              ? "You can open any staff profile to update role and permissions dynamically."
              : "Role and permission updates are available to courier admins."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Active riders: {activeRidersCount} • Active staff: {activeStaffCount}
        </CardContent>
      </Card>
    </div>
  );
}
