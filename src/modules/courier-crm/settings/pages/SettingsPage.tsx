import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  Building2,
  CalendarClock,
  Camera,
  Check,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { courierService } from "@/services/courierService";
import type { CourierCompanyProfile } from "@/types/courierProfile";

export default function SettingsPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [updatingLogo, setUpdatingLogo] = useState(false);
  const [profile, setProfile] = useState<CourierCompanyProfile | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await courierService.getCompanyProfile();
        setProfile(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to load courier profile",
          description:
            error instanceof Error
              ? error.message
              : "Unable to fetch company profile right now.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [toast]);

  useEffect(() => {
    if (!selectedLogoFile) {
      setLogoPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedLogoFile);
    setLogoPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedLogoFile]);

  const displayLogo = logoPreviewUrl || profile?.logo_url || null;

  const formattedStatus = useMemo(() => {
    if (!profile?.operational_status) {
      return "Unknown";
    }

    return profile.operational_status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [profile?.operational_status]);

  const formattedAddress = useMemo(() => {
    if (!profile) {
      return "-";
    }

    return [
      profile.address_line,
      profile.city,
      profile.state,
      profile.postal_code,
    ]
      .filter(Boolean)
      .join(", ");
  }, [profile]);

  const formattedLastUpdated = useMemo(() => {
    if (!profile?.updated_at) {
      return "Not available";
    }

    const updatedDate = new Date(profile.updated_at);
    if (Number.isNaN(updatedDate.getTime())) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(updatedDate);
  }, [profile?.updated_at]);

  const handleSelectLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file for the company logo.",
      });
      event.target.value = "";
      return;
    }

    setSelectedLogoFile(selectedFile);
  };

  const handleCancelLogoChange = () => {
    setSelectedLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveLogo = async () => {
    if (!selectedLogoFile) {
      return;
    }

    try {
      setUpdatingLogo(true);
      const updatedProfile = await courierService.updateCompanyProfile({
        logo: selectedLogoFile,
      });

      setProfile(updatedProfile);
      setSelectedLogoFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Logo updated",
        description: "Your courier company logo has been saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to update logo",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    } finally {
      setUpdatingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center p-6">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-3 sm:p-4 md:p-6">
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Building2 className="h-5 w-5" />
                Courier Company Profile
              </CardTitle>
              <CardDescription className="mt-1">
                Click your logo to change it, preview the result, then save.
              </CardDescription>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 font-medium">
                <CalendarClock className="h-3.5 w-3.5" />
                Last Profile Sync
              </p>
              <p className="mt-1 text-foreground">{formattedLastUpdated}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-border/70 bg-linear-to-br from-background via-background to-muted/30 p-4 shadow-sm sm:p-5 md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <input
                  ref={fileInputRef}
                  id="courier-logo-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleSelectLogo}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-all hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Upload or change company logo"
                >
                  {displayLogo ? (
                    <img
                      src={displayLogo}
                      alt="Courier logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                  )}

                  <span className="absolute inset-0 flex items-end justify-center bg-linear-to-t from-slate-900/70 via-slate-900/40 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="inline-flex items-center gap-1 rounded-md bg-background/95 px-2 py-1 text-[11px] font-medium text-foreground">
                      <Camera className="h-3.5 w-3.5" />
                      Change
                    </span>
                  </span>
                </button>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground md:text-2xl">
                    {profile.name}
                  </h2>
                  <p className="flex items-center gap-1.5 break-all text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {profile.company_email || "-"}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Last Updated: {formattedLastUpdated}
                  </p>

                  {selectedLogoFile ? (
                    <p className="text-xs text-primary">
                      Previewing: {selectedLogoFile.name}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {formattedStatus}
                </Badge>
                <Badge variant={profile.is_active ? "default" : "secondary"}>
                  {profile.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {selectedLogoFile ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3">
                <Button
                  size="sm"
                  onClick={handleSaveLogo}
                  disabled={updatingLogo}
                  className="min-w-28"
                >
                  {updatingLogo ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save logo
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelLogoChange}
                  disabled={updatingLogo}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <span className="text-xs text-muted-foreground">
                  Your new logo is only applied after saving.
                </span>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Tap or click the logo to upload a new image.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Contact
              </h3>
              <div className="mt-3 space-y-2">
                <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Email
                  </p>
                  <p className="break-all text-sm font-medium text-foreground">
                    {profile.company_email || "-"}
                  </p>
                </div>
                <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2">
                  <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    Phone
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {profile.company_phone || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Address
              </h3>
              <div className="mt-3 rounded-md border border-border/60 bg-muted/20 px-3 py-2">
                <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  Delivery Hub
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-foreground">
                  {formattedAddress || "-"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Country: {profile.country || "-"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Operations Snapshot
              </h3>
              <div className="mt-3 space-y-2">
                <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2">
                  <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <ShieldCheck className="h-3 w-3" />
                    Rider Capacity
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {profile.max_riders} riders
                  </p>
                </div>
                <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2">
                  <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    Last Updated
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formattedLastUpdated}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
