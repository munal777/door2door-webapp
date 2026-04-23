import { MapPin, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import BrandLogo from "@/components/shared/BrandLogo";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="mb-9 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center">
              <BrandLogo className="h-8 md:h-9" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Modernizing courier services in Nepal. Connecting senders, courier
              companies, and riders in one unified platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:text-primary transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-sm text-muted-foreground hover:text-primary transition"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-sm text-muted-foreground hover:text-primary transition"
                >
                  About Us
                </a>
              </li>
              <li>
                <Link
                  to="/register-courier"
                  className="text-sm text-muted-foreground hover:text-primary transition"
                >
                  Register Courier
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h3 className="font-semibold mb-4">Our Services</h3>
            <ul className="space-y-3">
              <li className="text-sm text-muted-foreground">
                On-Demand Pickup
              </li>
              <li className="text-sm text-muted-foreground">
                Real-Time Tracking
              </li>
              <li className="text-sm text-muted-foreground">Courier CRM</li>
              <li className="text-sm text-muted-foreground">
                Rider Management
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <span>Kathmandu, Nepal</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                <span>+977 1-XXXXXXX</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <span>info@door2door.com.np</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-7">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2026 Door2Door Nepal. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#privacy"
                className="text-sm text-muted-foreground hover:text-primary transition"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="text-sm text-muted-foreground hover:text-primary transition"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
