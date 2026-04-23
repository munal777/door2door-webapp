import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "@/services/adminService";
import type { CourierRider } from "@/types/admin";
import { useAuth } from "@/hooks/useAuth";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Filter,
  Loader2,
  UserCheck,
  Building2,
  Phone,
  Car,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_FORM_SELECT_TRIGGER_CLASS } from "@/modules/platform-admin/pricing/components/formStyles";

export default function CourierRiders() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const [riders, setRiders] = useState<CourierRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      navigate("/admin/login");
      return;
    }

    if (
      !user ||
      (user.user_type !== "admin" && user.user_type !== "superadmin")
    ) {
      logout();
      navigate("/admin/login");
      return;
    }

    loadRiders();
  }, [navigate, statusFilter, isAuthenticated, user, logout]);

  const loadRiders = async () => {
    try {
      setLoading(true);
      const filters = statusFilter === "all" ? {} : { status: statusFilter };
      const response = await adminService.getCourierRiders(filters);

      if (response.IsSuccess) {
        setRiders(response.Result);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.ErrorMessage || "Failed to load riders",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.ErrorMessage || "Failed to load riders",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: any; className: string }
    > = {
      under_review: {
        label: "Under Review",
        variant: "secondary",
        className:
          "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200",
      },
      pending_documents: {
        label: "Pending Documents",
        variant: "outline",
        className:
          "bg-orange-50 text-orange-600 hover:bg-orange-50 border-orange-300",
      },
      active: {
        label: "Active",
        variant: "default",
        className:
          "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
      },
      suspended: {
        label: "Suspended",
        variant: "destructive",
        className: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
      },
      inactive: {
        label: "Inactive",
        variant: "secondary",
        className:
          "bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200",
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      variant: "secondary",
      className:
        "bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200",
    };

    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Courier Riders</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage and review courier rider registrations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardDescription className="text-xs sm:text-sm">
              Total Riders
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl">
              {riders.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardDescription className="text-xs sm:text-sm">
              Active Riders
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl">
              {riders.filter((r) => r.operational_status === "active").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardDescription className="text-xs sm:text-sm">
              Under Review
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl">
              {
                riders.filter((r) => r.operational_status === "under_review")
                  .length
              }
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">All Riders</CardTitle>
              <CardDescription className="text-sm">
                View and manage courier rider accounts
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  className={`w-full sm:w-45 md:w-50 ${ADMIN_FORM_SELECT_TRIGGER_CLASS}`}
                >
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="pending_documents">
                    Pending Documents
                  </SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : riders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No riders found</p>
              <p className="text-sm text-muted-foreground">
                {statusFilter === "all"
                  ? "There are no rider registrations yet."
                  : "No riders match the selected filter."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rider Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riders.map((rider) => (
                      <TableRow key={rider.id}>
                        <TableCell className="font-medium">
                          {rider.user_details.full_name}
                        </TableCell>
                        <TableCell className="max-w-50 truncate">
                          {rider.user_details.email}
                        </TableCell>
                        <TableCell>{rider.user_details.phone_number}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="truncate">
                              {rider.company_details.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {rider.vehicle_type}
                            </div>
                            <div className="text-muted-foreground">
                              {rider.vehicle_number}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(rider.operational_status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/admin/riders/${rider.id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-4">
                {riders.map((rider) => (
                  <Card key={rider.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header with name and status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">
                              {rider.user_details.full_name}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {rider.user_details.email}
                            </p>
                          </div>
                          <div className="shrink-0">
                            {getStatusBadge(rider.operational_status)}
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {rider.user_details.phone_number}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {rider.company_details.name}
                            </span>
                          </div>
                        </div>

                        {/* Vehicle Info */}
                        <div className="text-sm bg-slate-50 rounded p-2">
                          <div className="flex items-center gap-2">
                            <Car className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-medium">
                              {rider.vehicle_type}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground truncate">
                              {rider.vehicle_number}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => navigate(`/admin/riders/${rider.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
