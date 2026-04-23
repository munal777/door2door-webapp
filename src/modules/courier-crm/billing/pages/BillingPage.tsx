import { useState } from "react";
import { Receipt } from "lucide-react";
import InvoiceList from "@/modules/courier-crm/billing/components/InvoiceList";
import InvoiceDetailModal from "@/modules/courier-crm/billing/components/InvoiceDetailModal";

export default function BillingPage() {
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewInvoice = (invoiceNumber: string) => {
    setSelectedInvoiceNumber(invoiceNumber);
    setShowDetailModal(true);
  };

  return (
    <div className="h-full bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Professional Header */}
        <div className="mb-6 flex justify-between items-end">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Billing & Invoices</h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage, track, and export your invoices
              </p>
            </div>
          </div>
        </div>

        {/* Invoice List Component */}
        <div className="mt-6">
          <InvoiceList onViewInvoice={handleViewInvoice} />
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoiceNumber && (
        <InvoiceDetailModal
          invoiceNumber={selectedInvoiceNumber}
          open={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedInvoiceNumber(null);
          }}
        />
      )}
    </div>
  );
}
