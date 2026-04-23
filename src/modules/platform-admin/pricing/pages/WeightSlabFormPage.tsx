import { useState, useEffect } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { pricingService } from "@/services/pricingService";
import type { WeightSlabFormData } from "@/types/pricing";
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

export default function WeightSlabForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isEditMode = !!id;
  const returnTab = (searchParams.get("returnTo") ||
    getPricingSectionTab(location.pathname)) as PricingSectionTab;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<WeightSlabFormData>({
    package_type: "document",
    up_to_weight: "",
    length: "",
    width: "",
    height: "",
    extra_charge: "0.00",
    is_active: true,
  });

  useEffect(() => {
    if (isEditMode) {
      loadWeightSlab();
    }
  }, [id]);

  const loadWeightSlab = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await pricingService.getWeightSlab(parseInt(id));
      if (response.IsSuccess && response.Result) {
        const slab = response.Result;
        setFormData({
          package_type: slab.package_type,
          up_to_weight: slab.up_to_weight,
          length: slab.length || "",
          width: slab.width || "",
          height: slab.height || "",
          extra_charge: slab.extra_charge,
          is_active: slab.is_active,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.ErrorMessage || "Failed to load weight slab",
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
      // Clean up empty dimension fields
      const submitData = {
        ...formData,
        length: formData.length || undefined,
        width: formData.width || undefined,
        height: formData.height || undefined,
      };

      if (isEditMode && id) {
        const response = await pricingService.updateWeightSlab(
          parseInt(id),
          submitData,
        );
        if (response.IsSuccess) {
          toast({
            title: "Success",
            description: "Weight slab updated successfully",
          });
          navigate(`/admin/pricing?tab=${returnTab}`);
        }
      } else {
        const response = await pricingService.createWeightSlab(submitData);
        if (response.IsSuccess) {
          toast({
            title: "Success",
            description: "Weight slab created successfully",
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
            : errorMsg || "Failed to save weight slab",
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
            {isEditMode ? "Edit Weight Slab" : "Add New Weight Slab"}
          </CardTitle>
          <CardDescription>
            Configure weight-based pricing for packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="package_type" className="text-sm font-medium">
                Package Type *
              </Label>
              <Select
                value={formData.package_type}
                onValueChange={(value: "document" | "package") =>
                  setFormData({ ...formData, package_type: value })
                }
              >
                <SelectTrigger className={ADMIN_FORM_SELECT_TRIGGER_CLASS}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="package">Package</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="up_to_weight" className="text-sm font-medium">
                Up To Weight (kg) *
              </Label>
              <Input
                id="up_to_weight"
                type="number"
                step="0.01"
                required
                value={formData.up_to_weight}
                onChange={(e) =>
                  setFormData({ ...formData, up_to_weight: e.target.value })
                }
                placeholder="e.g., 5.00"
                className={ADMIN_FORM_CONTROL_CLASS}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length" className="text-sm font-medium">
                  Length (cm)
                </Label>
                <Input
                  id="length"
                  type="number"
                  step="0.01"
                  value={formData.length}
                  onChange={(e) =>
                    setFormData({ ...formData, length: e.target.value })
                  }
                  placeholder="Optional"
                  className={ADMIN_FORM_CONTROL_CLASS}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="width" className="text-sm font-medium">
                  Width (cm)
                </Label>
                <Input
                  id="width"
                  type="number"
                  step="0.01"
                  value={formData.width}
                  onChange={(e) =>
                    setFormData({ ...formData, width: e.target.value })
                  }
                  placeholder="Optional"
                  className={ADMIN_FORM_CONTROL_CLASS}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height" className="text-sm font-medium">
                  Height (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                  placeholder="Optional"
                  className={ADMIN_FORM_CONTROL_CLASS}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="extra_charge" className="text-sm font-medium">
                Extra Charge (NPR) *
              </Label>
              <Input
                id="extra_charge"
                type="number"
                step="0.01"
                required
                value={formData.extra_charge}
                onChange={(e) =>
                  setFormData({ ...formData, extra_charge: e.target.value })
                }
                placeholder="e.g., 50.00"
                className={ADMIN_FORM_CONTROL_CLASS}
              />
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
                {isEditMode ? "Update" : "Create"} Weight Slab
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
