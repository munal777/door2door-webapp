import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle2 } from "lucide-react";
import LoginForm from "@/components/shared/LoginForm";
import BrandLogo from "@/components/shared/BrandLogo";
import bgImage from "@/assets/bg.jpg";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function SystemAdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password }, "admin");

      if (response.IsSuccess && response.Result) {
        const user = response.Result.user;

        // Check if user is system admin or superadmin
        if (user.user_type !== "admin" && user.user_type !== "superadmin") {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "This portal is for system administrators only.",
          });
          return;
        }

        // Store tokens and user data using auth context
        login(user, response.Result.access, response.Result.refresh);

        // Redirect to admin dashboard
        navigate("/admin/dashboard");
      } else {
        let errorMsg = "Invalid email or password. Please try again.";
        if (typeof response.ErrorMessage === "string") {
          errorMsg = response.ErrorMessage;
        } else if (response.ErrorMessage && typeof response.ErrorMessage === "object") {
          const firstKey = Object.keys(response.ErrorMessage)[0];
          const firstError = response.ErrorMessage[firstKey];
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        }
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: errorMsg,
        });
      }
    } catch (err: any) {
      console.error("Login error:", err);

      let errorMsg = "An error occurred during login. Please try again.";
      if (err.response?.data?.ErrorMessage) {
        const errMsg = err.response.data.ErrorMessage;
        if (typeof errMsg === "string") {
          errorMsg = errMsg;
        } else if (typeof errMsg === "object") {
          const firstKey = Object.keys(errMsg)[0];
          const firstError = errMsg[firstKey];
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden lg:flex lg:items-end lg:justify-center lg:border-r lg:border-slate-200/70">
          <img
            src={bgImage}
            alt="Admin operations"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-slate-900/35 via-slate-800/50 to-slate-950/80" />

          <div className="relative z-10 w-full max-w-lg p-10 text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Shield className="h-4 w-4" />
              Platform Control
            </div>
            <h2 className="text-3xl font-semibold leading-tight">
              Monitor courier network health, pricing rules, and provider
              governance.
            </h2>
            <div className="mt-6 space-y-3 text-sm text-white/90">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Centralized visibility across all couriers.
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Enforce access, policy, and service quality.
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Analyze platform performance in real time.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-6 py-10 md:px-10 lg:px-16">
          <div className="w-full max-w-lg space-y-8">
            <div className="mx-auto w-full max-w-md space-y-6">
              <BrandLogo className="h-14 w-auto" alt="Door2Door" />
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">
                  System Admin Login
                </h1>
                <p className="text-sm text-slate-600">
                  Authorized administrators can sign in to manage platform
                  operations.
                </p>
              </div>
            </div>

            <LoginForm
              hideHeader
              onSubmit={handleLogin}
              isLoading={isLoading}
            />

            <p className="mx-auto w-full max-w-md text-center text-xs text-slate-500">
              Door2Door © {new Date().getFullYear()} - All rights reserved
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
