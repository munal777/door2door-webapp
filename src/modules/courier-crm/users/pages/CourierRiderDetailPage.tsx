import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { riderService } from "@/services/riderService";
import type { RiderDetail } from "@/types/rider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  Bike,
  Loader2,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

export default function CourierRiderDetailPage() {
  const navigate = useNavigate();
  const { riderId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [rider, setRider] = useState<RiderDetail | null>(null);
  const [operationalStatus, setOperationalStatus] = useState<string>("active");
  const [availabilityStatus, setAvailabilityStatus] =
    useState<string>("available");

  const canManageRiders =
    user?.role === "admin" || Boolean(user?.permissions?.can_manage_riders);

  useEffect(() => {
    const loadRiderDetail = async () => {
      if (!riderId) {
        navigate("/courier/management/staff-riders");
        return;
      }

      try {
        setLoading(true);
        const detail = await riderService.getRiderDetail(Number(riderId));
        setRider(detail);
        setOperationalStatus(detail.operational_status);
        setAvailabilityStatus(detail.availability_status);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to load rider details",
          description:
            error instanceof Error ? error.message : "Unable to fetch rider",
        });
        navigate("/courier/management/staff-riders");
      } finally {
        setLoading(false);
      }
    };

    loadRiderDetail();
  }, [riderId, navigate, toast]);

  const handleUpdateStatus = async () => {
    if (!rider || !canManageRiders) {
      return;
    }

    setSavingStatus(true);
    try {
      const updated = await riderService.updateRiderStatus(rider.id, {
        operational_status: operationalStatus,
        availability_status: availabilityStatus,
      });

      setRider(updated);
      setOperationalStatus(updated.operational_status);
      setAvailabilityStatus(updated.availability_status);

      toast({
        title: "Rider status updated",
        description: `${updated.full_name} status is now ${updated.operational_status} / ${updated.availability_status}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to update rider status",
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setSavingStatus(false);
    }
  };

  const formatOrderStatus = (status: string) =>
    status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!rider) {
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
            <h1 className="text-2xl sm:text-3xl font-bold">Rider Details</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Rider ID: #{rider.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getOperationalBadge(rider.operational_status)}
          {getAvailabilityBadge(rider.availability_status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserRound className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>
              Primary rider identity and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="font-medium mt-1">{rider.full_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Company</Label>
                <p className="font-medium mt-1">{rider.company_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {rider.email}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <p className="font-medium mt-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {rider.phone_number}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bike className="h-5 w-5" />
              Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <Label className="text-muted-foreground">Type</Label>
              <p className="font-medium mt-1">{rider.vehicle_type}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Number</Label>
              <p className="font-medium mt-1">{rider.vehicle_number}</p>
            </div>
            {rider.vehicle_model && (
              <div>
                <Label className="text-muted-foreground">Model</Label>
                <p className="font-medium mt-1">{rider.vehicle_model}</p>
              </div>
            )}
            {rider.vehicle_color && (
              <div>
                <Label className="text-muted-foreground">Color</Label>
                <p className="font-medium mt-1">{rider.vehicle_color}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            Last Known Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rider.current_latitude && rider.current_longitude ? (
            <p className="text-sm">
              {rider.current_latitude}, {rider.current_longitude}
              {rider.last_location_update
                ? ` • Updated ${rider.last_location_update}`
                : ""}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Location data not available.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rider Status Controls</CardTitle>
          <CardDescription>
            Update operational and live availability status for assignment
            workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label>Operational Status</Label>
            <Select
              value={operationalStatus}
              onValueChange={setOperationalStatus}
              disabled={!canManageRiders}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select operational status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="pending_documents">
                  Pending Documents
                </SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Availability</Label>
            <Select
              value={availabilityStatus}
              onValueChange={setAvailabilityStatus}
              disabled={!canManageRiders}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleUpdateStatus}
            disabled={!canManageRiders || savingStatus}
          >
            {savingStatus ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Save Status
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assigned Orders</CardTitle>
          <CardDescription>
            Active assignments currently allocated to this rider.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rider.assigned_orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active assignments.
            </p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left">
                    <th className="px-3 py-2 font-medium">Order</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Assigned At</th>
                    <th className="px-3 py-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {rider.assigned_orders.map((assignment) => (
                    <tr
                      key={assignment.assignment_id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-3 py-2 font-medium">
                        {assignment.order_number}
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline">
                          {formatOrderStatus(assignment.order_status)}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        {new Date(assignment.assigned_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{assignment.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
