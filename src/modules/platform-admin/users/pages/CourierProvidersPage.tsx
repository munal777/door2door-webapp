import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "@/services/adminService";
import type { CourierProvider } from "@/types/admin";
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
  Building2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_FORM_SELECT_TRIGGER_CLASS } from "@/modules/platform-admin/pricing/components/formStyles";

export default function CourierProviders() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const [providers, setProviders] = useState<CourierProvider[]>([]);
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

    loadProviders();
  }, [navigate, statusFilter, isAuthenticated, user, logout]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const filterStatus = statusFilter === "all" ? undefined : statusFilter;
      const response = await adminService.getCourierProviders(filterStatus);

      if (response.IsSuccess) {
        setProviders(response.Result);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.ErrorMessage || "Failed to load providers",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.ErrorMessage || "Failed to load providers",
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Courier Providers</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage and review courier provider applications
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className={`w-full sm:w-45 ${ADMIN_FORM_SELECT_TRIGGER_CLASS}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">
                Total Providers
              </CardDescription>
              <Building2 className="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              {providers.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-xs text-muted-foreground">
              All registered providers
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">
                Under Review
              </CardDescription>
              <Clock className="h-4 w-4 text-yellow-500" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              {
                providers.filter((p) => p.operational_status === "under_review")
                  .length
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">
                Active
              </CardDescription>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              {
                providers.filter((p) => p.operational_status === "active")
                  .length
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-xs text-muted-foreground">
              Operational providers
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">
                Suspended
              </CardDescription>
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              {
                providers.filter((p) => p.operational_status === "suspended")
                  .length
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-xs text-muted-foreground">
              Rejected or disabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Providers Table */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">All Providers</CardTitle>
          <CardDescription className="text-sm">
            Click on a provider to view details and take action
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                Loading providers...
              </p>
            </div>
          ) : providers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No providers found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                {statusFilter !== "all"
                  ? "Try changing the filter to see more providers"
                  : "No courier providers have registered yet"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">
                        Provider Name
                      </TableHead>
                      <TableHead className="font-semibold">Location</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">
                        Registered
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.map((provider) => (
                      <TableRow
                        key={provider.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{provider.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {provider.city}, {provider.state}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(provider.operational_status)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(provider.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/admin/providers/${provider.id}`)
                            }
                            className="hover:bg-primary/10"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {providers.map((provider) => (
                  <Card
                    key={provider.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/admin/providers/${provider.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {provider.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {provider.city}, {provider.state}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(provider.operational_status)}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {new Date(provider.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
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
