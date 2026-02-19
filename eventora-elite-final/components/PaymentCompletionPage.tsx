import React, { useState } from 'react';
import { ReceiptData } from '../services/receiptService';
import receiptService from '../services/receiptService';
import notificationService from '../services/notificationService';

interface PaymentCompletionPageProps {
  receipt: ReceiptData;
  foodItems?: Array<{ label: string; quantity: number; icon: string }>;
  onClose: () => void;
}

const PaymentCompletionPage: React.FC<PaymentCompletionPageProps> = ({ receipt, foodItems = [], onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'receipt' | 'ticket' | 'food'>('overview');
  const [showConfetti, setShowConfetti] = useState(true);

  React.useEffect(() => {
    // Trigger confetti animation
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // automatically download receipt on load as well
  React.useEffect(() => {
    receiptService.downloadReceiptAsPDF(receipt);
    notificationService.addNotification('Receipt generated', 'success', false);
  }, [receipt]);

  const symbol = receipt.currency === 'INR' ? '₹' : '$';
  const totalDisplay = receipt.currency === 'INR' ? Math.round(receipt.total) : receipt.total.toFixed(2);

  const [departureCountdown, setDepartureCountdown] = useState('');

  React.useEffect(() => {
    function updateCountdown() {
      const dep = new Date(`${receipt.departureDate}T${receipt.departureTime}`);
      const now = new Date();
      let diff = dep.getTime() - now.getTime();
      if (diff < 0) {
        setDepartureCountdown('Departed');
        return;
      }
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setDepartureCountdown(`${hrs}h ${mins}m ${secs}s`);
    }
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [receipt.departureDate, receipt.departureTime]);

  return (
    <div className="min-h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Confetti animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'][Math.floor(Math.random() * 4)],
                animation: `fall ${2 + Math.random() * 2}s linear forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotateZ(360deg);
            opacity: 0;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .slide-up {
          animation: slideUp 0.6s ease-out;
        }
      `}</style>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-8 slide-up">
            <div className="text-8xl mb-4 animate-bounce">✅</div>
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
              Payment Successful!
            </h1>
            <p className="text-xl text-blue-200 font-bold tracking-wide">
              Your booking has been confirmed
            </p>
          </div>

          {/* Transaction ID Card */}
          <div className="mb-8 slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl border border-blue-400/30">
              <p className="text-sm font-bold text-blue-100 uppercase tracking-widest mb-2">Booking Confirmed</p>
              <p className="text-4xl font-black tracking-tighter break-all">{receipt.transactionId}</p>
              <div className="mt-4 flex justify-between items-center text-sm">
                <span className="text-blue-100">Receipt Date: {receipt.receiptDate}</span>
                <span className="px-4 py-2 bg-green-500/30 rounded-full border border-green-400 text-green-100 font-bold">✓ PAID</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 slide-up" style={{ animationDelay: '0.2s' }}>
            {['overview', 'receipt', 'ticket', 'food'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20 border border-white/20'
                }`}
              >
                {tab === 'overview' ? '📋 Overview' : tab === 'receipt' ? '📄 Receipt' : tab === 'ticket' ? '🎫 Ticket' : '🍽️ Food'}
              </button>
            ))}
          </div>

          {/* Content Sections */}
          <div className="slide-up" style={{ animationDelay: '0.3s' }}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Passenger Info */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-blue-400/50 transition-all">
                  <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                    <span className="text-3xl">👤</span> Passenger Details
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest mb-1">Name</p>
                      <p className="text-white text-lg font-bold">{receipt.passengerName}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest mb-1">Email</p>
                      <p className="text-white break-all">{receipt.email}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest mb-1">Total Passengers</p>
                      <p className="text-white text-lg font-bold">{receipt.totalPassengers}</p>
                    </div>
                  </div>
                </div>

                {/* Flight Info */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-blue-400/50 transition-all">
                  <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                    <span className="text-3xl">✈️</span> Flight Details
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest mb-1">Airline</p>
                      <p className="text-white text-lg font-bold">{receipt.airline}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest mb-1">Flight Number</p>
                      <p className="text-white text-lg font-bold">{receipt.flightNumber}</p>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-blue-300 font-bold uppercase tracking-widest mb-3">Route</p>
                      <div className="flex items-center justify-between text-white">
                        <div className="text-center">
                          <p className="text-2xl font-black text-blue-400">{receipt.origin}</p>
                          <p className="text-xs text-slate-300 mt-1">Departure</p>
                        </div>
                        <div className="flex-1 flex justify-center">
                          <div className="text-2xl">✈️</div>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-black text-blue-400">{receipt.destination}</p>
                          <p className="text-xs text-slate-300 mt-1">Arrival</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date/Time Info */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-blue-400/50 transition-all">
                  <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                    <span className="text-3xl">📅</span> Travel Date & Time
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest mb-1">Departure</p>
                      <p className="text-white text-lg font-bold">{receipt.departureDate}</p>
                      <p className="text-blue-200">{receipt.departureTime}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest mb-1">Arrival</p>
                      <p className="text-blue-200">{receipt.arrivalTime}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest mb-1">Time Until Departure</p>
                      <p className="text-white text-lg font-bold">{departureCountdown}</p>
                    </div>
                  </div>
                </div>

                {/* Seats Info */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-blue-400/50 transition-all">
                  <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                    <span className="text-3xl">💺</span> Assigned Seats
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {receipt.seats.map((seat, i) => (
                      <div
                        key={i}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-black text-sm border border-blue-400/50 shadow-lg"
                      >
                        {seat}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="md:col-span-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-md rounded-3xl p-8 border border-green-400/30">
                  <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                    <span className="text-3xl">💰</span> Price Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-200">Base Fare</span>
                      <span className="text-white font-bold">{symbol}{receipt.currency === 'INR' ? Math.round(receipt.subtotal) : receipt.subtotal.toFixed(2)}</span>
                    </div>
                    {receipt.discount > 0 && (
                      <div className="flex justify-between text-green-300">
                        <span>Discount</span>
                        <span className="font-bold">-{symbol}{receipt.currency === 'INR' ? Math.round(receipt.discount) : receipt.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-blue-200">Taxes</span>
                      <span className="text-white font-bold">{symbol}{receipt.currency === 'INR' ? Math.round(receipt.taxes) : receipt.taxes.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-white/20 pt-3 flex justify-between text-lg">
                      <span className="text-white font-black">TOTAL PAID</span>
                      <span className="text-2xl font-black text-green-300">{symbol}{totalDisplay}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="md:col-span-2 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                  <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                    <span className="text-3xl">💳</span> Payment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest mb-2">Payment Method</p>
                      <p className="text-white text-lg font-bold">{receipt.paymentMethod}</p>
                    </div>
                    {receipt.cardLast4 && (
                      <div>
                        <p className="text-blue-300 font-bold uppercase tracking-widest mb-2">Card</p>
                        <p className="text-white text-lg font-bold">•••• {receipt.cardLast4}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest mb-2">Status</p>
                      <p className="text-green-300 text-lg font-bold">✓ {receipt.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Receipt Tab */}
            {activeTab === 'receipt' && (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-h-96 overflow-y-auto">
                <div className="text-white space-y-6">
                  <div className="border-b border-white/20 pb-6">
                    <p className="text-sm text-blue-300 font-bold uppercase tracking-widest mb-2">Receipt ID</p>
                    <p className="text-2xl font-black text-blue-400">{receipt.transactionId}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest mb-2">Passenger</p>
                      <p className="text-white font-bold">{receipt.passengerName}</p>
                      <p className="text-slate-300 text-xs mt-1">{receipt.email}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest mb-2">Date</p>
                      <p className="text-white font-bold">{receipt.receiptDate}</p>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-6">
                    <p className="text-sm text-blue-300 font-bold uppercase tracking-widest mb-4">Flight Information</p>
                    <div className="space-y-3 text-sm">
                      <p className="text-white"><strong className="text-blue-300">Airline:</strong> {receipt.airline}</p>
                      <p className="text-white"><strong className="text-blue-300">Flight:</strong> {receipt.flightNumber}</p>
                      <p className="text-white"><strong className="text-blue-300">Route:</strong> {receipt.origin} → {receipt.destination}</p>
                      <p className="text-white"><strong className="text-blue-300">Departure:</strong> {receipt.departureDate} at {receipt.departureTime}</p>
                      <p className="text-white"><strong className="text-blue-300">Arrival:</strong> {receipt.arrivalTime}</p>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-6">
                    <p className="text-sm text-blue-300 font-bold uppercase tracking-widest mb-4">Seats</p>
                    <div className="flex flex-wrap gap-2">
                      {receipt.seats.map((seat, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-600/50 text-white rounded-lg text-sm font-bold">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {receipt.foodItems && receipt.foodItems.length > 0 && (
                    <div className="border-t border-white/20 pt-6">
                      <p className="text-sm text-blue-300 font-bold uppercase tracking-widest mb-4">Catering</p>
                      <div className="flex flex-wrap gap-2">
                        {receipt.foodItems.map((food, i) => (
                          <span key={i} className="px-3 py-1 bg-purple-600/50 text-white rounded-lg text-sm">
                            {food}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-white/20 pt-6">
                    <p className="text-sm text-blue-300 font-bold uppercase tracking-widest mb-4">Payment Details</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Subtotal</span>
                        <span className="text-white font-bold">{symbol}{receipt.currency === 'INR' ? Math.round(receipt.subtotal) : receipt.subtotal.toFixed(2)}</span>
                      </div>
                      {receipt.discount > 0 && (
                        <div className="flex justify-between text-green-300">
                          <span>Discount</span>
                          <span className="font-bold">-{symbol}{receipt.currency === 'INR' ? Math.round(receipt.discount) : receipt.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-300">Taxes (12%)</span>
                        <span className="text-white font-bold">{symbol}{receipt.currency === 'INR' ? Math.round(receipt.taxes) : receipt.taxes.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-white/20 pt-2 flex justify-between text-white">
                        <span className="font-black">TOTAL</span>
                        <span className="text-xl font-black text-green-300">{symbol}{totalDisplay}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-6">
                    <p className="text-sm text-blue-300 font-bold uppercase tracking-widest mb-4">Payment Method</p>
                    <p className="text-white text-sm"><strong>{receipt.paymentMethod}</strong> {receipt.cardLast4 ? `(•••• ${receipt.cardLast4})` : ''}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Ticket Tab */}
            {activeTab === 'ticket' && (
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-3xl p-8 border border-blue-400/30">
                <div className="text-white space-y-6">
                  <div className="text-center border-b border-white/20 pb-6">
                    <p className="text-blue-300 font-bold uppercase tracking-widest text-sm">Boarding Pass</p>
                    <p className="text-3xl font-black mt-2">{receipt.origin} ✈️ {receipt.destination}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest mb-2">Passenger</p>
                      <p className="text-white font-black text-lg">{receipt.passengerName}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest mb-2">Confirmation</p>
                      <p className="text-white font-black text-lg">{receipt.transactionId}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest text-xs mb-2">Airline</p>
                      <p className="text-white font-black text-lg">{receipt.airline}</p>
                      <p className="text-slate-300 text-xs mt-1">{receipt.flightNumber}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest text-xs mb-2">Departure</p>
                      <p className="text-white font-black text-sm">{receipt.departureDate}</p>
                      <p className="text-blue-200 font-bold text-lg">{receipt.departureTime}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 font-bold uppercase tracking-widest text-xs mb-2">Seats</p>
                      <div className="flex flex-wrap gap-2">
                        {receipt.seats.map((seat, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-600/50 rounded font-black text-sm">
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-6">
                    <p className="text-blue-300 font-bold uppercase tracking-widest text-sm mb-4">Ticket Details</p>
                    <div className="space-y-2 text-sm">
                      <p className="text-white"><strong className="text-blue-300">Gate:</strong> <span className="text-lg font-black text-blue-400">TBD</span></p>
                      <p className="text-white"><strong className="text-blue-300">Seat Class:</strong> Economy / Business / First</p>
                      <p className="text-white"><strong className="text-blue-300">Total Passengers:</strong> {receipt.totalPassengers}</p>
                      <p className="text-white"><strong className="text-blue-300">Baggage Allowance:</strong> 1 × 23kg + 1 × 8kg</p>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-600/20 rounded-xl border border-yellow-500/30 text-sm">
                    <p className="text-yellow-200"><strong>⚠️ Important:</strong> Please arrive at the airport 2 hours before departure</p>
                  </div>
                </div>
              </div>
            )}

            {/* Food Tab */}
            {activeTab === 'food' && (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                {foodItems.length > 0 ? (
                  <div className="text-white space-y-6">
                    <h3 className="text-lg font-black flex items-center gap-3 mb-6">
                      <span className="text-3xl">🍽️</span> Your Food Selection
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {foodItems.map((item, i) => (
                        <div
                          key={i}
                          className="p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl border border-green-400/30 hover:border-green-400/60 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-4xl">{item.icon}</span>
                              <div>
                                <p className="font-black text-white">{item.label}</p>
                                <p className="text-xs text-green-200">Quantity: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-center bg-green-600/50 px-3 py-2 rounded-lg">
                              <p className="text-sm font-black text-green-100">×{item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-blue-200 text-sm pt-4 border-t border-white/20">
                      Your food will be served during the flight. Thank you for your order!
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-300">
                    <p className="text-4xl mb-4">🍽️</p>
                    <p className="text-lg font-bold">No food items ordered</p>
                    <p className="text-sm mt-2">In-flight catering will be available for purchase</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 slide-up" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={() => receiptService.downloadReceiptAsPDF(receipt)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-2xl hover:scale-105 transition-all active:scale-95"
            >
              📥 Download Receipt PDF
            </button>
            <button
              onClick={() => window.print()}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-2xl hover:scale-105 transition-all active:scale-95"
            >
              🖨️ Print Everything
            </button>
            <button
              onClick={onClose}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-2xl hover:scale-105 transition-all active:scale-95"
            >
              ✅ Back to Home
            </button>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-slate-300 text-sm">
            <p>Thank you for your booking! A confirmation email has been sent to <strong>{receipt.email}</strong></p>
            <p className="mt-2 text-xs text-slate-400">Keep your booking reference safe: <strong className="text-blue-300">{receipt.transactionId}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCompletionPage;
