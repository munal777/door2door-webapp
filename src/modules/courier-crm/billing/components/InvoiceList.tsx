import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import {
  Loader2,
  Eye,
  Search,
  X,
  Receipt,
  Download,
  FileText,
  CheckSquare,
  Square,
} from "lucide-react";
import { billingService } from "@/services/billingService";
import type { InvoiceListItem, InvoiceFilters } from "@/types/billing";
import type { PaginationInfo } from "@/types/order";

interface InvoiceListProps {
  onViewInvoice: (invoiceNumber: string) => void;
}

const statusColors: Record<string, string> = {
  issued: "bg-blue-100 text-blue-800 border-blue-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function InvoiceList({ onViewInvoice }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(
    new Set(),
  );

  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    page_size: 10,
    total_count: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  });

  const [filters, setFilters] = useState<InvoiceFilters>({
    invoice_number: "",
    status: "",
    page: 1,
    size: 10,
  });

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await billingService.getInvoices(filters);
      setInvoices(response.results);
      const paginationInfo = billingService.getPaginationInfo(
        response,
        filters.page || 1,
        filters.size || 10,
      );
      setPagination(paginationInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch invoices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.page, filters.size]);

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    fetchInvoices();
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handlePageSizeChange = (size: number) => {
    setFilters({ ...filters, size, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      invoice_number: "",
      status: "",
      page: 1,
      size: 10,
    });
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

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const toggleSelectAll = () => {
    if (selectedInvoices.size === invoices.length && invoices.length > 0) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(invoices.map((inv) => inv.invoice_number)));
    }
  };

  const toggleSelectInvoice = (invoiceNumber: string) => {
    const newSet = new Set(selectedInvoices);
    if (newSet.has(invoiceNumber)) {
      newSet.delete(invoiceNumber);
    } else {
      newSet.add(invoiceNumber);
    }
    setSelectedInvoices(newSet);
  };

  const exportCSV = (dataToExport: InvoiceListItem[]) => {
    if (!dataToExport.length) return;

    const headers = [
      "Invoice Number",
      "Order Number",
      "Quantity",
      "Issue Date",
      "Status",
      "Amount",
      "Currency",
    ];
    const rows = dataToExport.map((inv) => [
      inv.invoice_number,
      inv.order_number,
      inv.total_quantity,
      inv.issue_date,
      inv.status,
      inv.total_amount,
      inv.currency,
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `invoices_export_${new Date().getTime()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = async (dataToExport: InvoiceListItem[]) => {
    if (!dataToExport.length) return;

    setIsExportingPDF(true);
    try {
      // Fetch full details for all selected invoices concurrently
      const detailedInvoices = await Promise.all(
        dataToExport.map((inv) =>
          billingService.getInvoiceByNumber(inv.invoice_number),
        ),
      );

      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const iframeDoc =
        iframe.contentWindow?.document || iframe.contentDocument;
      if (!iframeDoc) {
        document.body.removeChild(iframe);
        alert("Failed to create print frame.");
        return;
      }

      const rowsHtml = detailedInvoices
        .map(
          (invoice) => `
        <div class="invoice-page">
          <div class="flex justify-between items-start mb-8 border-b pb-6 border-black">
            <div>
              <h2 class="text-2xl font-bold text-black mb-1">INVOICE</h2>
              <p class="text-gray-800 text-sm">#${invoice.invoice_number}</p>
              <div class="mt-4 block">
                <span class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(invoice.status)}">
                  ${invoice.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div class="text-right">
              <div class="flex items-center justify-end gap-2 text-black font-semibold mb-1">
                ${invoice.courier_provider_name}
              </div>
              <div class="text-sm flex flex-col items-end gap-1 mt-3 text-gray-800">
                <span>Issue Date: ${invoice.issue_date}</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg p-5 mb-8 border border-black">
            <h3 class="text-sm font-semibold mb-4 border-b pb-2 text-black">ASSOCIATED ORDER</h3>
            <div class="flex items-center justify-between mb-2">
              <div>
                <p class="text-xs uppercase tracking-wider mb-1 text-gray-600">Order ID</p>
                <p class="font-medium flex items-center gap-1.5 text-black">
                  ${invoice.order_number}
                </p>
                <p class="text-xs mt-2 text-gray-700">Quantity: ${invoice.total_quantity}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-6 mt-6 border-t pt-4 border-black">
              <div>
                <p class="text-xs uppercase tracking-wider mb-2 text-gray-600">Sender Details</p>
                <p class="font-medium text-black">${invoice.sender_name}</p>
                <p class="text-sm mt-1 text-gray-800">${invoice.sender_address}, ${invoice.sender_city}</p>
                <p class="text-sm text-gray-800">${invoice.sender_phone}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wider mb-2 text-gray-600">Receiver Details</p>
                <p class="font-medium text-black">${invoice.receiver_name}</p>
                <p class="text-sm mt-1 text-gray-800">${invoice.receiver_address}, ${invoice.receiver_city}</p>
                <p class="text-sm text-gray-800">${invoice.receiver_phone}</p>
              </div>
            </div>
          </div>
          
          <div class="mt-8">
            <table class="w-full text-sm text-black">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left font-semibold py-3 text-gray-800">Description</th>
                  <th class="text-center font-semibold py-3 text-gray-800" style="width: 90px;">Qty</th>
                  <th class="text-right font-semibold py-3 text-gray-800">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-gray-100">
                  <td class="py-4 text-gray-800">Courier delivery charges for order ${invoice.order_number}</td>
                  <td class="py-4 text-center font-medium text-gray-800">${invoice.total_quantity}</td>
                  <td class="py-4 text-right font-medium text-black">${formatCurrency(invoice.total_amount.toString())}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" class="pt-6 pb-2 text-right font-semibold text-gray-600">Total</td>
                  <td class="pt-6 pb-2 text-right text-lg font-bold text-black">
                    ${formatCurrency(invoice.total_amount.toString())}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      `,
        )
        .join("");

      const html = `
        <html>
          <head>
            <title>Invoices Export</title>
            ${document.head.innerHTML}
            <style>
              body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
              .invoice-page { page-break-after: always; padding: 40px; }
              .invoice-page:last-child { page-break-after: auto; }
            </style>
          </head>
          <body>
            ${rowsHtml}
          </body>
        </html>
      `;

      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      // Delay to allow Vite's injected CSS to load inside the dynamic head before printing
      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }

        // Cleanup the iframe after print dialog is closed
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }, 500);
    } catch (err) {
      console.error("Failed to fetch full invoice details for PDF export", err);
      alert("An error occurred while fetching full invoice details.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleBulkExport = (format: "csv" | "pdf") => {
    const selectedData = invoices.filter((inv) =>
      selectedInvoices.has(inv.invoice_number),
    );
    if (format === "csv") exportCSV(selectedData);
    else exportPDF(selectedData);
  };

  const handleExportAll = (format: "csv" | "pdf") => {
    if (format === "csv") exportCSV(invoices);
    else exportPDF(invoices);
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load invoices
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchInvoices} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
          <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
            <div className="w-full md:w-64">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Search Invoice
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Invoice number..."
                  value={filters.invoice_number || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, invoice_number: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 h-10 border-gray-300"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filters.status || "all"}
                onValueChange={(val) =>
                  setFilters({ ...filters, status: val === "all" ? "" : val })
                }
              >
                <SelectTrigger className="h-10 border-gray-300">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end flex-wrap gap-2">
              <Button
                onClick={handleSearch}
                className="h-10 bg-blue-600 text-white hover:bg-blue-700"
              >
                Search
              </Button>
              {(filters.status || filters.invoice_number) && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="h-10"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-gray-100 justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={selectedInvoices.size === 0 || isExportingPDF}
                  className="h-10 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {isExportingPDF ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Export Selected
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => handleBulkExport("csv")}
                  className="cursor-pointer"
                >
                  Export as Excel (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkExport("pdf")}
                  className="cursor-pointer"
                >
                  Export as PDF Bills
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  disabled={invoices.length === 0 || isExportingPDF}
                  className="h-10 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isExportingPDF ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Export All Page
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => handleExportAll("csv")}
                  className="cursor-pointer"
                >
                  Export as Excel (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExportAll("pdf")}
                  className="cursor-pointer"
                >
                  Export as PDF Bills
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 flex justify-center items-center flex-col">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-500 text-sm">Loading invoices...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-gray-100 mb-4">
            <Receipt className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No invoices found
          </h3>
          <p className="text-gray-500 text-sm">
            There are no invoices matching your filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <button onClick={toggleSelectAll} className="p-1">
                      {selectedInvoices.size === invoices.length &&
                      invoices.length > 0 ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Invoice #
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Order ID
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Quantity
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wider text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow
                    key={inv.invoice_number}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <TableCell className="text-center">
                      <button
                        onClick={() => toggleSelectInvoice(inv.invoice_number)}
                        className="p-1"
                      >
                        {selectedInvoices.has(inv.invoice_number) ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-300" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {inv.invoice_number}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      #{inv.order_number}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {inv.total_quantity}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {inv.issue_date}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium capitalize ${getStatusColor(inv.status)}`}
                      >
                        {formatStatus(inv.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {formatCurrency(inv.total_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewInvoice(inv.invoice_number)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            pageSize={pagination.page_size}
            totalCount={pagination.total_count}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            disabled={isLoading}
            showPageSizeSelector={true}
            showInfo={true}
          />
        </div>
      )}
    </div>
  );
}
