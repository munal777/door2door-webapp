import { useState, useEffect } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { pricingService } from "@/services/pricingService";
import type { LocationPricingFormData } from "@/types/pricing";
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

// Nepal Provinces
const NEPAL_PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

export default function LocationPricingForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isEditMode = !!id;
  const returnTab = (searchParams.get("returnTo") ||
    getPricingSectionTab(location.pathname)) as PricingSectionTab;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LocationPricingFormData>({
    city: "",
    state: "",
    area_type: "city",
    base_price: "50.00",
    price_multiplier: "1.00",
    is_active: true,
  });

  useEffect(() => {
    if (isEditMode) {
      loadLocation();
    }
  }, [id]);

  const loadLocation = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await pricingService.getLocationPricing(parseInt(id));
      if (response.IsSuccess && response.Result) {
        const location = response.Result;
        setFormData({
          city: location.city,
          state: location.state,
          area_type: location.area_type,
          base_price: location.base_price,
          price_multiplier: location.price_multiplier,
          is_active: location.is_active,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.ErrorMessage || "Failed to load location",
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
        const response = await pricingService.updateLocationPricing(
          parseInt(id),
          formData,
        );
        if (response.IsSuccess) {
          toast({
            title: "Success",
            description: "Location updated successfully",
          });
          navigate(`/admin/pricing?tab=${returnTab}`);
        }
      } else {
        const response = await pricingService.createLocationPricing(formData);
        if (response.IsSuccess) {
          toast({
            title: "Success",
            description: "Location created successfully",
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
            : errorMsg || "Failed to save location",
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
            {isEditMode ? "Edit Location" : "Add New Location"}
          </CardTitle>
          <CardDescription>Configure location-based pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  City *
                </Label>
                <Input
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="e.g., Kathmandu"
                  className={ADMIN_FORM_CONTROL_CLASS}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium">
                  State/Province *
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) =>
                    setFormData({ ...formData, state: value })
                  }
                >
                  <SelectTrigger className={ADMIN_FORM_SELECT_TRIGGER_CLASS}>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {NEPAL_PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area_type" className="text-sm font-medium">
                Area Type *
              </Label>
              <Select
                value={formData.area_type}
                onValueChange={(value: "city" | "regional") =>
                  setFormData({ ...formData, area_type: value })
                }
              >
                <SelectTrigger className={ADMIN_FORM_SELECT_TRIGGER_CLASS}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="city">City</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_price" className="text-sm font-medium">
                  Base Price (NPR) *
                </Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  required
                  value={formData.base_price}
                  onChange={(e) =>
                    setFormData({ ...formData, base_price: e.target.value })
                  }
                  placeholder="e.g., 50.00"
                  className={ADMIN_FORM_CONTROL_CLASS}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="price_multiplier"
                  className="text-sm font-medium"
                >
                  Price Multiplier *
                </Label>
                <Input
                  id="price_multiplier"
                  type="number"
                  step="0.01"
                  required
                  value={formData.price_multiplier}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price_multiplier: e.target.value,
                    })
                  }
                  placeholder="e.g., 1.00"
                  className={ADMIN_FORM_CONTROL_CLASS}
                />
              </div>
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
                {isEditMode ? "Update" : "Create"} Location
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
