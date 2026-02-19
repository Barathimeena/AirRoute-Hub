// Receipt generation and PDF download service
import { Booking, Flight } from '../types';

export interface ReceiptData {
  transactionId: string;
  passengerName: string;
  email: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  seats: string[];
  totalPassengers: number;
  foodItems?: string[];
  subtotal: number;
  discount: number;
  taxes: number;
  total: number;
  currency: 'INR' | 'USD';
  paymentMethod: string;
  cardLast4?: string;
  receiptDate: string;
  status: 'PAID' | 'PENDING';
}

export const generateReceiptHTML = (receipt: ReceiptData): string => {
  const symbol = receipt.currency === 'INR' ? '₹' : '$';
  const subtotalDisplay = receipt.currency === 'INR' ? Math.round(receipt.subtotal) : receipt.subtotal.toFixed(2);
  const discountDisplay = receipt.currency === 'INR' ? Math.round(receipt.discount) : receipt.discount.toFixed(2);
  const taxesDisplay = receipt.currency === 'INR' ? Math.round(receipt.taxes) : receipt.taxes.toFixed(2);
  const totalDisplay = receipt.currency === 'INR' ? Math.round(receipt.total) : receipt.total.toFixed(2);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt & Ticket - ${receipt.transactionId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; }
    .page-break { page-break-after: always; margin-bottom: 40px; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
    
    /* Header Styling */
    .header { background: linear-gradient(135deg, #003399 0%, #0056cc 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; }
    .header h1 { font-size: 32px; margin-bottom: 10px; font-weight: 900; letter-spacing: 1px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .badge { display: inline-block; background: #28a745; color: white; padding: 8px 20px; border-radius: 50px; font-weight: bold; font-size: 12px; margin-top: 10px; }
    
    /* Info Boxes Grid */
    .transaction-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .info-box { background: linear-gradient(135deg, #f0f8ff 0%, #e6f2ff 100%); padding: 20px; border-radius: 10px; border-left: 5px solid #003399; }
    .info-box h3 { color: #003399; font-size: 11px; text-transform: uppercase; font-weight: 900; margin-bottom: 10px; letter-spacing: 1px; }
    .info-box p { color: #333; font-size: 14px; margin: 5px 0; }
    .info-box .highlight { color: #003399; font-weight: bold; font-size: 16px; }
    .passenger-info { grid-column: 1/-1; }
    
    /* Flight Details */
    .flight-details { background: linear-gradient(135deg, #e8f5ff 0%, #f0f8ff 100%); padding: 25px; border-radius: 10px; border: 2px solid #003399; margin-bottom: 30px; }
    .section-title { color: #003399; font-size: 16px; font-weight: 900; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    
    .flight-route { display: grid; grid-template-columns: 1fr auto 1fr; gap: 30px; align-items: center; margin: 20px 0; padding: 20px; background: white; border-radius: 10px; }
    .airport { text-align: center; }
    .airport-code { font-size: 36px; color: #003399; font-weight: 900; }
    .airport-name { font-size: 12px; color: #666; margin-top: 5px; text-transform: uppercase; font-weight: bold; }
    .flight-time { font-size: 14px; color: #333; margin-top: 8px; font-weight: bold; }
    .arrow { text-align: center; color: #999; font-size: 28px; }
    
    .seats-info { margin-top: 20px; padding: 15px; background: white; border-radius: 10px; }
    .seats { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
    .seat-badge { background: linear-gradient(135deg, #003399 0%, #0056cc 100%); color: white; padding: 8px 15px; border-radius: 6px; font-size: 13px; font-weight: bold; box-shadow: 0 4px 8px rgba(0,51,153,0.2); }
    
    /* Pricing Section */
    .price-section { background: white; border: 2px solid #003399; padding: 25px; border-radius: 10px; margin: 30px 0; }
    .price-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; font-size: 15px; }
    .price-row.total { border-bottom: none; border-top: 3px solid #003399; padding-top: 15px; font-size: 18px; font-weight: 900; color: #003399; }
    
    /* Foods Section */
    .foods-section { grid-column: 1/-1; margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f3 100%); border: 2px solid #4caf50; border-radius: 10px; }
    .foods-section h3 { color: #2e7d32; font-size: 14px; font-weight: 900; margin-bottom: 15px; text-transform: uppercase; }
    .foods-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
    .food-item { background: white; border: 2px solid #4caf50; color: #2e7d32; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: bold; text-align: center; box-shadow: 0 2px 4px rgba(76,175,80,0.1); }
    
    /* Payment Info */
    .payment-info { background: linear-gradient(135deg, #e8f5ff 0%, #f0f8ff 100%); padding: 25px; border: 2px solid #003399; border-radius: 10px; margin: 30px 0; }
    .payment-info h3 { color: #003399; font-size: 14px; font-weight: 900; margin-bottom: 15px; text-transform: uppercase; }
    .payment-detail { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; }
    .payment-detail strong { color: #003399; }
    
    .card-display { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-top: 15px; font-family: 'Courier New', monospace; box-shadow: 0 6px 15px rgba(102,126,234,0.3); }
    .card-number { font-size: 19px; letter-spacing: 3px; margin: 15px 0; font-weight: bold; }
    .card-holder { font-size: 12px; margin-top: 15px; opacity: 0.9; font-weight: bold; }
    
    .status-badge { display: inline-block; background: #28a745; color: white; padding: 10px 20px; border-radius: 25px; font-weight: bold; margin-top: 10px; }
    
    /* Boarding Pass Style */
    .boarding-pass { background: white; border: 2px dashed #003399; padding: 25px; border-radius: 10px; margin-top: 30px; }
    .boarding-header { background: linear-gradient(135deg, #003399 0%, #0056cc 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
    .boarding-header h2 { font-size: 24px; font-weight: 900; letter-spacing: 1px; }
    
    .boarding-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 20px 0; }
    .boarding-item { background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #003399; }
    .boarding-item h4 { color: #003399; font-size: 10px; text-transform: uppercase; font-weight: 900; margin-bottom: 8px; }
    .boarding-item p { color: #333; font-size: 16px; font-weight: bold; }
    
    /* Footer */
    .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px; }
    .footer p { margin: 8px 0; }
    .security-note { background: #fff8e1; border-left: 4px solid #ff9800; padding: 15px; margin-top: 20px; border-radius: 5px; color: #e65100; font-size: 12px; }
    
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; page-break-inside: avoid; }
      .page-break { page-break-after: always; }
    }
  </style>
</head>
<body>
  <!-- RECEIPT PAGE -->
  <div class="container">
    <div class="header">
      <h1>✈️ ELITE AVIATION</h1>
      <p>Premium Flight Booking & Ticketing System</p>
      <div class="badge">✓ PAYMENT RECEIPT</div>
    </div>

    <div class="transaction-info">
      <div class="info-box">
        <h3>🔐 Receipt ID</h3>
        <p class="highlight">${receipt.transactionId}</p>
      </div>
      <div class="info-box">
        <h3>📅 Receipt Date</h3>
        <p class="highlight">${receipt.receiptDate}</p>
      </div>
      <div class="info-box passenger-info">
        <h3>👤 Passenger Information</h3>
        <p><strong>${receipt.passengerName}</strong></p>
        <p>${receipt.email}</p>
        <p style="margin-top: 8px;"><strong>Total Passengers:</strong> ${receipt.totalPassengers}</p>
      </div>
    </div>

    <div class="flight-details">
      <h3 class="section-title">✈️ Flight Information</h3>
      <p style="margin-bottom: 15px;"><strong>Airline:</strong> ${receipt.airline} | <strong>Flight #:</strong> ${receipt.flightNumber}</p>
      <!-- departure countdown display -->
      <div style="margin-bottom:15px; font-size:14px;">
        <strong>Departure in:</strong> <span id="countdown">--:--:--</span>
      </div>
      <div class="flight-route">
        <div class="airport">
          <div class="airport-code">${receipt.origin}</div>
          <div class="airport-name">Departure</div>
          <div class="flight-time">${receipt.departureDate}<br>${receipt.departureTime}</div>
        </div>
        <div class="arrow">✈️</div>
        <div class="airport">
          <div class="airport-code">${receipt.destination}</div>
          <div class="airport-name">Arrival</div>
          <div class="flight-time">${receipt.arrivalTime}</div>
        </div>
      </div>

      <div class="seats-info">
        <h4 style="color: #003399; font-weight: 900; margin-bottom: 10px; text-transform: uppercase; font-size: 11px;">💺 Assigned Seats</h4>
        <div class="seats">
          ${receipt.seats.map(seat => `<span class="seat-badge">${seat}</span>`).join('')}
        </div>
      </div>
    </div>

    ${receipt.foodItems && receipt.foodItems.length > 0 ? `
    <div class="foods-section">
      <h3>🍽️ Catering Selection</h3>
      <div class="foods-list">
        ${receipt.foodItems.map(food => `<div class="food-item">${food}</div>`).join('')}
      </div>
      <p style="margin-top: 15px; color: #2e7d32; font-size: 12px;"><strong>Note:</strong> Your selected meals will be served during the flight.</p>
    </div>
    ` : ''}

    <div class="price-section">
      <h3 class="section-title" style="margin-bottom: 15px;">💰 Price Breakdown</h3>
      <div class="price-row">
        <span>Base Fare:</span>
        <strong>${symbol}${subtotalDisplay}</strong>
      </div>
      ${receipt.discount > 0 ? `
      <div class="price-row" style="color: #28a745;">
        <span>Discount Applied:</span>
        <strong>-${symbol}${discountDisplay}</strong>
      </div>
      ` : ''}
      <div class="price-row">
        <span>Taxes & Handling (12%):</span>
        <strong>${symbol}${taxesDisplay}</strong>
      </div>
      <div class="price-row total">
        <span>TOTAL AMOUNT PAID:</span>
        <strong>${symbol}${totalDisplay}</strong>
      </div>
    </div>

    <div class="payment-info">
      <h3>💳 Payment Details</h3>
      <div class="payment-detail">
        <span><strong>Payment Method:</strong></span>
        <strong>${receipt.paymentMethod}</strong>
      </div>
      ${receipt.paymentMethod === 'Card' && receipt.cardLast4 ? `
      <div class="card-display">
        <div style="font-size: 11px; opacity: 0.85; letter-spacing: 2px;">PAYMENT CARD</div>
        <div class="card-number">•••• •••• •••• ${receipt.cardLast4}</div>
        <div class="card-holder">ELITE BOOKING SYSTEM</div>
      </div>
      ` : ''}
      <div style="margin-top: 15px;">
        <span><strong>Payment Status:</strong></span>
        <div class="status-badge" style="background: ${receipt.status === 'PAID' ? '#28a745' : '#ff9800'};">
          ${receipt.status === 'PAID' ? '✓ SUCCESSFULLY PAID' : 'PENDING'}
        </div>
      </div>
    </div>

    <div class="security-note">
      <strong>🔒 Secure & Official:</strong> This receipt is official proof of your booking payment. Please keep it safe for your records.
    </div>

    <div class="footer">
      <p><strong>IMPORTANT REMINDERS:</strong></p>
      <p>• Check-in opens 24 hours before departure</p>
      <p>• Please arrive 2 hours before international flights, 1 hour before domestic flights</p>
      <p>• Bring valid travel documents (Passport/ID)</p>
      <p style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 15px;">
        For support: <strong>support@eliteaviation.com</strong> | Hotline: <strong>1-800-ELITE-AIR</strong><br>
        © 2026 Elite Aviation Systems. All Rights Reserved.
      </p>
    </div>
  </div>

  <!-- BOARDING PASS PAGE -->
  <div class="container page-break" style="margin-top: 40px;">
    <div class="boarding-pass">
      <div class="boarding-header">
        <h2>${receipt.origin} ✈️ ${receipt.destination}</h2>
        <p style="margin-top: 10px; opacity: 0.9;">BOARDING PASS</p>
      </div>

      <div class="boarding-grid">
        <div class="boarding-item">
          <h4>Passenger Name</h4>
          <p>${receipt.passengerName}</p>
        </div>
        <div class="boarding-item">
          <h4>Confirmation Code</h4>
          <p>${receipt.transactionId}</p>
        </div>
        <div class="boarding-item">
          <h4>Flight Number</h4>
          <p>${receipt.flightNumber}</p>
        </div>
        <div class="boarding-item">
          <h4>Airline</h4>
          <p>${receipt.airline}</p>
        </div>
        <div class="boarding-item">
          <h4>Departure Date & Time</h4>
          <p>${receipt.departureDate}<br><strong>${receipt.departureTime}</strong></p>
        </div>
        <div class="boarding-item">
          <h4>Assigned Seats</h4>
          <p>${receipt.seats.join(', ')}</p>
        </div>
      </div>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <p style="color: #666; font-size: 13px; margin-bottom: 10px;"><strong>Important Information:</strong></p>
        <ul style="margin-left: 20px; color: #666; font-size: 12px; line-height: 1.6;">
          <li>Gate information will be announced at the airport</li>
          <li>Boarding will begin 30 minutes before departure</li>
          <li>Please keep this pass with you at all times</li>
          <li>Total Passengers: ${receipt.totalPassengers}</li>
          <li>Baggage Allowance: Complimentary checked bag (23 kg)</li>
        </ul>
      </div>

      <div style="margin-top: 20px; background: linear-gradient(135deg, #e8f5ff 0%, #f0f8ff 100%); padding: 15px; border-radius: 8px; border-left: 4px solid #003399;">
        <p style="color: #003399; font-weight: bold; margin-bottom: 8px;">✓ Your booking is confirmed!</p>
        <p style="color: #333; font-size: 12px;">A confirmation email has been sent to ${receipt.email}</p>
      </div>
    </div>

    <div class="footer">
      <p style="font-size: 11px; color: #999;">This boarding pass is valid only with official photo identification</p>
      <p style="font-size: 10px; color: #ccc; margin-top: 10px;">© 2026 Elite Aviation | Powered by Advanced Booking System</p>
    </div>
  </div>

  <script>
    // Auto-print when loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
<!-- countdown script -->
      <script>
        (function() {
          function updateCountdown() {
            try {
              const dep = new Date("${receipt.departureDate}T${receipt.departureTime}");
              const now = new Date();
              let diff = dep - now;
              if (diff < 0) diff = 0;
              const hrs = Math.floor(diff / (1000 * 60 * 60));
              const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              const secs = Math.floor((diff % (1000 * 60)) / 1000);
              const pad = n => n.toString().padStart(2, '0');
              const text = pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
              const el = document.getElementById('countdown');
              if (el) el.textContent = text;
            } catch (e) {
              console.error('Countdown update error', e);
            }
          }
          updateCountdown();
          setInterval(updateCountdown, 1000);
        })();
      </script>
  </body>
</html>
  `;
};

export const downloadReceiptAsPDF = (receipt: ReceiptData) => {
  try {
    const html = generateReceiptHTML(receipt);
    
    // Create a new window with the receipt HTML
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      setTimeout(() => {
        try { printWindow.print(); } catch (e) { console.error('Print failed', e); }
      }, 250);
    } else {
      console.error('Popup blocked: could not open print window');
    }
  } catch (err) {
    console.error('Error generating receipt PDF', err);
  }
};

export const saveReceipt = (receipt: ReceiptData) => {
  const storage = {
    get(key: string) {
      try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
    },
    set(key: string, val: any) { localStorage.setItem(key, JSON.stringify(val)); }
  };
  
  const receipts = storage.get('receipts') || [];
  receipts.push({ ...receipt, savedAt: Date.now() });
  storage.set('receipts', receipts);
};

export const getReceipts = () => {
  const storage = {
    get(key: string) {
      try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
    }
  };
  return storage.get('receipts') || [];
};

export default {
  generateReceiptHTML,
  downloadReceiptAsPDF,
  saveReceipt,
  getReceipts
};
