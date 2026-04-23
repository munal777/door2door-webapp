import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { Loader2, LayoutDashboard } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, [navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, {user.first_name || "Administrator"}!
        </h2>
        <p className="text-muted-foreground">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="max-w-2xl mx-auto mt-12">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <LayoutDashboard className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Dashboard Coming Soon</CardTitle>
          <CardDescription className="text-base">
            API is being prepared
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>
              We're working on integrating the dashboard statistics and
              analytics.
            </p>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            In the meantime, you can manage courier providers and pricing from
            the sidebar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
