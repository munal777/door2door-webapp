import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import BrandLogo from "@/components/shared/BrandLogo";

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Home", to: "/" },
    { label: "Track Order", to: "/track" },
    { label: "Services", to: "/services" },
    { label: "About", to: "/about" },
  ];

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <BrandLogo className="h-9 md:h-10" />
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {links.map((link) => {
              const active =
                location.pathname === link.to ||
                location.pathname.startsWith(`${link.to}/`);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={
                    active
                      ? "text-sm font-semibold text-primary"
                      : "text-sm font-medium text-muted-foreground transition hover:text-foreground"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:block">
            <Button asChild>
              <Link to="/register-courier">Get Started</Link>
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {mobileOpen && (
          <div className="mt-3 space-y-2 rounded-2xl border border-border bg-card p-3 md:hidden">
            {links.map((link) => {
              const active =
                location.pathname === link.to ||
                location.pathname.startsWith(`${link.to}/`);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={
                    active
                      ? "block rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground"
                      : "block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                >
                  {link.label}
                </Link>
              );
            })}

            <Button asChild className="mt-1 w-full">
              <Link to="/register-courier" onClick={() => setMobileOpen(false)}>
                Get Started
              </Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
