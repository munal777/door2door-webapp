import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { riderService } from "@/services/riderService";
import type {
  ActiveRiderAssignment,
  AssignableOnlineOrder,
  AssignOrderToRiderData,
  CourierRider,
} from "@/types/rider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Bike,
  CheckCircle2,
  Loader2,
  SendHorizontal,
  UserRound,
} from "lucide-react";

export default function RiderOrdersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [riders, setRiders] = useState<CourierRider[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<
    ActiveRiderAssignment[]
  >([]);
  const [assignableOrders, setAssignableOrders] = useState<
    AssignableOnlineOrder[]
  >([]);

  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>("");
  const [selectedRiderId, setSelectedRiderId] = useState<string>("");
  const [notes, setNotes] = useState("");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
    }).format(amount);

  const availableRiders = useMemo(
    () =>
      riders.filter(
        (rider) =>
          rider.operational_status === "active" &&
          rider.availability_status === "available",
      ),
    [riders],
  );

  const selectedOrder = useMemo(
    () =>
      assignableOrders.find(
        (order) => order.order_number === selectedOrderNumber,
      ) || null,
    [assignableOrders, selectedOrderNumber],
  );

  const loadData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const [riderList, assignmentList, onlineOrders] = await Promise.all([
        riderService.getRiders(),
        riderService.getActiveAssignments(),
        riderService.getAssignableOnlineOrders(),
      ]);
      setRiders(riderList);
      setActiveAssignments(assignmentList);
      setAssignableOrders(onlineOrders);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load rider data",
        description:
          error instanceof Error
            ? error.message
            : "Could not load riders and assignments",
      });
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  const handleAssignOrder = async () => {
    if (!selectedOrderNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Order required",
        description: "Select an online order to assign.",
      });
      return;
    }

    if (!selectedRiderId) {
      toast({
        variant: "destructive",
        title: "Rider required",
        description: "Select a rider before assigning.",
      });
      return;
    }

    setAssigning(true);
    try {
      const payload: AssignOrderToRiderData = {
        rider_id: Number(selectedRiderId),
        notes: notes.trim() || undefined,
      };

      const result = await riderService.assignOnlineOrderToRider(
        selectedOrderNumber.trim(),
        payload,
      );

      toast({
        title: "Order assigned",
        description: `${result.order_number} assigned to ${result.rider_name}.`,
      });

      setSelectedOrderNumber("");
      setSelectedRiderId("");
      setNotes("");
      await loadData(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Assignment failed",
        description:
          error instanceof Error ? error.message : "Unable to assign order",
      });
    } finally {
      setAssigning(false);
    }
  };

  const getAvailabilityBadge = (status: string) => {
    if (status === "available") {
      return (
        <Badge className="bg-emerald-100 text-emerald-700">Available</Badge>
      );
    }
    if (status === "busy") {
      return <Badge className="bg-amber-100 text-amber-700">Busy</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getOperationalBadge = (status: string) => {
    if (status === "active") {
      return <Badge className="bg-blue-100 text-blue-700">Active</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Rider Orders</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Assign confirmed online orders and monitor active rider deliveries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardDescription>Total Riders</CardDescription>
            <CardTitle className="text-2xl">{riders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardDescription>Active Riders</CardDescription>
            <CardTitle className="text-2xl">
              {riders.filter((r) => r.operational_status === "active").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardDescription>Available Riders</CardDescription>
            <CardTitle className="text-2xl">{availableRiders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardDescription>Online Orders Ready</CardDescription>
            <CardTitle className="text-2xl">
              {assignableOrders.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <SendHorizontal className="h-5 w-5" />
              Assign Order
            </CardTitle>
            <CardDescription>
              Select an online order with shipment details, then assign the best
              rider.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Online Order</Label>
              <Select
                value={selectedOrderNumber}
                onValueChange={setSelectedOrderNumber}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose online order" />
                </SelectTrigger>
                <SelectContent>
                  {assignableOrders.map((order) => (
                    <SelectItem
                      key={order.order_number}
                      value={order.order_number}
                    >
                      {order.order_number} • {order.sender_city} →{" "}
                      {order.receiver_city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOrder && (
              <div className="rounded-md border bg-muted/30 p-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">
                    {selectedOrder.order_number}
                  </span>
                  <Badge variant="outline">
                    {selectedOrder.status_display}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {selectedOrder.sender_city}, {selectedOrder.sender_state} →{" "}
                  {selectedOrder.receiver_city}, {selectedOrder.receiver_state}
                </p>
                <p className="text-muted-foreground">
                  {selectedOrder.package_type_display} • {selectedOrder.weight}{" "}
                  kg • {selectedOrder.service_type_display}
                </p>
                <p className="text-muted-foreground">
                  Est. Price: {formatCurrency(selectedOrder.total_price)}
                </p>
                {selectedOrder.active_rider_name && (
                  <p className="text-amber-700">
                    Currently assigned to: {selectedOrder.active_rider_name}
                  </p>
                )}
                {selectedOrder.package_description && (
                  <p className="text-muted-foreground">
                    Note: {selectedOrder.package_description}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Select Rider</Label>
              <Select
                value={selectedRiderId}
                onValueChange={setSelectedRiderId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose rider" />
                </SelectTrigger>
                <SelectContent>
                  {availableRiders.map((rider) => (
                    <SelectItem key={rider.id} value={String(rider.id)}>
                      {rider.full_name} • {rider.vehicle_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment-notes">Notes (optional)</Label>
              <Textarea
                id="assignment-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Pickup priority, handling notes, etc."
                rows={3}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleAssignOrder}
              disabled={assigning || loading}
            >
              {assigning ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Assign Order
            </Button>

            {assignableOrders.length === 0 && !loading && (
              <p className="text-xs text-muted-foreground">
                No eligible online orders are currently available for rider
                assignment.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bike className="h-5 w-5" />
              Rider Pool
            </CardTitle>
            <CardDescription>
              Current riders with operational and availability status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 flex items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading riders...
              </div>
            ) : riders.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                No riders available.
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rider</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Operational</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riders.map((rider) => (
                      <TableRow key={rider.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <UserRound className="h-4 w-4 text-muted-foreground" />
                            {rider.full_name}
                          </div>
                        </TableCell>
                        <TableCell>{rider.phone_number}</TableCell>
                        <TableCell>
                          {rider.vehicle_type} • {rider.vehicle_number}
                        </TableCell>
                        <TableCell>
                          {getOperationalBadge(rider.operational_status)}
                        </TableCell>
                        <TableCell>
                          {getAvailabilityBadge(rider.availability_status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/courier/management/riders/${rider.id}`)
                            }
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Assignments</CardTitle>
          <CardDescription>
            Orders currently assigned and in-progress with riders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex items-center justify-center text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading assignments...
            </div>
          ) : activeAssignments.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No active assignments yet.
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Rider</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned At</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.order_number}
                      </TableCell>
                      <TableCell>{assignment.rider_name}</TableCell>
                      <TableCell>{assignment.rider_phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {assignment.order_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(assignment.assigned_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-64 truncate">
                        {assignment.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
