import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { pricingService } from "@/services/pricingService";
import type {
  WeightSlab,
  ServiceTypePricing,
  LocationPricing,
} from "@/types/pricing";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Truck,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { type PricingSectionTab } from "@/modules/platform-admin/pricing/utils/pricingNavigation";

export default function PricingManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [weightSlabs, setWeightSlabs] = useState<WeightSlab[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypePricing[]>([]);
  const [locations, setLocations] = useState<LocationPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const activeTab = (searchParams.get("tab") ||
    "weight-slabs") as PricingSectionTab;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
      return;
    }

    if (
      !user ||
      (user.user_type !== "admin" && user.user_type !== "superadmin")
    ) {
      navigate("/admin/login");
      return;
    }

    loadAllPricingData();
  }, [navigate, isAuthenticated, user]);

  const loadAllPricingData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadWeightSlabs(),
        loadServiceTypes(),
        loadLocations(),
      ]);
    } catch (error) {
      console.error("Error loading pricing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeightSlabs = async () => {
    try {
      const response = await pricingService.getWeightSlabs();
      if (response.IsSuccess && response.Result) {
        setWeightSlabs(response.Result);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.ErrorMessage || "Failed to load weight slabs",
      });
    }
  };

  const loadServiceTypes = async () => {
    try {
      const response = await pricingService.getServiceTypePricings();
      if (response.IsSuccess && response.Result) {
        setServiceTypes(response.Result);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.ErrorMessage || "Failed to load service types",
      });
    }
  };

  const loadLocations = async () => {
    try {
      const response = await pricingService.getLocationPricings();
      if (response.IsSuccess && response.Result) {
        setLocations(response.Result);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.ErrorMessage || "Failed to load locations",
      });
    }
  };

  const handleDeleteWeightSlab = async (id: number) => {
    if (!confirm("Are you sure you want to delete this weight slab?")) return;

    try {
      const response = await pricingService.deleteWeightSlab(id);
      if (response.IsSuccess) {
        toast({
          title: "Success",
          description: "Weight slab deleted successfully",
        });
        loadWeightSlabs();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.ErrorMessage || "Failed to delete weight slab",
      });
    }
  };

  const handleDeleteServiceType = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service type?")) return;

    try {
      const response = await pricingService.deleteServiceTypePricing(id);
      if (response.IsSuccess) {
        toast({
          title: "Success",
          description: "Service type deleted successfully",
        });
        loadServiceTypes();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.ErrorMessage || "Failed to delete service type",
      });
    }
  };

  const handleDeleteLocation = async (id: number) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      const response = await pricingService.deleteLocationPricing(id);
      if (response.IsSuccess) {
        toast({
          title: "Success",
          description: "Location deleted successfully",
        });
        loadLocations();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.ErrorMessage || "Failed to delete location",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Pricing Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage weight slabs, service types, and location pricing
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setSearchParams({ tab: value })}
      >
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
          <TabsTrigger value="weight-slabs" className="text-xs sm:text-sm">
            <Package className="h-4 w-4 mr-2" />
            Weight Slabs
          </TabsTrigger>
          <TabsTrigger value="service-types" className="text-xs sm:text-sm">
            <Truck className="h-4 w-4 mr-2" />
            Service Types
          </TabsTrigger>
          <TabsTrigger value="locations" className="text-xs sm:text-sm">
            <MapPin className="h-4 w-4 mr-2" />
            Locations
          </TabsTrigger>
        </TabsList>

        {/* Weight Slabs Tab */}
        <TabsContent value="weight-slabs" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">
                    Weight Slabs
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Manage weight-based pricing slabs for packages
                  </CardDescription>
                </div>
                <Button
                  className="w-full sm:w-auto text-xs sm:text-sm"
                  onClick={() =>
                    navigate(
                      `/admin/pricing/weight-slabs/new?returnTo=${activeTab}`,
                    )
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Weight Slab
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Package Type</TableHead>
                      <TableHead>Up To Weight</TableHead>
                      <TableHead>Dimensions</TableHead>
                      <TableHead>Extra Charge</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weightSlabs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No weight slabs found. Add one to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      weightSlabs.map((slab) => (
                        <TableRow key={slab.id}>
                          <TableCell className="font-medium capitalize">
                            {slab.package_type}
                          </TableCell>
                          <TableCell>{slab.up_to_weight} kg</TableCell>
                          <TableCell>
                            {slab.length && slab.width && slab.height
                              ? `${slab.length}×${slab.width}×${slab.height} cm`
                              : "—"}
                          </TableCell>
                          <TableCell>NPR {slab.extra_charge}</TableCell>
                          <TableCell>
                            <Badge
                              variant={slab.is_active ? "default" : "secondary"}
                            >
                              {slab.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/admin/pricing/weight-slabs/${slab.id}/edit?returnTo=${activeTab}`,
                                  )
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteWeightSlab(slab.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {weightSlabs.length === 0 ? (
                  <p className="text-center py-8 text-sm text-muted-foreground">
                    No weight slabs found. Add one to get started.
                  </p>
                ) : (
                  weightSlabs.map((slab) => (
                    <Card key={slab.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-sm capitalize">
                              {slab.package_type}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Up to {slab.up_to_weight} kg
                            </p>
                          </div>
                          <Badge
                            variant={slab.is_active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {slab.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="space-y-2 mb-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Dimensions:
                            </span>
                            <span className="font-medium">
                              {slab.length && slab.width && slab.height
                                ? `${slab.length}×${slab.width}×${slab.height} cm`
                                : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Extra Charge:
                            </span>
                            <span className="font-medium">
                              NPR {slab.extra_charge}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() =>
                              navigate(
                                `/admin/pricing/weight-slabs/${slab.id}/edit?returnTo=${activeTab}`,
                              )
                            }
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleDeleteWeightSlab(slab.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Types Tab */}
        <TabsContent value="service-types" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">
                    Service Type Pricing
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Manage pricing multipliers for different service types
                  </CardDescription>
                </div>
                <Button
                  className="w-full sm:w-auto text-xs sm:text-sm"
                  onClick={() =>
                    navigate(
                      `/admin/pricing/service-types/new?returnTo=${activeTab}`,
                    )
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service Type
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Delivery Hours</TableHead>
                      <TableHead>Price Multiplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceTypes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No service types found. Add one to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      serviceTypes.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium capitalize">
                            {service.service_type}
                          </TableCell>
                          <TableCell>
                            {service.estimated_delivery_hours} hours
                          </TableCell>
                          <TableCell>{service.price_multiplier}x</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                service.is_active ? "default" : "secondary"
                              }
                            >
                              {service.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/admin/pricing/service-types/${service.id}/edit?returnTo=${activeTab}`,
                                  )
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleDeleteServiceType(service.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {serviceTypes.length === 0 ? (
                  <p className="text-center py-8 text-sm text-muted-foreground">
                    No service types found. Add one to get started.
                  </p>
                ) : (
                  serviceTypes.map((service) => (
                    <Card key={service.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-sm capitalize">
                              {service.service_type}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {service.estimated_delivery_hours} hours delivery
                            </p>
                          </div>
                          <Badge
                            variant={
                              service.is_active ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {service.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="mb-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Price Multiplier:
                            </span>
                            <span className="font-medium">
                              {service.price_multiplier}x
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() =>
                              navigate(
                                `/admin/pricing/service-types/${service.id}/edit?returnTo=${activeTab}`,
                              )
                            }
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleDeleteServiceType(service.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">
                    Location Pricing
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Manage location-based pricing
                  </CardDescription>
                </div>
                <Button
                  className="w-full sm:w-auto text-xs sm:text-sm"
                  onClick={() =>
                    navigate(
                      `/admin/pricing/locations/new?returnTo=${activeTab}`,
                    )
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Area Type</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Price Multiplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No locations found. Add one to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      locations.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell className="font-medium">
                            {location.city}
                          </TableCell>
                          <TableCell>{location.state}</TableCell>
                          <TableCell className="capitalize">
                            {location.area_type}
                          </TableCell>
                          <TableCell>NPR {location.base_price}</TableCell>
                          <TableCell>{location.price_multiplier}x</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                location.is_active ? "default" : "secondary"
                              }
                            >
                              {location.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/admin/pricing/locations/${location.id}/edit?returnTo=${activeTab}`,
                                  )
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleDeleteLocation(location.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {locations.length === 0 ? (
                  <p className="text-center py-8 text-sm text-muted-foreground">
                    No locations found. Add one to get started.
                  </p>
                ) : (
                  locations.map((location) => (
                    <Card key={location.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-sm">
                              {location.city}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {location.state} • {location.area_type}
                            </p>
                          </div>
                          <Badge
                            variant={
                              location.is_active ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {location.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="space-y-2 mb-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Base Price:
                            </span>
                            <span className="font-medium">
                              NPR {location.base_price}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Multiplier:
                            </span>
                            <span className="font-medium">
                              {location.price_multiplier}x
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() =>
                              navigate(
                                `/admin/pricing/locations/${location.id}/edit?returnTo=${activeTab}`,
                              )
                            }
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleDeleteLocation(location.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
