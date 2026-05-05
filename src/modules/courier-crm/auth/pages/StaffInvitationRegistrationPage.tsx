import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

import BrandLogo from "@/components/shared/BrandLogo";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import bgImage from "@/assets/bg.jpg";
import { staffService } from "@/services/staffService";

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
};

type InvitationInfo = {
  email: string;
  role: "admin" | "operations" | "rider";
  courier_name: string;
  courier_city: string;
  courier_state: string;
  expires_at: string;
};

const initialFormState: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  password: "",
  confirm_password: "",
};

export default function StaffInvitationRegistrationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const invitationToken = searchParams.get("token")?.trim() ?? "";

  const [form, setForm] = useState<FormState>(initialFormState);
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(
    null,
  );

  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const roleLabel = useMemo(() => {
    if (!invitationInfo) return "Staff";
    if (invitationInfo.role === "admin") return "Courier Admin";
    if (invitationInfo.role === "operations") return "Operations Staff";
    return "Staff";
  }, [invitationInfo]);

  useEffect(() => {
    const validateToken = async () => {
      if (!invitationToken) {
        toast({
          variant: "destructive",
          title: "Invalid Link",
          description: "Invitation link is missing a token. Please use the registration link sent to your email.",
        });
        setValidationError("Invitation link is missing a token.");
        setIsValidatingToken(false);
        return;
      }

      setIsValidatingToken(true);
      setValidationError(null);

      try {
        const result =
          await staffService.validateStaffInvitationToken(invitationToken);

        setInvitationInfo(result);
        setForm((prev) => ({ ...prev, email: result.email }));
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Invitation link is invalid or expired.";
        setValidationError(errMsg);
        toast({
          variant: "destructive",
          title: "Invalid Invitation Link",
          description: errMsg,
        });
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [invitationToken]);

  const onChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = (): string | null => {
    if (!form.first_name.trim()) return "First name is required.";
    if (!form.last_name.trim()) return "Last name is required.";
    if (!form.phone_number.trim()) return "Phone number is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.password.trim()) return "Password is required.";
    if (!form.confirm_password.trim()) return "Confirm password is required.";

    if (invitationInfo && form.email.toLowerCase() !== invitationInfo.email) {
      return `Email must match the invited email: ${invitationInfo.email}`;
    }

    if (form.password.length < 8) {
      return "Password must be at least 8 characters long.";
    }

    if (form.password !== form.confirm_password) {
      return "Passwords do not match.";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    event.preventDefault();

    const formError = validateForm();
    if (formError) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: formError,
      });
      return;
    }

    if (!invitationToken) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Invitation token is missing.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await staffService.registerWithInvitation({
        invitation_token: invitationToken,
        user: {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone_number: form.phone_number,
          password: form.password,
          confirm_password: form.confirm_password,
        },
      });

      const successMsg = response.message || "Registration completed successfully. You can now sign in.";
      setSubmitSuccess(true);
      toast({
        title: "Registration Complete",
        description: successMsg,
      });
      setForm(initialFormState);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unable to complete registration.";
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden lg:flex lg:items-end lg:justify-center lg:border-r lg:border-slate-200/70">
          <img
            src={bgImage}
            alt="Door2Door courier"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-amber-500/40 via-orange-500/45 to-amber-700/70" />

          <div className="relative z-10 w-full max-w-lg p-10 text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" />
              Invitation Registration
            </div>
            <h2 className="text-3xl font-semibold leading-tight">
              Securely activate your staff account and start managing courier
              operations.
            </h2>
            <div className="mt-6 space-y-3 text-sm text-white/90">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Token-validated onboarding flow
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Role-aware account setup
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Direct access to Courier CRM after signup
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-6 py-10 md:px-10 lg:px-16">
          <div className="w-full max-w-lg space-y-6">
            <div className="space-y-5">
              <BrandLogo className="h-14 w-auto" alt="Door2Door" />
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">
                  Staff Registration
                </h1>
                <p className="text-sm text-slate-600">
                  Complete your invitation-based account setup to access the
                  courier portal.
                </p>
              </div>
            </div>

            {isValidatingToken && (
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                Validating invitation link...
              </div>
            )}

            {!isValidatingToken && validationError && (
              <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center rounded-xl border border-red-100 bg-red-50/50 p-8">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900">Invalid Invitation Link</h3>
                  <p className="mt-2 text-sm text-slate-500">{validationError}</p>
                </div>
                <Button
                  type="button"
                  onClick={() => navigate("/courier/login")}
                  className="mt-4 bg-amber-600 hover:bg-amber-700"
                >
                  Go to Courier Login
                </Button>
              </div>
            )}

            {!isValidatingToken && !validationError && invitationInfo && (
              <>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-900">
                    You are invited as <strong>{roleLabel}</strong> for
                    <strong> {invitationInfo.courier_name}</strong>.
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    {invitationInfo.courier_city},{" "}
                    {invitationInfo.courier_state}
                  </p>
                </div>

                {submitSuccess && (
                  <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center rounded-xl border border-green-100 bg-green-50/50 p-8">
                    <div className="rounded-full bg-green-100 p-3">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-slate-900">Registration Complete</h3>
                      <p className="mt-2 text-sm text-slate-500">You can now sign in with your credentials.</p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => navigate("/courier/login")}
                      className="mt-4 bg-amber-600 hover:bg-amber-700"
                    >
                      Continue to Login
                    </Button>
                  </div>
                )}

                {!submitSuccess && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="first_name"
                            value={form.first_name}
                            onChange={(e) =>
                              onChange("first_name", e.target.value)
                            }
                            className="pl-9"
                            placeholder="Aarav"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="last_name"
                            value={form.last_name}
                            onChange={(e) =>
                              onChange("last_name", e.target.value)
                            }
                            className="pl-9"
                            placeholder="Shrestha"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Invited Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => onChange("email", e.target.value)}
                          className="pl-9"
                          disabled
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="phone_number"
                          value={form.phone_number}
                          onChange={(e) =>
                            onChange("phone_number", e.target.value)
                          }
                          className="pl-9"
                          placeholder="98XXXXXXXX"
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="password"
                            type="password"
                            value={form.password}
                            onChange={(e) =>
                              onChange("password", e.target.value)
                            }
                            className="pl-9"
                            placeholder="Create password"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm_password">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            id="confirm_password"
                            type="password"
                            value={form.confirm_password}
                            onChange={(e) =>
                              onChange("confirm_password", e.target.value)
                            }
                            className="pl-9"
                            placeholder="Confirm password"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="h-11 w-full bg-amber-600 text-base hover:bg-amber-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Staff Account"
                      )}
                    </Button>

                    <p className="text-center text-xs text-slate-500">
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="font-medium text-amber-700 hover:underline"
                        onClick={() => navigate("/courier/login")}
                      >
                        Sign in
                      </button>
                    </p>
                  </form>
                )}
              </>
            )}

            <p className="text-center text-xs text-slate-500">
              Door2Door {new Date().getFullYear()} - secure staff onboarding
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
