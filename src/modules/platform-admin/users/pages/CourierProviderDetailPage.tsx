import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminService } from "@/services/adminService";
import type { CourierProvider } from "@/types/admin";
import { authService } from "@/services/authService";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_FORM_TEXTAREA_CLASS } from "@/modules/platform-admin/pricing/components/formStyles";

export default function CourierProviderDetail() {
  const navigate = useNavigate();
  const { providerId } = useParams();
  const { toast } = useToast();

  const [provider, setProvider] = useState<CourierProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/admin/login");
      return;
    }

    loadProviderDetail();
  }, [navigate, providerId]);

  const loadProviderDetail = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCourierProviderDetail(
        Number(providerId),
      );

      if (response.IsSuccess) {
        setProvider(response.Result);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            response.ErrorMessage || "Failed to load provider details",
        });
        navigate("/admin/providers");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.ErrorMessage || "Failed to load provider details",
      });
      navigate("/admin/providers");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!provider) return;

    try {
      setProcessing(true);
      const response = await adminService.approveRejectProvider(provider.id, {
        action: "approve",
      });

      if (response.IsSuccess) {
        toast({
          title: "Success",
          description:
            "Provider approved successfully. Credentials sent via email.",
        });
        loadProviderDetail();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.ErrorMessage || "Failed to approve provider",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.ErrorMessage || "Failed to approve provider",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!provider || !rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a rejection reason",
      });
      return;
    }

    try {
      setProcessing(true);
      const response = await adminService.approveRejectProvider(provider.id, {
        action: "reject",
        rejection_reason: rejectionReason,
      });

      if (response.IsSuccess) {
        toast({
          title: "Success",
          description: "Provider rejected. Notification sent.",
        });
        setShowRejectDialog(false);
        setRejectionReason("");
        loadProviderDetail();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.ErrorMessage || "Failed to reject provider",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.ErrorMessage || "Failed to reject provider",
      });
    } finally {
      setProcessing(false);
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

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!provider) {
    return null;
  }

  const canApproveReject =
    provider.operational_status === "under_review" ||
    provider.operational_status === "pending_documents";

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/providers")}
            className="mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">
              {provider.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Provider Details & Verification
            </p>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          {getStatusBadge(provider.operational_status)}
        </div>
      </div>

      {/* Action Buttons */}
      {canApproveReject && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1 text-sm sm:text-base">
                  Action Required
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Review the provider information and take appropriate action
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button
                  className="cursor-pointer w-full sm:w-auto"
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={processing}
                >
                  Reject
                </Button>
                <Button
                  className="cursor-pointer w-full sm:w-auto"
                  onClick={handleApprove}
                  disabled={processing}
                >
                  {processing ?? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Information */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 sm:p-6 pt-0">
          <div className="space-y-3 md:space-y-4">
            <div>
              <Label className="text-muted-foreground text-xs sm:text-sm">
                Company Name
              </Label>
              <p className="font-medium text-sm sm:text-base wrap-break-word">
                {provider.name}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <p className="font-medium text-sm sm:text-base break-all">
                {provider.company_email}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <p className="font-medium text-sm sm:text-base">
                {provider.company_phone}
              </p>
            </div>
          </div>
          <div className="space-y-3 md:space-y-4">
            <div>
              <Label className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
                <MapPin className="h-4 w-4" />
                Address
              </Label>
              <p className="font-medium text-sm sm:text-base wrap-break-word">
                {provider.address_line}
                <br />
                {provider.city}, {provider.state} {provider.postal_code}
                <br />
                {provider.country}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
                <Users className="h-4 w-4" />
                Riders
              </Label>
              <p className="font-medium text-sm sm:text-base">
                {provider.total_riders} / {provider.max_riders} riders
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="h-5 w-5" />
            Submitted Documents
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Verify all documents before approving the provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 p-4 sm:p-6 pt-0">
          {provider.documents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">
              No documents uploaded yet
            </p>
          ) : (
            provider.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3"
              >
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  {getDocumentStatusIcon(doc.status)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base">
                      {doc.document_type}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {doc.document_number}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                    </p>
                    {doc.rejection_reason && (
                      <p className="text-xs sm:text-sm text-red-600 mt-1 wrap-break-word">
                        Reason: {doc.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
                {doc.uploaded_file && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto text-xs sm:text-sm"
                    onClick={() => window.open(doc.uploaded_file!, "_blank")}
                  >
                    View Document
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Provider Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this provider. This will be
              sent to them via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className={ADMIN_FORM_TEXTAREA_CLASS}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
