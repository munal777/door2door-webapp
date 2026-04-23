export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export type InvitationRole = "rider" | "admin" | "operations";

// Provider Invitation Types
export interface ProviderInvitation {
  id: number;
  email: string;
  role: InvitationRole;
  status: InvitationStatus;
  invited_at: string;
  expires_at: string;
  accepted_at?: string | null;
  invited_by_name: string;
  time_remaining_hours: number;
}

export interface SendInvitationData {
  email: string;
  role: InvitationRole;
}

export interface InvitationFilters {
  status?: InvitationStatus;
}

export interface InvitationListResponse {
  count: number;
  invitations: ProviderInvitation[];
}
