import { useState, type ReactNode } from "react";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import CrmSidebar from "@/components/shared/crm/CrmSidebar";
import BrandLogo from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useLocation, useNavigate } from "react-router-dom";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleMobileNav = (to?: string) => {
    if (to) {
      navigate(to);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-8 w-8" />
            <span className="text-sm font-bold text-foreground">
              {portalTitle}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex">
          <CrmSidebar
            title={portalTitle}
            groups={groups}
            user={user}
            onLogout={onLogout}
            collapsed={collapsed}
            onToggle={() => setCollapsed((prev) => !prev)}
          />
        </div>

        {/* Mobile Navigation Menu */}
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogContent className="h-[90vh] max-w-[90vw] overflow-y-auto rounded-2xl sm:max-w-[400px]">
            <DialogHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                  <BrandLogo className="h-6 w-6" />
                  {portalTitle}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="mt-4 space-y-6 pb-6">
              {groups.map((group) => (
                <div key={group.title} className="space-y-3">
                  <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {group.title}
                  </p>
                  <div className="grid gap-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.to && (location.pathname === item.to || location.pathname.startsWith(`${item.to}/`));

                      return (
                        <div key={item.label} className="space-y-1">
                          <button
                            onClick={() => (item.to ? handleMobileNav(item.to) : null)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </button>
                          
                          {item.children?.map((child) => {
                             const isChildActive = location.pathname === child.to || location.pathname.startsWith(`${child.to}/`);
                             return (
                               <button
                                 key={child.to}
                                 onClick={() => handleMobileNav(child.to)}
                                 className={`ml-7 flex w-full items-center rounded-lg px-3 py-2 text-xs font-medium transition ${
                                   isChildActive
                                     ? "bg-secondary text-secondary-foreground"
                                     : "text-muted-foreground hover:bg-muted"
                                 }`}
                               >
                                 {child.label}
                               </button>
                             );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.user_type?.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="min-w-0 flex-1 bg-linear-to-b from-background via-white to-background">
          <main className="min-h-screen px-4 py-6 md:px-8 md:py-7">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
