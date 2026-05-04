import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminService } from "@/services/adminService";
import type { CourierRider } from "@/types/admin";
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
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Building2,
  Car,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_FORM_TEXTAREA_CLASS } from "@/modules/platform-admin/pricing/components/formStyles";

export default function CourierRiderDetail() {
  const navigate = useNavigate();
  const { riderId } = useParams();
  const { toast } = useToast();

  const [rider, setRider] = useState<CourierRider | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/admin/login");
      return;
    }

    loadRiderDetail();
  }, [navigate, riderId]);

  const loadRiderDetail = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCourierRiderDetail(
        Number(riderId),
      );

      if (response.IsSuccess) {
        setRider(response.Result);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.ErrorMessage || "Failed to load rider details",
        });
        navigate("/admin/riders");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.ErrorMessage || "Failed to load rider details",
      });
      navigate("/admin/riders");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!rider) return;

    try {
      setProcessing(true);
      const response = await adminService.approveRejectRider(rider.id, {
        action: "approve",
      });

      if (response.IsSuccess) {
        toast({
          title: "Success",
          description: "Rider approved successfully.",
        });
        loadRiderDetail();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.ErrorMessage || "Failed to approve rider",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.ErrorMessage || "Failed to approve rider",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rider || !rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a rejection reason",
      });
      return;
    }

    try {
      setProcessing(true);
      const response = await adminService.approveRejectRider(rider.id, {
        action: "reject",
        rejection_reason: rejectionReason,
      });

      if (response.IsSuccess) {
        toast({
          title: "Success",
          description: "Rider rejected. Notification sent.",
        });
        setShowRejectDialog(false);
        setRejectionReason("");
        loadRiderDetail();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.ErrorMessage || "Failed to reject rider",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.ErrorMessage || "Failed to reject rider",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; icon: any; className: string }
    > = {
      under_review: {
        label: "Under Review",
        icon: Clock,
        className:
          "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200",
      },
      pending_documents: {
        label: "Pending Documents",
        icon: AlertCircle,
        className:
          "bg-orange-50 text-orange-600 hover:bg-orange-50 border-orange-300",
      },
      active: {
        label: "Active",
        icon: CheckCircle,
        className:
          "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
      },
      suspended: {
        label: "Suspended",
        icon: XCircle,
        className: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
      },
      inactive: {
        label: "Inactive",
        icon: XCircle,
        className:
          "bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200",
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      icon: Clock,
      className:
        "bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200",
    };

    const Icon = statusInfo.icon;

    return (
      <Badge className={statusInfo.className}>
        <Icon className="h-3 w-3 mr-1" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getDocumentStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: {
        label: "Pending Review",
        className:
          "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200",
      },
      approved: {
        label: "Approved",
        className:
          "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
      },
      rejected: {
        label: "Rejected",
        className: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className:
        "bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200",
    };

    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!rider) {
    return null;
  }

  const canApproveOrReject =
    rider.operational_status === "under_review" ||
    rider.operational_status === "pending_documents";

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/riders")}
            className="self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
              {rider.user_details.full_name}
            </h1>
          </div>
        </div>
        <div className="self-start sm:self-auto">
          {getStatusBadge(rider.operational_status)}
        </div>
      </div>

      {/* Action Buttons */}
      {canApproveOrReject && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium text-amber-900 text-sm sm:text-base">
                    Action Required
                  </p>
                  <p className="text-xs sm:text-sm text-amber-700">
                    This rider registration requires your review and approval.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={processing}
                  className="border-red-300 text-red-700 hover:bg-red-50 w-full sm:w-auto"
                  size="sm"
                >
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                  className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
                  size="sm"
                >
                  Approve Rider
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs sm:text-sm">
                    Full Name
                  </Label>
                  <p className="font-medium mt-1 text-sm sm:text-base wrap-break-word">
                    {rider.user_details.full_name}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs sm:text-sm">
                    Date of Birth
                  </Label>
                  <p className="font-medium mt-1 text-sm sm:text-base">
                    {rider.date_of_birth}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-muted-foreground text-xs sm:text-sm">
                    Email Address
                  </Label>
                  <p className="font-medium mt-1 flex items-center gap-2 text-sm sm:text-base break-all">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    {rider.user_details.email}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs sm:text-sm">
                    Phone Number
                  </Label>
                  <p className="font-medium mt-1 flex items-center gap-2 text-sm sm:text-base">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    {rider.user_details.phone_number}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs sm:text-sm">
                    Contact Name
                  </Label>
                  <p className="font-medium mt-1 text-sm sm:text-base wrap-break-word">
                    {rider.emergency_contact_name}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs sm:text-sm">
                    Contact Phone
                  </Label>
                  <p className="font-medium mt-1 flex items-center gap-2 text-sm sm:text-base">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    {rider.emergency_contact_phone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label className="text-muted-foreground text-xs sm:text-sm">
                    Company Name
                  </Label>
                  <p className="font-medium mt-1 text-sm sm:text-base wrap-break-word">
                    {rider.company_details.name}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-muted-foreground text-xs sm:text-sm">
                    Company Email
                  </Label>
                  <p className="font-medium mt-1 flex items-center gap-2 text-sm sm:text-base break-all">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    {rider.company_details.company_email}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs sm:text-sm">
                    Company Phone
                  </Label>
                  <p className="font-medium mt-1 flex items-center gap-2 text-sm sm:text-base">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    {rider.company_details.company_phone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs sm:text-sm">
                    Vehicle Type
                  </Label>
                  <p className="font-medium mt-1 text-sm sm:text-base wrap-break-word">
                    {rider.vehicle_type}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs sm:text-sm">
                    Vehicle Number
                  </Label>
                  <p className="font-medium mt-1 text-sm sm:text-base wrap-break-word">
                    {rider.vehicle_number}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs sm:text-sm">
                    Vehicle Model
                  </Label>
                  <p className="font-medium mt-1 text-sm sm:text-base wrap-break-word">
                    {rider.vehicle_model}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs sm:text-sm">
                    Vehicle Color
                  </Label>
                  <p className="font-medium mt-1 text-sm sm:text-base wrap-break-word">
                    {rider.vehicle_color}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Submitted Documents
              </CardTitle>
              <CardDescription>
                Review all documents submitted by the rider
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rider.documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rider.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{doc.document_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.document_number}
                          </p>
                        </div>
                        {getDocumentStatusBadge(doc.status)}
                      </div>

                      {doc.uploaded_file && (
                        <div>
                          <a
                            href={doc.uploaded_file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Document
                          </a>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Uploaded: {doc.uploaded_at}</p>
                        {doc.verified_at && <p>Verified: {doc.verified_at}</p>}
                      </div>

                      {doc.status === "rejected" && doc.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <p className="text-sm font-medium text-red-900">
                            Rejection Reason:
                          </p>
                          <p className="text-sm text-red-700">
                            {doc.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">
                  Operational Status
                </Label>
                <div className="mt-2">
                  {getStatusBadge(rider.operational_status)}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Account Status</Label>
                <div className="mt-2">
                  {rider.user_details.is_active ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-muted-foreground">Registered On</Label>
                <p className="text-sm font-medium mt-1">{rider.created_at}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p className="text-sm font-medium mt-1">{rider.updated_at}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Rider Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this rider registration.
              This will be communicated to the rider.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
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
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              Reject Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
