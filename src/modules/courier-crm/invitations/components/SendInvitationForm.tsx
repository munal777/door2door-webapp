import { useState } from "react";
import { invitationService } from "@/services/invitationService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import type { InvitationRole, SendInvitationData } from "@/types/invitation";

interface SendInvitationFormProps {
  onSuccess?: () => void;
}

export default function SendInvitationForm({
  onSuccess,
}: SendInvitationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState<SendInvitationData>({
    email: "",
    role: "rider",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: InvitationRole) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const result = await invitationService.sendInvitation(formData);
      setSuccess(true);
      setSuccessMessage(result.message);

      // Reset form
      setFormData({
        email: "",
        role: "rider",
      });

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send invitation",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fieldControlClass =
    "border-border/70 bg-background shadow-sm focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/15";

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle>Send Invitation</CardTitle>
        <CardDescription>
          Invite a rider or staff member to join your courier service
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {successMessage || "Invitation sent successfully!"}
            </AlertDescription>
          </Alert>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-lg border border-border/60 bg-muted/20 p-5"
        >
          <div className="space-y-2.5">
            <Label htmlFor="role" className="text-sm font-medium">
              Role *
            </Label>
            <Select
              value={formData.role}
              onValueChange={(v) => handleRoleChange(v as InvitationRole)}
            >
              <SelectTrigger id="role" className={fieldControlClass}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="border-border/70">
                <SelectItem value="rider">Rider</SelectItem>
                <SelectItem value="admin">Courier Admin</SelectItem>
                <SelectItem value="operations">Operations Staff</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose what access the invited user will have.
            </p>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`pl-10 ${fieldControlClass}`}
                placeholder="user@example.com"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              The user will receive an invitation email with a registration link
              that expires in 72 hours.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Invitation...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
