import { useState } from "react";
import { orderService } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationTypeahead } from "@/components/ui/location-typeahead";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Package,
  User,
  MapPin,
} from "lucide-react";
import type { CreateOrderData } from "@/types/order";

interface CreateOrderFormProps {
  onSuccess?: () => void;
}

export default function CreateOrderForm({ onSuccess }: CreateOrderFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Display values for the typeaheads
  const [senderLocationDisplay, setSenderLocationDisplay] = useState("");
  const [receiverLocationDisplay, setReceiverLocationDisplay] = useState("");

  const [formData, setFormData] = useState<CreateOrderData>({
    service_type: "standard",
    sender_name: "",
    sender_phone: "",
    sender_email: "",
    sender_address: "",
    sender_city: "",
    sender_state: "",
    receiver_name: "",
    receiver_phone: "",
    receiver_email: "",
    receiver_address: "",
    receiver_city: "",
    receiver_state: "",
    package_type: "package",
    weight: 0,
    total_quantity: 1,
    length: undefined,
    width: undefined,
    height: undefined,
    package_description: "",
    payment_method: "cod",
    payment_status: "pending",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const numericFields = ["weight", "length", "width", "height"];
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "total_quantity"
          ? Math.max(1, parseInt(value, 10) || 1)
          : numericFields.includes(name)
            ? parseFloat(value) || undefined
            : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSenderLocationSelect = (location: {
    city: string;
    state: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      sender_city: location.city,
      sender_state: location.state,
    }));
    if (location.city && location.state) {
      setSenderLocationDisplay(`${location.city}, ${location.state}`);
    } else {
      setSenderLocationDisplay("");
    }
  };

  const handleReceiverLocationSelect = (location: {
    city: string;
    state: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      receiver_city: location.city,
      receiver_state: location.state,
    }));
    if (location.city && location.state) {
      setReceiverLocationDisplay(`${location.city}, ${location.state}`);
    } else {
      setReceiverLocationDisplay("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      await orderService.createOrder(formData);
      setSuccess(true);

      // Reset form and display values
      setFormData({
        service_type: "standard",
        sender_name: "",
        sender_phone: "",
        sender_email: "",
        sender_address: "",
        sender_city: "",
        sender_state: "",
        receiver_name: "",
        receiver_phone: "",
        receiver_email: "",
        receiver_address: "",
        receiver_city: "",
        receiver_state: "",
        package_type: "package",
        weight: 0,
        total_quantity: 1,
        length: undefined,
        width: undefined,
        height: undefined,
        package_description: "",
        payment_method: "cod",
        payment_status: "pending",
      });
      setSenderLocationDisplay("");
      setReceiverLocationDisplay("");

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setIsLoading(false);
    }
  };

  const fieldInputClass =
    "h-9 border-border/70 bg-background text-sm shadow-sm focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/15";
  const fieldSelectClass =
    "h-9 border-border/70 bg-background shadow-sm focus:border-primary/60 focus:ring-2 focus:ring-primary/15";
  const fieldTextareaClass =
    "min-h-15 resize-none border-border/70 bg-background text-sm shadow-sm focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/15";

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Quick Order Entry</CardTitle>
        <CardDescription>
          Fast order creation for walk-in customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Order created successfully!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Service Type & Payment Type - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
            <div className="space-y-1.5">
              <Label htmlFor="service_type" className="text-sm font-medium">
                Service Type *
              </Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) =>
                  handleSelectChange("service_type", value)
                }
              >
                <SelectTrigger className={fieldSelectClass}>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent className="border-border/70">
                  <SelectItem value="standard">Standard Delivery</SelectItem>
                  <SelectItem value="express">Express Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment_method" className="text-sm font-medium">
                Payment Type *
              </Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) =>
                  handleSelectChange("payment_method", value)
                }
              >
                <SelectTrigger className={fieldSelectClass}>
                  <SelectValue placeholder="Select payment" />
                </SelectTrigger>
                <SelectContent className="border-border/70">
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                  <SelectItem value="esewa">eSewa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sender & Receiver - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Sender Information */}
            <div className="space-y-3 p-4 rounded-lg border border-border/60 bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-500 rounded">
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Sender Details
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sender_name" className="text-xs">
                    Name *
                  </Label>
                  <Input
                    id="sender_name"
                    name="sender_name"
                    value={formData.sender_name}
                    onChange={handleInputChange}
                    required
                    className={fieldInputClass}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sender_phone" className="text-xs">
                    Phone *
                  </Label>
                  <Input
                    id="sender_phone"
                    name="sender_phone"
                    value={formData.sender_phone}
                    onChange={handleInputChange}
                    required
                    className={fieldInputClass}
                    placeholder="Contact number"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sender_email" className="text-xs">
                  Email
                </Label>
                <Input
                  id="sender_email"
                  name="sender_email"
                  type="email"
                  value={formData.sender_email}
                  onChange={handleInputChange}
                  className={fieldInputClass}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sender_address" className="text-xs">
                  Address *
                </Label>
                <Textarea
                  id="sender_address"
                  name="sender_address"
                  value={formData.sender_address}
                  onChange={handleInputChange}
                  required
                  className={fieldTextareaClass}
                  placeholder="Street address"
                />
              </div>

              <div className="space-y-1.5">
                <LocationTypeahead
                  id="sender_location"
                  label="Location"
                  value={senderLocationDisplay}
                  onLocationSelect={handleSenderLocationSelect}
                  placeholder="City name (e.g., Kathmandu)"
                  required
                  inputClassName={fieldInputClass}
                />
              </div>
            </div>

            {/* Receiver Information */}
            <div className="space-y-3 p-4 rounded-lg border border-border/60 bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-green-500 rounded">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Receiver Details
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="receiver_name" className="text-xs">
                    Name *
                  </Label>
                  <Input
                    id="receiver_name"
                    name="receiver_name"
                    value={formData.receiver_name}
                    onChange={handleInputChange}
                    required
                    className={fieldInputClass}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="receiver_phone" className="text-xs">
                    Phone *
                  </Label>
                  <Input
                    id="receiver_phone"
                    name="receiver_phone"
                    value={formData.receiver_phone}
                    onChange={handleInputChange}
                    required
                    className={fieldInputClass}
                    placeholder="Contact number"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="receiver_email" className="text-xs">
                  Email
                </Label>
                <Input
                  id="receiver_email"
                  name="receiver_email"
                  type="email"
                  value={formData.receiver_email}
                  onChange={handleInputChange}
                  className={fieldInputClass}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="receiver_address" className="text-xs">
                  Address *
                </Label>
                <Textarea
                  id="receiver_address"
                  name="receiver_address"
                  value={formData.receiver_address}
                  onChange={handleInputChange}
                  required
                  className={fieldTextareaClass}
                  placeholder="Street address"
                />
              </div>

              <div className="space-y-1.5">
                <LocationTypeahead
                  id="receiver_location"
                  label="Location"
                  value={receiverLocationDisplay}
                  onLocationSelect={handleReceiverLocationSelect}
                  placeholder="City name (e.g., Pokhara)"
                  required
                  inputClassName={fieldInputClass}
                />
              </div>
            </div>
          </div>

          {/* Package Information - Compact Grid */}
          <div className="space-y-3 p-4 rounded-lg border border-border/60 bg-muted/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-amber-500 rounded">
                <Package className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Package Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="package_type" className="text-xs">
                  Type *
                </Label>
                <Select
                  value={formData.package_type}
                  onValueChange={(value) =>
                    handleSelectChange("package_type", value)
                  }
                >
                  <SelectTrigger className={`${fieldSelectClass} text-sm`}>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="border-border/70">
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="package">Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="weight" className="text-xs">
                  Weight (kg) *
                </Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weight}
                  onChange={handleInputChange}
                  required
                  className={fieldInputClass}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="total_quantity" className="text-xs">
                  Quantity *
                </Label>
                <Input
                  id="total_quantity"
                  name="total_quantity"
                  type="number"
                  step="1"
                  min="1"
                  value={formData.total_quantity}
                  onChange={handleInputChange}
                  required
                  className={fieldInputClass}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-md border border-dashed border-border/60 bg-background/70 p-3">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Optional Details
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add dimensions and description only when needed.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="length" className="text-xs">
                    Length (cm)
                  </Label>
                  <Input
                    id="length"
                    name="length"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.length || ""}
                    onChange={handleInputChange}
                    className={fieldInputClass}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="width" className="text-xs">
                    Width (cm)
                  </Label>
                  <Input
                    id="width"
                    name="width"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.width || ""}
                    onChange={handleInputChange}
                    className={fieldInputClass}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="height" className="text-xs">
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.height || ""}
                    onChange={handleInputChange}
                    className={fieldInputClass}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="package_description" className="text-xs">
                    Description
                  </Label>
                  <Input
                    id="package_description"
                    name="package_description"
                    value={formData.package_description}
                    onChange={handleInputChange}
                    className={fieldInputClass}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-10"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Order...
                </>
              ) : (
                "Create Order"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
