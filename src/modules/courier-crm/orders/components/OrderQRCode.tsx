import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, QrCode, Share2 } from "lucide-react";

interface OrderQRCodeProps {
  orderNumber: string;
}

export const OrderQRCode: React.FC<OrderQRCodeProps> = ({ orderNumber }) => {
  const [showQR, setShowQR] = useState(false);

  // Generate tracking URL - this will be the QR tracking page
  const trackingUrl = `${window.location.origin}/qr-track/${orderNumber}`;

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `order-${orderNumber}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleShareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Track Order ${orderNumber}`,
          text: `Track your order ${orderNumber} with Door2Door`,
          url: trackingUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(trackingUrl);
      alert("Tracking URL copied to clipboard!");
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowQR(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <QrCode className="h-4 w-4" />
        View QR Code
      </Button>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Tracking QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to track order {orderNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* QR Code */}
            <div className="flex justify-center p-6 bg-white rounded-lg border-2 border-gray-200">
              <QRCodeSVG
                id="qr-code-svg"
                value={trackingUrl}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Order Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="font-mono font-semibold text-lg">{orderNumber}</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleDownloadQR}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                onClick={handleShareQR}
                variant="outline"
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-gray-600 pt-2 border-t">
              <p>
                Share this QR code with your customer to let them track their
                order
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
