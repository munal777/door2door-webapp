import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrdersHeaderProps {
  title: string;
  subtitle: string;
  showCreate?: boolean;
}

export default function OrdersHeader({
  title,
  subtitle,
  showCreate = true,
}: OrdersHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {showCreate && (
        <Button asChild className="shadow-sm">
          <Link
            to="/courier/orders/create"
            className="inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Order
          </Link>
        </Button>
      )}
    </div>
  );
}
