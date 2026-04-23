import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, CheckCircle2 } from "lucide-react";
import LoginForm from "@/components/shared/LoginForm";
import BrandLogo from "@/components/shared/BrandLogo";
import bgImage from "@/assets/bg.jpg";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";

export default function CourierLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(
        { email, password },
        "courier_staff",
      );

      if (response.IsSuccess && response.Result) {
        const user = response.Result.user;

        // Check if user is courier staff
        if (user.user_type !== "courier_staff") {
          setError("Access denied. This portal is for courier providers only.");
          return;
        }

        // Store tokens and user data using auth context
        login(user, response.Result.access, response.Result.refresh);

        // Redirect to courier dashboard
        navigate("/courier/dashboard");
      } else {
        // Handle error message
        if (typeof response.ErrorMessage === "string") {
          setError(response.ErrorMessage);
        } else if (
          response.ErrorMessage &&
          typeof response.ErrorMessage === "object"
        ) {
          const firstKey = Object.keys(response.ErrorMessage)[0];
          const firstError = response.ErrorMessage[firstKey];
          setError(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          setError("Invalid email or password. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);

      // Handle API error response
      if (err.response?.data?.ErrorMessage) {
        const errMsg = err.response.data.ErrorMessage;
        if (typeof errMsg === "string") {
          setError(errMsg);
        } else if (typeof errMsg === "object") {
          const firstKey = Object.keys(errMsg)[0];
          const firstError = errMsg[firstKey];
          setError(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          setError("An error occurred during login. Please try again.");
        }
      } else {
        setError(
          err.response?.data?.message ||
            "An error occurred during login. Please try again.",
        );
      }
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
            alt="Courier operations"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-amber-500/40 via-orange-500/45 to-amber-700/70" />

          <div className="relative z-10 w-full max-w-lg p-10 text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Truck className="h-4 w-4" />
              Courier CRM
            </div>
            <h2 className="text-3xl font-semibold leading-tight">
              Streamline pickups, dispatch, and delivery updates from one place.
            </h2>
            <div className="mt-6 space-y-3 text-sm text-white/90">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Track live order flow and assignments.
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Coordinate riders with fewer delays.
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Keep clients informed with timely status updates.
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
                  Courier Staff Login
                </h1>
                <p className="text-sm text-slate-600">
                  Use your staff credentials to access the courier dashboard.
                </p>
              </div>
            </div>

            <LoginForm
              hideHeader
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error}
            />

            <div className="mx-auto w-full max-w-md space-y-2 text-center">
              <p className="text-sm text-slate-600">
                Don&apos;t have a courier account?{" "}
                <button
                  onClick={() => navigate("/register-courier")}
                  className="font-medium text-amber-600 transition hover:text-amber-700 hover:underline"
                >
                  Register your company
                </button>
              </p>
              <p className="text-xs text-slate-500">
                Door2Door © {new Date().getFullYear()} - All rights reserved
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
