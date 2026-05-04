import { useState } from "react";
import { orderService } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, Package, RefreshCw } from "lucide-react";
import type { OrderDetail, OrderUpdateData } from "@/types/order";

interface ParcelDetailsUpdateFormProps {
  order: OrderDetail;
  onUpdated: (updated: OrderDetail) => void;
}

export default function ParcelDetailsUpdateForm({
  order,
  onUpdated,
}: ParcelDetailsUpdateFormProps) {
  const [form, setForm] = useState({
    weight: String(order.weight),
    total_quantity: String(order.total_quantity),
    length: order.length ? String(order.length) : "",
    width: order.width ? String(order.width) : "",
    height: order.height ? String(order.height) : "",
    package_description: order.package_description || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const originalForm = {
    weight: String(order.weight),
    total_quantity: String(order.total_quantity),
    length: order.length ? String(order.length) : "",
    width: order.width ? String(order.width) : "",
    height: order.height ? String(order.height) : "",
    package_description: order.package_description || "",
  };

  const hasChanges = JSON.stringify(form) !== JSON.stringify(originalForm);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const payload: OrderUpdateData = {};

    if (form.weight !== originalForm.weight) {
      const w = parseFloat(form.weight);
      if (isNaN(w) || w <= 0) {
        setError("Weight must be a positive number.");
        setIsLoading(false);
        return;
      }
      payload.weight = w;
    }

    if (form.total_quantity !== originalForm.total_quantity) {
      const q = parseInt(form.total_quantity);
      if (isNaN(q) || q < 1) {
        setError("Quantity must be at least 1.");
        setIsLoading(false);
        return;
      }
      payload.total_quantity = q;
    }

    if (form.length !== originalForm.length) {
      payload.length = form.length ? parseFloat(form.length) : null;
    }
    if (form.width !== originalForm.width) {
      payload.width = form.width ? parseFloat(form.width) : null;
    }
    if (form.height !== originalForm.height) {
      payload.height = form.height ? parseFloat(form.height) : null;
    }
    if (form.package_description !== originalForm.package_description) {
      payload.package_description = form.package_description;
    }

    try {
      const updated = await orderService.updateOrder(order.order_number, payload);
      onUpdated(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update parcel details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setForm(originalForm);
    setError(null);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-800">Parcel Details</h3>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 ml-6">
          Correct weight, dimensions, or description for walk-in / exception cases
        </p>
      </div>

      <div className="p-6 space-y-5">
        {/* Weight & Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Weight <span className="text-gray-400">(kg)</span>
            </label>
            <Input
              id="crm-parcel-weight"
              type="number"
              step="0.01"
              min="0.01"
              value={form.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
              className="h-10 border-gray-300 focus-visible:ring-blue-600 focus-visible:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Total Quantity
            </label>
            <Input
              id="crm-parcel-qty"
              type="number"
              min="1"
              step="1"
              value={form.total_quantity}
              onChange={(e) => handleChange("total_quantity", e.target.value)}
              className="h-10 border-gray-300 focus-visible:ring-blue-600 focus-visible:border-blue-600"
            />
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Dimensions <span className="text-gray-400">(cm, optional)</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="relative">
              <Input
                id="crm-parcel-length"
                type="number"
                step="0.1"
                min="0.01"
                placeholder="Length"
                value={form.length}
                onChange={(e) => handleChange("length", e.target.value)}
                className="h-10 border-gray-300 focus-visible:ring-blue-600 focus-visible:border-blue-600"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">L</span>
            </div>
            <div className="relative">
              <Input
                id="crm-parcel-width"
                type="number"
                step="0.1"
                min="0.01"
                placeholder="Width"
                value={form.width}
                onChange={(e) => handleChange("width", e.target.value)}
                className="h-10 border-gray-300 focus-visible:ring-blue-600 focus-visible:border-blue-600"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">W</span>
            </div>
            <div className="relative">
              <Input
                id="crm-parcel-height"
                type="number"
                step="0.1"
                min="0.01"
                placeholder="Height"
                value={form.height}
                onChange={(e) => handleChange("height", e.target.value)}
                className="h-10 border-gray-300 focus-visible:ring-blue-600 focus-visible:border-blue-600"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">H</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Package Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <Textarea
            id="crm-parcel-description"
            placeholder="Brief description of package contents..."
            value={form.package_description}
            onChange={(e) => handleChange("package_description", e.target.value)}
            rows={2}
            className="resize-none border-gray-300 text-sm focus-visible:ring-blue-600 focus-visible:border-blue-600"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            Parcel details updated successfully!
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <Button
            id="crm-parcel-reset"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isLoading || !hasChanges}
            className="text-gray-500 hover:text-gray-700 h-9"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>
          <Button
            id="crm-parcel-save"
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
