import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Bell,
  ClipboardList,
  Mail,
  Route,
  Settings,
  Users,
} from "lucide-react";

export default function CourierDashboard() {
  const navigate = useNavigate();
  const quickActions = [
    {
      title: "Create Manual Order",
      description: "Register a walk-in or phone booking quickly.",
      icon: <ClipboardList className="h-5 w-5 text-primary" />,
      path: "/courier/orders/create",
    },
    {
      title: "Manage Shipments",
      description: "Open, update, and close shipment buckets.",
      icon: <Route className="h-5 w-5 text-primary" />,
      path: "/courier/shipments",
    },
    {
      title: "Review Online Requests",
      description: "Process nearby online order requests.",
      icon: <Bell className="h-5 w-5 text-primary" />,
      path: "/courier/order-requests",
    },
    {
      title: "Analytics Workspace",
      description: "Open orders, revenue, and shipment analytics.",
      icon: <BarChart3 className="h-5 w-5 text-primary" />,
      path: "/courier/analytics/orders",
    },
    {
      title: "Users & Riders",
      description: "Manage staff users and rider assignments.",
      icon: <Users className="h-5 w-5 text-primary" />,
      path: "/courier/management/staff-riders",
    },
    {
      title: "Invitations",
      description: "Invite operations staff and riders.",
      icon: <Mail className="h-5 w-5 text-primary" />,
      path: "/courier/invitations",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Courier Operations Hub</h1>
        <p className="text-gray-500 mt-2">
          Quick access to day-to-day courier operations and workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickActions.map((action) => (
          <Card
            key={action.path}
            className="border-border/60 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <CardHeader className="space-y-3 pb-2">
              <div className="flex items-center justify-between">
                <div className="rounded-md border border-border/70 bg-muted/30 p-2">
                  {action.icon}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-base">{action.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {action.description}
              </p>
              <Button
                variant="ghost"
                className="mt-4 px-0 text-primary hover:text-primary"
                onClick={() => navigate(action.path)}
              >
                Open
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 bg-muted/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">System Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            Configure courier profile settings, notification preferences, and
            account controls.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/courier/settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Open Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
