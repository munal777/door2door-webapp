import { Loader2, Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminSettings() {
  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Manage your system configuration and preferences.
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="max-w-2xl mx-auto mt-12">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Settings className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Settings Coming Soon</CardTitle>
          <CardDescription className="text-base">
            API is being prepared
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>
              We're working on integrating the settings management features.
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
