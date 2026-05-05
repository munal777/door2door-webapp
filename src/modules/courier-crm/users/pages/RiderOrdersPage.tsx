import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { riderService } from "@/services/riderService";
import type {
  ActiveRiderAssignment,
  AssignableOnlineOrder,
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
  Package,
  SendHorizontal,
  UserRound,
  MapPin,
} from "lucide-react";

export default function RiderOrdersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [riders, setRiders] = useState<CourierRider[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<ActiveRiderAssignment[]>([]);
  const [assignableOrders, setAssignableOrders] = useState<AssignableOnlineOrder[]>([]);

  const [assignmentType, setAssignmentType] = useState<"pickup" | "delivery">("pickup");
  const [selectedOrderNumbers, setSelectedOrderNumbers] = useState<string[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState<string>("");
  const [notes, setNotes] = useState("");

  const availableRiders = useMemo(
    () =>
      riders.filter(
        (rider) =>
          rider.operational_status === "active" &&
          rider.availability_status === "available",
      ),
    [riders],
  );

  const selectedRider = useMemo(
    () => riders.find((r) => String(r.id) === selectedRiderId) || null,
    [riders, selectedRiderId],
  );

  const loadData = async (silent = false, type = assignmentType) => {
    if (!silent) setLoading(true);
    try {
      const [riderList, assignmentList, orders] = await Promise.all([
        riderService.getRiders(),
        riderService.getActiveAssignments(),
        riderService.getAssignableOnlineOrders({ type }),
      ]);
      setRiders(riderList);
      setActiveAssignments(assignmentList);
      setAssignableOrders(orders);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load data",
        description: error instanceof Error ? error.message : "Error loading data",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false, assignmentType);
    setSelectedOrderNumbers([]); // Clear selection when type changes
  }, [assignmentType]);

  const toggleOrderSelection = (orderNumber: string) => {
    setSelectedOrderNumbers((prev) =>
      prev.includes(orderNumber)
        ? prev.filter((n) => n !== orderNumber)
        : [...prev, orderNumber]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrderNumbers.length === assignableOrders.length) {
      setSelectedOrderNumbers([]);
    } else {
      setSelectedOrderNumbers(assignableOrders.map((o) => o.order_number));
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedRiderId) {
      toast({ variant: "destructive", title: "Rider required", description: "Select a rider first." });
      return;
    }
    if (selectedOrderNumbers.length === 0) {
      toast({ variant: "destructive", title: "Orders required", description: "Select at least one parcel." });
      return;
    }

    setAssigning(true);
    try {
      await riderService.bulkAssignOrders({
        rider_id: Number(selectedRiderId),
        order_numbers: selectedOrderNumbers,
        notes: notes.trim() || undefined,
      });

      toast({
        title: "Success",
        description: `Assigned ${selectedOrderNumbers.length} parcels to ${selectedRider?.full_name}.`,
      });

      setSelectedOrderNumbers([]);
      setNotes("");
      await loadData(true);
    } catch (error) {
      toast({
        variant_dest: "destructive",
        title: "Assignment failed",
        description: error instanceof Error ? error.message : "Error assigning orders",
      } as any);
    } finally {
      setAssigning(false);
    }
  };

  const getAvailabilityBadge = (status: string) => {
    if (status === "available") return <Badge className="bg-emerald-100 text-emerald-700">Available</Badge>;
    if (status === "busy") return <Badge className="bg-amber-100 text-amber-700">Busy</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dispatch Control</h1>
          <p className="text-muted-foreground mt-1">
            Streamlined bulk assignment workflow for efficient last-mile delivery.
          </p>
        </div>
        <div className="flex bg-muted p-1 rounded-lg">
          <Button
            variant={assignmentType === "pickup" ? "default" : "ghost"}
            size="sm"
            className="px-6"
            onClick={() => setAssignmentType("pickup")}
          >
            Pickup
          </Button>
          <Button
            variant={assignmentType === "delivery" ? "default" : "ghost"}
            size="sm"
            className="px-6"
            onClick={() => setAssignmentType("delivery")}
          >
            Delivery
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar: Rider Selection */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="sticky top-6 border-primary/10 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Bike className="h-5 w-5 text-primary" />
                1. Select Rider
              </CardTitle>
              <CardDescription>Choose an available rider to receive parcels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Rider Pool ({availableRiders.length} Available)</Label>
                <Select value={selectedRiderId} onValueChange={setSelectedRiderId}>
                  <SelectTrigger className="h-12 border-primary/20 bg-primary/5">
                    <SelectValue placeholder="Choose a rider..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRiders.map((rider) => (
                      <SelectItem key={rider.id} value={String(rider.id)}>
                        <div className="flex flex-col">
                          <span className="font-medium">{rider.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {rider.vehicle_type} • {rider.vehicle_number}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRider && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <UserRound className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold leading-none">{selectedRider.full_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedRider.phone_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getAvailabilityBadge(selectedRider.availability_status)}
                    <Badge variant="outline">{selectedRider.vehicle_type}</Badge>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <Label htmlFor="assignment-notes">Notes (Optional)</Label>
                <Textarea
                  id="assignment-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions..."
                  rows={3}
                  className="resize-none border-2 border-primary/20 focus:border-primary focus-visible:ring-primary/20 shadow-sm transition-all"
                />
              </div>

              <div className="pt-4 border-t border-dashed">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">Parcels Selected:</span>
                  <span className="text-xl font-bold text-primary">{selectedOrderNumbers.length}</span>
                </div>
                <Button
                  className="w-full h-12 text-lg shadow-xl"
                  onClick={handleBulkAssign}
                  disabled={assigning || loading || selectedOrderNumbers.length === 0}
                >
                  {assigning ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <SendHorizontal className="h-5 w-5 mr-2" />
                  )}
                  Assign to Rider
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Parcel Selection */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Package className="h-5 w-5 text-primary" />
                  2. Select Parcels
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-12 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 accent-primary"
                          checked={assignableOrders.length > 0 && selectedOrderNumbers.length === assignableOrders.length}
                          onChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Order Info</TableHead>
                      <TableHead>Location Details</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                          Loading assignable orders...
                        </TableCell>
                      </TableRow>
                    ) : assignableOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                          No {assignmentType} orders found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignableOrders.map((order) => (
                        <TableRow 
                          key={order.id} 
                          className={`cursor-pointer transition-colors hover:bg-muted/30 ${selectedOrderNumbers.includes(order.order_number) ? 'bg-primary/5' : ''}`}
                          onClick={() => toggleOrderSelection(order.order_number)}
                        >
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 accent-primary"
                              checked={selectedOrderNumbers.includes(order.order_number)}
                              onChange={() => toggleOrderSelection(order.order_number)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-bold text-primary">{order.order_number}</span>
                              <span className="text-xs text-muted-foreground">{order.order_type_display}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-start gap-1 text-sm">
                                <MapPin className="h-3.5 w-3.5 mt-0.5 text-rose-500 shrink-0" />
                                <span className="line-clamp-1">
                                  <span className="font-medium">{order.sender_city}</span>: {order.sender_address}
                                </span>
                              </div>
                              <div className="flex items-start gap-1 text-sm opacity-70">
                                <MapPin className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />
                                <span className="line-clamp-1">
                                  <span className="font-medium">{order.receiver_city}</span>: {order.receiver_address}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{order.package_type_display}</span>
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                {order.service_type_display}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-tighter">
                              {order.status_display}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-none shadow-none bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Active Rider Operations
          </CardTitle>
          <CardDescription>
            Monitor orders currently assigned to your rider fleet.
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
            <div className="rounded-xl border bg-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Rider</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned At</TableHead>
                    <TableHead>Instructions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-bold text-primary">
                        {assignment.order_number}
                      </TableCell>
                      <TableCell className="font-medium">{assignment.rider_name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{assignment.rider_phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {assignment.order_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(assignment.assigned_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-64 truncate text-xs">
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
