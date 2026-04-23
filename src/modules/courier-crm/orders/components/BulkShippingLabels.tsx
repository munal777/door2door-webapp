import type { OrderDetail, OrderListItem } from "@/types/order";

export const useBulkLabelPrinter = () => {
  const printBulkLabels = (orders: (OrderDetail | OrderListItem)[]) => {
    if (orders.length === 0) return;

    const isDetailedOrder = (
      order: OrderDetail | OrderListItem,
    ): order is OrderDetail => {
      return "sender_address" in order;
    };

    const currentDate = new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const labelsHTML = orders
      .map((order) => {
        const trackingUrl = `${window.location.origin}/qr-track/${order.order_number}`;

        return `
        <div class="label-container">
          <!-- Header -->
          <div class="header">
            <div class="logo-section">
              <div class="company-info">
                <h1>Door2Door</h1>
              </div>
            </div>
            <div class="shipped-badge">
              <div>SHIPPED</div>
              <div>${currentDate}</div>
            </div>
          </div>

          <!-- Addresses -->
          <div class="addresses">
            <!-- From -->
            <div class="address-section">
              <div class="address-label">FROM</div>
              <div class="address-name">${order.sender_name}</div>
              <div class="address-details">
                ${
                  isDetailedOrder(order)
                    ? `${order.sender_address}<br/>${order.sender_city}, ${order.sender_state}`
                    : order.sender_city
                }
              </div>
              <div class="phone">
                 ${order.sender_phone}
              </div>
            </div>

            <!-- To -->
            <div class="address-section">
              <div class="address-label">TO</div>
              <div class="address-name">${order.receiver_name}</div>
              <div class="address-details">
                ${
                  isDetailedOrder(order)
                    ? `${order.receiver_address}<br/>${order.receiver_city}, ${order.receiver_state}`
                    : order.receiver_city
                }
              </div>
              <div class="phone">
                 ${order.receiver_phone}
              </div>
            </div>
          </div>

          <!-- QR Code & Order Info -->
          <div class="qr-section">
            <div class="qr-code">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(trackingUrl)}" alt="QR Code" style="width: 80px; height: 80px;" />
            </div>
            <div class="order-info">
              <div class="order-label">ORDER NO.</div>
              <div class="order-number">${order.order_number}</div>
              <div class="scan-info">
                <div style="font-weight: 600; margin-bottom: 2px;">Scan QR to track</div>
              </div>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    // Create a hidden iframe for printing
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shipping Labels - ${orders.length} Orders</title>
          <style>
            @page {
              size: 4in 2.8in;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 0;
              margin: 0;
              background: white;
            }
            .label-container {
              width: 4in;
              height: 2.8in;
              border: 3px solid #000;
              display: flex;
              flex-direction: column;
              page-break-after: always;
              page-break-inside: avoid;
              background: white;
            }
            .label-container:last-child {
              page-break-after: auto;
            }
            .header {
              background: white;
              color: black;
              padding: 6px 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #000;
            }
            .logo-section {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .company-info h1 {
              font-size: 15px;
              font-weight: bold;
              margin: 0;
              color: black;
            }
            .company-info p {
              font-size: 9px;
              margin: 0;
              color: black;
            }
            .shipped-badge {
              color: black;
              padding: 4px 10px;
              font-size: 10px;
              font-weight: bold;
              text-align: right;
            }
            .shipped-badge div {
              font-size: 9px;
              font-weight: normal;
            }
            .addresses {
              display: flex;
              border-bottom: 2px solid #000;
            }
            .address-section {
              flex: 1;
              padding: 8px;
              border-right: 2px solid #000;
            }
            .address-section:last-child {
              border-right: none;
            }
            .address-label {
              font-size: 9px;
              font-weight: bold;
              color: black;
              margin-bottom: 4px;
              text-decoration: underline;
            }
            .address-name {
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 3px;
              color: black;
            }
            .address-details {
              font-size: 9px;
              line-height: 1.3;
              color: black;
            }
            .phone {
              display: flex;
              align-items: center;
              gap: 4px;
              margin-top: 4px;
              font-size: 10px;
              font-weight: 600;
              color: black;
            }
            .qr-section {
              display: flex;
              padding: 8px;
              gap: 8px;
              align-items: center;
              background: white;
              border-top: 2px solid #000;
            }
            .qr-code {
              flex-shrink: 0;
              border: 2px solid black;
              padding: 2px;
              background: white;
            }
            .qr-code img {
              display: block;
              width: 80px;
              height: 80px;
            }
            .order-info {
              flex: 1;
            }
            .order-label {
              font-size: 10px;
              color: black;
              margin-bottom: 2px;
              font-weight:6px;
              font-weight: bold;
              margin-bottom: 6
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 8px;
              letter-spacing: 0.5px;
              color: black;
            }
            .scan-info {
              font-size: 9px;
              color: black;
              line-height: 1.3;
            }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          ${labelsHTML}
        </body>
      </html>
    `);

    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // Clean up iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };

  return { printBulkLabels };
};
