import {
  Clock3,
  MapPin,
  Shield,
  Smartphone,
  Users,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Clock3,
    title: "On-Demand Pickup",
    description:
      "Book pickups quickly and route parcels to courier flow without manual chaos.",
  },
  {
    icon: MapPin,
    title: "Real-Time Tracking",
    description:
      "Status updates and movement logs across pickup, transit, and delivery milestones.",
  },
  {
    icon: Shield,
    title: "Secure Handover",
    description:
      "Proof-driven final delivery with identity and package confirmation touchpoints.",
  },
  {
    icon: Smartphone,
    title: "Digital Payments",
    description:
      "Handle COD and digital payment workflows with clear status tracking for teams.",
  },
  {
    icon: Users,
    title: "Rider Operations",
    description:
      "Manage rider assignments, activity, and operational communication in one place.",
  },
  {
    icon: Workflow,
    title: "Courier CRM",
    description:
      "Feature-rich CRM built for order lifecycle control and operational visibility.",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28">
        <div className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
              Services
            </p>
            <h1 className="mt-2 text-4xl font-bold text-foreground md:text-5xl">
              Designed for modern courier operations
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              From pickup to settlement, Door2Door provides practical tools for
              reliable day-to-day courier execution.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article
                  key={service.title}
                  className="rounded-2xl border border-border bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {service.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-secondary/50 px-6 py-8 text-center">
            <h3 className="text-2xl font-semibold text-foreground">
              Ready to scale your courier workflow?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Move your operations to a cleaner CRM with consistent tracking and
              team control.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/register-courier">Register Courier</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/track">Track a Package</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
