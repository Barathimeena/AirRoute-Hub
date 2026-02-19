// Ticket generation and management service
import { Booking, Flight } from '../types';

export interface TicketData {
  transactionId: string;
  flightId: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  seats: string[];
  passengerName: string;
  totalPrice: number;
  currency: 'INR' | 'USD';
  qrCode: string;
  bookingDate: string;
  gate?: string;
}

const storage = {
  get(key: string) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
  },
  set(key: string, val: any) { localStorage.setItem(key, JSON.stringify(val)); }
};

// Generate a simple SVG QR code representation (placeholder)
const generateQRCode = (text: string): string => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='white' width='200' height='200'/%3E%3Crect fill='black' x='10' y='10' width='180' height='180' opacity='0.1'/%3E%3Ctext x='100' y='105' font-size='14' text-anchor='middle' fill='black'%3E${encodeURIComponent(text.substring(0, 20))}%3C/text%3E%3C/svg%3E`;
};

export const generateTicketHTML = (ticket: TicketData): string => {
  const symbol = ticket.currency === 'INR' ? '₹' : '$';
  const priceDisplay = ticket.currency === 'INR' ? Math.round(ticket.totalPrice) : ticket.totalPrice.toFixed(2);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flight Ticket - ${ticket.transactionId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f0f0; padding: 20px; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 32px; color: #003399; margin-bottom: 5px; }
    .header p { color: #666; font-size: 14px; }
    .ticket-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .info-section { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
    .info-section h3 { color: #003399; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .info-section p { color: #333; font-size: 16px; margin: 8px 0; font-weight: 500; }
    .info-label { color: #999; font-size: 12px; text-transform: uppercase; margin-bottom: 2px; }
    .flight-details { grid-column: 1/-1; }
    .flight-route { display: flex; align-items: center; justify-content: space-between; margin: 20px 0; }
    .airport { text-align: center; }
    .airport-code { font-size: 28px; color: #003399; font-weight: bold; }
    .airport-name { font-size: 12px; color: #666; margin-top: 5px; }
    .arrow { font-size: 24px; color: #999; min-width: 60px; text-align: center; }
    .flight-time { font-size: 16px; color: #333; }
    .seats-section { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .seats { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
    .seat { background: #003399; color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .price-section { grid-column: 1/-1; background: #f0f8ff; padding: 20px; border-radius: 8px; border-left: 4px solid #003399; }
    .price-row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 16px; }
    .price-total { border-top: 2px solid #003399; padding-top: 10px; font-size: 20px; font-weight: bold; color: #003399; }
    .qr-section { text-align: center; margin: 30px 0; }
    .qr-section img { width: 150px; height: 150px; border: 2px solid #ddd; padding: 10px; background: white; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    .booking-ref { font-weight: bold; color: #003399; font-size: 18px; }
    @media print { body { background: white; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✈️ FLIGHT BOOKING CONFIRMATION</h1>
      <p>Elite Aviation - Premium Flight Services</p>
    </div>

    <div class="ticket-info">
      <div class="info-section">
        <h3>📋 Booking Reference</h3>
        <p class="booking-ref">${ticket.transactionId}</p>
        <p style="font-size: 12px; color: #999; margin-top: 10px;">Booking Date: ${ticket.bookingDate}</p>
      </div>

      <div class="info-section">
        <h3>👤 Passenger Name</h3>
        <p>${ticket.passengerName}</p>
      </div>

      <div class="info-section flight-details">
        <h3>✈️ Flight Details</h3>
        <div class="flight-route">
          <div class="airport">
            <div class="airport-code">${ticket.origin}</div>
            <div class="airport-name">Departure</div>
            <div class="flight-time">${ticket.departureTime}</div>
          </div>
          <div class="arrow">→</div>
          <div class="airport">
            <div class="airport-code">${ticket.destination}</div>
            <div class="airport-name">Arrival</div>
            <div class="flight-time">${ticket.arrivalTime}</div>
          </div>
        </div>
        <p><strong>Airline:</strong> ${ticket.airline}</p>
        ${ticket.gate ? `<p><strong>Gate:</strong> ${ticket.gate}</p>` : ''}
      </div>

      <div class="info-section">
        <h3>💺 Assigned Seats</h3>
        <div class="seats-section">
          <div class="seats">
            ${ticket.seats.map(seat => `<div class="seat">${seat}</div>`).join('')}
          </div>
        </div>
      </div>

      <div class="price-section">
        <h3 style="margin-bottom: 15px; color: #003399;">💰 Price Summary</h3>
        <div class="price-row">
          <span>Subtotal:</span>
          <span>${symbol}${priceDisplay}</span>
        </div>
        <div class="price-row price-total">
          <span>Total Amount:</span>
          <span>${symbol}${priceDisplay}</span>
        </div>
      </div>

      <div class="qr-section">
        <p style="color: #666; margin-bottom: 10px;">Scan QR Code at Gate</p>
        <img src="${ticket.qrCode}" alt="Booking QR Code">
      </div>
    </div>

    <div class="footer">
      <p>🔒 This ticket is secure and non-transferable. Please carry a valid ID at the airport.</p>
      <p>For support: support@eliteaviation.com | Phone: 1-800-ELITE-AIR</p>
    </div>
  </div>
  <script>
    window.addEventListener('load', () => {
      window.print();
    });
  </script>
</body>
</html>
  `;
};

export const downloadTicket = (ticket: TicketData) => {
  const html = generateTicketHTML(ticket);
  const element = document.createElement('a');
  const file = new Blob([html], { type: 'text/html' });
  element.href = URL.createObjectURL(file);
  element.download = `ticket-${ticket.transactionId}.html`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const generateTicket = (booking: Booking, flight: Flight, passengerName: string): TicketData => {
  const qrCode = generateQRCode(booking.transactionId);
  return {
    transactionId: booking.transactionId,
    flightId: flight.id,
    airline: flight.airline,
    origin: flight.originCode,
    destination: flight.destinationCode,
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
    seats: booking.seats,
    passengerName,
    totalPrice: booking.totalPrice,
    currency: booking.currency,
    qrCode,
    bookingDate: new Date().toLocaleDateString(),
    gate: booking.gate || 'TBD'
  };
};

export const saveTicket = (ticket: TicketData) => {
  const tickets = storage.get('tickets') || [];
  tickets.push({ ...ticket, savedAt: Date.now() });
  storage.set('tickets', tickets);
};

export const getTickets = () => {
  return storage.get('tickets') || [];
};

export default {
  generateTicketHTML,
  downloadTicket,
  generateTicket,
  saveTicket,
  getTickets,
  generateQRCode
};
