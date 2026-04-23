import { useState, type ReactNode } from "react";
import CrmSidebar from "@/components/shared/crm/CrmSidebar";
import type { NavigationGroup } from "@/components/shared/crm/navigationTypes";
import type { User } from "@/types/auth";

interface CRMLayoutProps {
  portalTitle: string;
  groups: NavigationGroup[];
  user: User | null;
  onLogout: () => void;
  children: ReactNode;
}

export default function CRMLayout({
  portalTitle,
  groups,
  user,
  onLogout,
  children,
}: CRMLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <CrmSidebar
          title={portalTitle}
          groups={groups}
          user={user}
          onLogout={onLogout}
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />

        <div className="min-w-0 flex-1 bg-linear-to-b from-background via-white to-background">
          <main className="min-h-screen px-4 py-6 md:px-8 md:py-7">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
