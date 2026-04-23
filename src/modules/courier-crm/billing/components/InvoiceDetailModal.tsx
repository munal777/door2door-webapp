import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Receipt,
  Building,
  Calendar,
  Package,
  Download,
} from "lucide-react";
import { billingService } from "@/services/billingService";
import type { InvoiceDetail } from "@/types/billing";

interface InvoiceDetailModalProps {
  invoiceNumber: string;
  open: boolean;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  issued: "bg-blue-100 text-blue-800 border-blue-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function InvoiceDetailModal({
  invoiceNumber,
  open,
  onClose,
}: InvoiceDetailModalProps) {
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && invoiceNumber) {
      fetchInvoiceDetail();
    } else {
      setInvoice(null);
      setError(null);
    }
  }, [open, invoiceNumber]);

  const fetchInvoiceDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await billingService.getInvoiceByNumber(invoiceNumber);
      setInvoice(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load invoice details",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
    }).format(parseFloat(amount));
  };

  const getStatusColor = (status: string): string => {
    return (
      statusColors[status.toLowerCase()] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden print:w-full print:max-w-none print:shadow-none print:border-none print:p-8">
        {isLoading ? (
          <div className="p-12 flex justify-center items-center flex-col">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500">Loading invoice details...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
              <Receipt className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        ) : invoice ? (
          <div className="flex flex-col h-full max-h-[90vh]">
            <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50 print:hidden">
              <div className="flex justify-between items-center">
                <div>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-blue-600" />
                    Invoice {invoice.invoice_number}
                  </DialogTitle>
                  <DialogDescription>
                    Generated on{" "}
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </DialogDescription>
                </div>
                <Badge
                  variant="outline"
                  className={`px-3 py-1 text-sm ${getStatusColor(invoice.status)}`}
                >
                  {invoice.status.toUpperCase()}
                </Badge>
              </div>
            </DialogHeader>

            <div className="px-8 py-6 overflow-y-auto print:overflow-visible">
              <div className="flex justify-between items-start mb-8 border-b pb-6 print:border-black">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1 print:text-black">
                    INVOICE
                  </h2>
                  <p className="text-gray-500 text-sm print:text-gray-800">
                    #{invoice.invoice_number}
                  </p>

                  <div className="mt-4 hidden print:block">
                    <Badge
                      variant="outline"
                      className={`px-2 py-0.5 text-xs ${getStatusColor(invoice.status)}`}
                    >
                      {invoice.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 text-gray-900 font-semibold mb-1 print:text-black">
                    <Building className="h-4 w-4 text-gray-400" />
                    {invoice.courier_provider_name}
                  </div>
                  <div className="text-sm text-gray-500 flex flex-col items-end gap-1 mt-3 print:text-gray-800">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Issue Date:{" "}
                      {invoice.issue_date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 mb-8 border border-gray-100 print:border-black print:bg-white">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 border-b pb-2 print:text-black">
                  ASSOCIATED ORDER
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 print:text-gray-600">
                      Order ID
                    </p>
                    <p className="font-medium flex items-center gap-1.5 text-blue-700 print:text-black">
                      <Package className="h-4 w-4" />
                      {invoice.order_number}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 print:text-gray-600">
                      Quantity: {invoice.total_quantity}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 border-t pt-4 print:border-black">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 print:text-gray-600">
                      Sender Details
                    </p>
                    <p className="font-medium text-gray-900 print:text-black">
                      {invoice.sender_name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 print:text-gray-800">
                      {invoice.sender_address}, {invoice.sender_city}
                    </p>
                    <p className="text-sm text-gray-600 print:text-gray-800">
                      {invoice.sender_phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 print:text-gray-600">
                      Receiver Details
                    </p>
                    <p className="font-medium text-gray-900 print:text-black">
                      {invoice.receiver_name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 print:text-gray-800">
                      {invoice.receiver_address}, {invoice.receiver_city}
                    </p>
                    <p className="text-sm text-gray-600 print:text-gray-800">
                      {invoice.receiver_phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <table className="w-full text-sm print:text-black">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left font-semibold text-gray-600 py-3 print:text-gray-800">
                        Description
                      </th>
                      <th className="text-center font-semibold text-gray-600 py-3 print:text-gray-800 w-24">
                        Qty
                      </th>
                      <th className="text-right font-semibold text-gray-600 py-3 print:text-gray-800">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 text-gray-800">
                        Courier delivery charges for order{" "}
                        {invoice.order_number}
                      </td>
                      <td className="py-4 text-center text-gray-700 font-medium">
                        {invoice.total_quantity}
                      </td>
                      <td className="py-4 text-right font-medium text-gray-900">
                        {formatCurrency(invoice.total_amount)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        colSpan={2}
                        className="pt-6 pb-2 text-right font-semibold text-gray-600"
                      >
                        Total
                      </td>
                      <td className="pt-6 pb-2 text-right text-lg font-bold text-gray-900">
                        {formatCurrency(invoice.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-lg print:hidden">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF / Print
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
