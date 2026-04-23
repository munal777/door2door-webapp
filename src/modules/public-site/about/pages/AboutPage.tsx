import { Building2, ShieldCheck, Zap } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const values = [
  {
    icon: ShieldCheck,
    title: "Trusted Delivery",
    description:
      "Verification-first workflow for senders, riders, and receivers to reduce delivery disputes.",
  },
  {
    icon: Zap,
    title: "Operational Speed",
    description:
      "Fast order creation, dispatch visibility, and practical dashboards for day-to-day courier teams.",
  },
  {
    icon: Building2,
    title: "Built for Nepal",
    description:
      "Designed around local courier realities with practical tools for growing delivery businesses.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28">
        <div className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-secondary/60 to-background px-6 py-12 md:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
              About Door2Door
            </p>
            <h1 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">
              Modern courier infrastructure for the next delivery era.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Door2Door connects customers, courier operations teams, and riders
              in one workflow-focused ecosystem. We optimize service quality,
              speed, and operational transparency from order intake to
              successful handoff.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <article
                  key={value.title}
                  className="rounded-2xl border border-border bg-white p-6 shadow-sm"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {value.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
