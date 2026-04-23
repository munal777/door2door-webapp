import { useState, useEffect } from "react";
import { invitationService } from "@/services/invitationService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Mail } from "lucide-react";
import type {
  InvitationRole,
  InvitationStatus,
  ProviderInvitation,
  InvitationFilters,
} from "@/types/invitation";

interface InvitationListProps {
  onRefresh?: () => void;
}

const statusConfig: Record<InvitationStatus, { color: string }> = {
  pending: { color: "bg-yellow-100 text-yellow-800" },
  accepted: { color: "bg-green-100 text-green-800" },
  expired: { color: "bg-gray-100 text-gray-800" },
  revoked: { color: "bg-red-100 text-red-800" },
};

const roleLabels: Record<InvitationRole, string> = {
  rider: "Rider",
  admin: "Courier Admin",
  operations: "Operations Staff",
};

const parseBackendDate = (value: string) => {
  // Backend formats as 'YYYY-MM-DD HH:mm:ss' (not strict ISO).
  // Convert to 'YYYY-MM-DDTHH:mm:ss' for reliable parsing.
  const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
  return new Date(normalized);
};

export default function InvitationList({ onRefresh }: InvitationListProps) {
  const [invitations, setInvitations] = useState<ProviderInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] =
    useState<ProviderInvitation | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const [filters, setFilters] = useState<InvitationFilters>({
    status: undefined,
  });

  const fetchInvitations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await invitationService.getInvitations(filters);
      setInvitations(data.invitations);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch invitations",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [filters.status]);

  const handleRevokeClick = (invitation: ProviderInvitation) => {
    setSelectedInvitation(invitation);
    setRevokeDialogOpen(true);
  };

  const handleRevokeConfirm = async () => {
    if (!selectedInvitation) return;

    setIsRevoking(true);
    try {
      await invitationService.revokeInvitation(selectedInvitation.id);
      setRevokeDialogOpen(false);
      fetchInvitations(); // Refresh list
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to revoke invitation");
    } finally {
      setIsRevoking(false);
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return parseBackendDate(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expiryDate = parseBackendDate(expiresAt);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
  };

  const fieldControlClass =
    "border-border/70 bg-background shadow-sm focus:border-primary/60 focus:ring-2 focus:ring-primary/15";

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchInvitations} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filters */}
        <div className="rounded-lg border border-border/60 bg-card/60 p-4">
          <div className="max-w-xs space-y-2">
            <p className="text-sm font-medium">Status</p>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setFilters({
                  status:
                    value === "all" ? undefined : (value as InvitationStatus),
                })
              }
            >
              <SelectTrigger className={`w-full ${fieldControlClass}`}>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="border-border/70">
                <SelectItem value="all">All Invitations</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Narrow down invitations by current status.
            </p>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-background">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-foreground">
              {filters.status
                ? "No invitations match this status"
                : "No invitations yet"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {filters.status
                ? "Try another filter or switch to All Invitations to view everything."
                : "Sent invitations will appear here so you can track status and expiry details."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => {
                  return (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <span className="font-medium">{invitation.email}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {roleLabels[invitation.role]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={statusConfig[invitation.status].color}
                        >
                          {formatStatus(invitation.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {invitation.invited_by_name}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(invitation.invited_at)}</TableCell>
                      <TableCell>
                        <div>
                          <p>{formatDate(invitation.expires_at)}</p>
                          {invitation.status === "pending" &&
                            isExpiringSoon(invitation.expires_at) && (
                              <p className="text-xs text-orange-600">
                                Expiring soon!
                              </p>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {invitation.status === "pending" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRevokeClick(invitation)}
                          >
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the invitation for{" "}
              <strong>{selectedInvitation?.email}</strong>? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeConfirm}
              disabled={isRevoking}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRevoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
