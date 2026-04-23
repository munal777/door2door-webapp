import {
  CheckCircle2,
  MoveRight,
  Package,
  Route,
  Shield,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Button } from "@/components/ui/button";

const highlights = [
  {
    icon: Route,
    title: "Live Route Visibility",
    description:
      "Track every package movement from pickup to handover in one timeline.",
  },
  {
    icon: Shield,
    title: "Verified Delivery",
    description:
      "Proof-first delivery workflow with QR and operator validation checkpoints.",
  },
  {
    icon: Users,
    title: "Courier Team Control",
    description:
      "Manage riders, operations, and service quality from a unified CRM interface.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 md:pt-32">
        <div className="mx-auto max-w-7xl px-4 pb-10 md:px-6">
          <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-background via-secondary/60 to-accent/65 px-6 py-14 md:px-12">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-secondary-foreground">
                <Package className="h-3.5 w-3.5 text-primary" />
                Door2Door Courier Platform
              </p>
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-6xl">
                Orange-powered logistics CRM for reliable city delivery.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Run dispatch, riders, shipments, and billing from a clean
                operational dashboard while customers track orders in real-time.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link
                    to="/register-courier"
                    className="inline-flex items-center gap-2"
                  >
                    Start with Door2Door
                    <MoveRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/track">Track Shipment</Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-5 text-sm text-foreground/85">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Simple onboarding
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Courier + admin portal
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Real-time tracking
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-3 md:px-6">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
