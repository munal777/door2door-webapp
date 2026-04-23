import { useState, useEffect } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { pricingService } from "@/services/pricingService";
import type { ServiceTypePricingFormData } from "@/types/pricing";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  ADMIN_FORM_CARD_CLASS,
  ADMIN_FORM_CONTROL_CLASS,
  ADMIN_FORM_SELECT_TRIGGER_CLASS,
} from "@/modules/platform-admin/pricing/components/formStyles";
import {
  getPricingSectionTab,
  type PricingSectionTab,
} from "@/modules/platform-admin/pricing/utils/pricingNavigation";

export default function ServiceTypeForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isEditMode = !!id;
  const returnTab = (searchParams.get("returnTo") ||
    getPricingSectionTab(location.pathname)) as PricingSectionTab;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ServiceTypePricingFormData>({
    service_type: "standard",
    estimated_delivery_hours: 24,
    price_multiplier: "1.00",
    is_active: true,
  });

  useEffect(() => {
    if (isEditMode) {
      loadServiceType();
    }
  }, [id]);

  const loadServiceType = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await pricingService.getServiceTypePricing(parseInt(id));
      if (response.IsSuccess && response.Result) {
        const service = response.Result;
        setFormData({
          service_type: service.service_type,
          estimated_delivery_hours: service.estimated_delivery_hours,
          price_multiplier: service.price_multiplier,
          is_active: service.is_active,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.ErrorMessage || "Failed to load service type",
      });
      navigate(`/admin/pricing?tab=${returnTab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode && id) {
        const response = await pricingService.updateServiceTypePricing(
          parseInt(id),
          formData,
        );
        if (response.IsSuccess) {
          toast({
            title: "Success",
            description: "Service type updated successfully",
          });
          navigate(`/admin/pricing?tab=${returnTab}`);
        }
      } else {
        const response =
          await pricingService.createServiceTypePricing(formData);
        if (response.IsSuccess) {
          toast({
            title: "Success",
            description: "Service type created successfully",
          });
          navigate(`/admin/pricing?tab=${returnTab}`);
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.ErrorMessage;
      toast({
        variant: "destructive",
        title: "Error",
        description:
          typeof errorMsg === "object"
            ? JSON.stringify(errorMsg)
            : errorMsg || "Failed to save service type",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(`/admin/pricing?tab=${returnTab}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Pricing
      </Button>

      <Card className={ADMIN_FORM_CARD_CLASS}>
        <CardHeader>
          <CardTitle>
            {isEditMode ? "Edit Service Type" : "Add New Service Type"}
          </CardTitle>
          <CardDescription>
            Configure pricing for different delivery service types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="service_type" className="text-sm font-medium">
                Service Type *
              </Label>
              <Select
                value={formData.service_type}
                onValueChange={(value: "standard" | "express") =>
                  setFormData({ ...formData, service_type: value })
                }
              >
                <SelectTrigger className={ADMIN_FORM_SELECT_TRIGGER_CLASS}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Delivery</SelectItem>
                  <SelectItem value="express">Express Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_delivery_hours">
                Estimated Delivery (Hours) *
              </Label>
              <Input
                id="estimated_delivery_hours"
                type="number"
                required
                value={formData.estimated_delivery_hours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimated_delivery_hours: parseInt(e.target.value),
                  })
                }
                placeholder="e.g., 24"
                className={ADMIN_FORM_CONTROL_CLASS}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_multiplier" className="text-sm font-medium">
                Price Multiplier *
              </Label>
              <Input
                id="price_multiplier"
                type="number"
                step="0.01"
                required
                value={formData.price_multiplier}
                onChange={(e) =>
                  setFormData({ ...formData, price_multiplier: e.target.value })
                }
                placeholder="e.g., 1.50"
                className={ADMIN_FORM_CONTROL_CLASS}
              />
              <p className="text-sm text-muted-foreground">
                Base price will be multiplied by this value
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/admin/pricing?tab=${returnTab}`)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditMode ? "Update" : "Create"} Service Type
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
