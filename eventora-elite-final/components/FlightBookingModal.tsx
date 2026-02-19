
import React, { useState, useMemo } from 'react';
import notificationService from '../services/notificationService';
import ticketService, { TicketData } from '../services/ticketService';
import receiptService, { ReceiptData } from '../services/receiptService';
import PaymentCompletionPage from './PaymentCompletionPage';
import { Flight, User, PassengerCounts, PaymentMethod, CateringItem, CateringCategory, SelectedCatering, FoodType } from '../types';

interface FlightBookingModalProps {
  flight: Flight;
  currency: 'USD' | 'INR';
  user: User;
  passengers: PassengerCounts;
  onClose: () => void;
  onConfirm: (flight: Flight, seats: string[], catering: SelectedCatering[], billing: any) => void;
}

const CATERING_MENU: CateringItem[] = [
  // VEG FOOD (10 items)
  { id: 'v1', category: 'Food', foodType: 'Veg', label: 'Paneer Tikka', desc: 'Tandoori marinated cottage cheese', icon: '🧀', premium: false, stock: 30 },
  { id: 'v2', category: 'Food', foodType: 'Veg', label: 'Vegetable Biryani', desc: 'Fragrant basmati rice with veggies', icon: '🍚', premium: false, stock: 35 },
  { id: 'v3', category: 'Food', foodType: 'Veg', label: 'Mushroom Wellington', desc: 'Puff pastry wrapped mushroom', icon: '🍄', premium: true, stock: 15 },
  { id: 'v4', category: 'Food', foodType: 'Veg', label: 'Spinach & Feta Wrap', desc: 'Creamy spinach with Greek cheese', icon: '🥬', premium: false, stock: 25 },
  { id: 'v5', category: 'Food', foodType: 'Veg', label: 'Tofu Pad Thai', desc: 'Thai noodles with silken tofu', icon: '🍜', premium: false, stock: 28 },
  { id: 'v6', category: 'Food', foodType: 'Veg', label: 'Eggplant Parmesan', desc: 'Layered aubergine with mozzarella', icon: '🍆', premium: true, stock: 12 },
  { id: 'v7', category: 'Food', foodType: 'Veg', label: 'Chickpea Curry', desc: 'Spiced chickpeas in tomato sauce', icon: '🌱', premium: false, stock: 32 },
  { id: 'v8', category: 'Food', foodType: 'Veg', label: 'Vegetable Sushi', desc: 'Assorted vegetable rolls', icon: '🍣', premium: false, stock: 20 },
  { id: 'v9', category: 'Food', foodType: 'Veg', label: 'Beetroot Carpaccio', desc: 'Thinly sliced beetroot with herbs', icon: '🥗', premium: true, stock: 18 },
  { id: 'v10', category: 'Food', foodType: 'Veg', label: 'Corn Chowder', desc: 'Creamy corn soup with fresh herbs', icon: '🌽', premium: false, stock: 30 },

  // NON-VEG FOOD (10 items)
  { id: 'nv1', category: 'Food', foodType: 'Non-Veg', label: 'Wagyu Steak', desc: 'Japanese Grade A5 premium beef', icon: '🥩', premium: true, stock: 15 },
  { id: 'nv2', category: 'Food', foodType: 'Non-Veg', label: 'Butter Chicken', desc: 'Tender chicken in creamy sauce', icon: '🥘', premium: false, stock: 40 },
  { id: 'nv3', category: 'Food', foodType: 'Non-Veg', label: 'Lobster Pasta', desc: 'White truffle cream with lobster', icon: '🦞', premium: true, stock: 10 },
  { id: 'nv4', category: 'Food', foodType: 'Non-Veg', label: 'Salmon Teriyaki', desc: 'Glazed salmon with Asian flavors', icon: '🐟', premium: true, stock: 18 },
  { id: 'nv5', category: 'Food', foodType: 'Non-Veg', label: 'Tandoori Chicken', desc: 'Traditional spiced grilled chicken', icon: '🍗', premium: false, stock: 38 },
  { id: 'nv6', category: 'Food', foodType: 'Non-Veg', label: 'Grilled Lamb Chops', desc: 'Herb-crusted lamb with mint sauce', icon: '🍖', premium: true, stock: 14 },
  { id: 'nv7', category: 'Food', foodType: 'Non-Veg', label: 'Prawn Biryani', desc: 'Basmati rice with succulent prawns', icon: '🦐', premium: false, stock: 22 },
  { id: 'nv8', category: 'Food', foodType: 'Non-Veg', label: 'Duck Confit', desc: 'Slow-cooked duck in its own fat', icon: '🦆', premium: true, stock: 12 },
  { id: 'nv9', category: 'Food', foodType: 'Non-Veg', label: 'Tuna Sashimi', desc: 'Premium sushi-grade tuna', icon: '🍣', premium: true, stock: 16 },
  { id: 'nv10', category: 'Food', foodType: 'Non-Veg', label: 'Chicken Piccata', desc: 'Lemon-caper breaded chicken', icon: '🍤', premium: false, stock: 35 },

  // DRINKS (8 items)
  { id: 'd1', category: 'Drink', label: 'Champagne', desc: 'Brut Vintage 2015', icon: '🍾', premium: true, stock: 12 },
  { id: 'd2', category: 'Drink', label: 'Iced Coffee', desc: 'Cold brew Arabica', icon: '☕', premium: false, stock: 60 },
  { id: 'd3', category: 'Drink', label: 'Mango Lassi', desc: 'Fresh Alphonso mango', icon: '🥛', premium: false, stock: 50 },
  { id: 'd4', category: 'Drink', label: 'Pomegranate Juice', desc: 'Fresh-pressed organic juice', icon: '🍷', premium: false, stock: 40 },
  { id: 'd5', category: 'Drink', label: 'Green Tea', desc: 'Organic Japanese matcha', icon: '🫖', premium: false, stock: 45 },
  { id: 'd6', category: 'Drink', label: 'Wine Selection', desc: 'Red or White premium wines', icon: '🍇', premium: true, stock: 20 },
  { id: 'd7', category: 'Drink', label: 'Sparkling Water', desc: 'Premium mineral water', icon: '💧', premium: false, stock: 70 },
  { id: 'd8', category: 'Drink', label: 'Espresso', desc: 'Freshly brewed Italian espresso', icon: '☕', premium: false, stock: 50 },

  // SNACKS (9 items)
  { id: 's1', category: 'Snack', label: 'Truffle Chips', desc: 'Hand-cooked with truffle oil', icon: '🍟', premium: false, stock: 100 },
  { id: 's2', category: 'Snack', label: 'Macarons', desc: 'French assorted box of 6', icon: '🍪', premium: true, stock: 30 },
  { id: 's3', category: 'Snack', label: 'Cheese & Crackers', desc: 'Artisanal cheese selection', icon: '🧀', premium: true, stock: 25 },
  { id: 's4', category: 'Snack', label: 'Mixed Nuts', desc: 'Roasted almonds and cashews', icon: '🥜', premium: false, stock: 55 },
  { id: 's5', category: 'Snack', label: 'Chocolate Truffles', desc: 'Belgian dark chocolate', icon: '🍫', premium: true, stock: 35 },
  { id: 's6', category: 'Snack', label: 'Fruit Platter', desc: 'Seasonal fresh fruits', icon: '🍓', premium: false, stock: 40 },
  { id: 's7', category: 'Snack', label: 'Samosa Trio', desc: 'Crispy Indian pastries', icon: '🥟', premium: false, stock: 50 },
  { id: 's8', category: 'Snack', label: 'Granola Bar', desc: 'Honey oats with dried berries', icon: '🥐', premium: false, stock: 60 },
  { id: 's9', category: 'Snack', label: 'Pretzel Sticks', desc: 'Salted and buttered pretzels', icon: '🥨', premium: false, stock: 80 }
];

const FlightBookingModal: React.FC<FlightBookingModalProps> = ({ flight, currency, user, passengers, onClose, onConfirm }) => {
  const [step, setStep] = useState<'seats' | 'foodPreference' | 'catering' | 'payment' | 'card' | 'processing' | 'confirmed' | 'receipt'>('seats');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedCatering, setSelectedCatering] = useState<SelectedCatering[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [catFilter, setCatFilter] = useState<CateringCategory>('Food');
  const [foodTypeFilter, setFoodTypeFilter] = useState<'Veg' | 'Non-Veg'>('Veg');
  const [generatedTicket, setGeneratedTicket] = useState<TicketData | null>(null);
  const [generatedReceipt, setGeneratedReceipt] = useState<ReceiptData | null>(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const totalTravelers = passengers.young + passengers.adult + passengers.elder;

  const priceData = useMemo(() => {
    const baseWithFlashDiscount = flight.basePrice * (1 - (flight.discountPercent || 0) / 100);
    
    const youngTotal = passengers.young * baseWithFlashDiscount * 0.8; 
    const elderTotal = passengers.elder * baseWithFlashDiscount * 0.85; 
    const adultTotal = passengers.adult * baseWithFlashDiscount;
    
    const subtotal = youngTotal + elderTotal + adultTotal;
    const ageOffer = (passengers.young * baseWithFlashDiscount * 0.2) + (passengers.elder * baseWithFlashDiscount * 0.15);
    
    const cateringTotal = selectedCatering.reduce((acc, sc) => {
      const item = CATERING_MENU.find(i => i.id === sc.itemId);
      const itemPrice = item?.premium ? 35 : 15;
      return acc + (itemPrice * sc.quantity);
    }, 0);
    
    const taxes = (subtotal + cateringTotal) * 0.12;
    return { 
      subtotal, 
      cateringTotal, 
      taxes, 
      total: subtotal + cateringTotal + taxes, 
      innateDiscount: flight.basePrice - baseWithFlashDiscount,
      ageOffer 
    };
  }, [flight, passengers, selectedCatering]);

  const toggleSeat = (id: string) => {
    if (selectedSeats.includes(id)) setSelectedSeats(selectedSeats.filter(s => s !== id));
    else if (selectedSeats.length < totalTravelers) setSelectedSeats([...selectedSeats, id]);
  };

  const updateCateringQty = (itemId: string, delta: number) => {
    const item = CATERING_MENU.find(i => i.id === itemId);
    if (!item) return;

    setSelectedCatering(prev => {
      const existing = prev.find(sc => sc.itemId === itemId);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(sc => sc.itemId !== itemId);
        if (newQty > item.stock) return prev; // Cannot exceed stock
        return prev.map(sc => sc.itemId === itemId ? { ...sc, quantity: newQty } : sc);
      } else {
        if (delta <= 0) return prev;
        return [...prev, { itemId, quantity: 1 }];
      }
    });
  };

  const format = (v: number) => {
    const val = currency === 'INR' ? v * 83 : v;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val);
  };

  const getFilteredFoods = () => {
    if (foodTypeFilter === 'Veg') {
      return CATERING_MENU.filter(item => item.foodType === 'Veg' || item.category !== 'Food');
    } else {
      return CATERING_MENU.filter(item => item.foodType !== 'Veg' || item.category !== 'Food');
    }
  };

  const handleFinalConfirm = () => {
    setStep('processing');
    setTimeout(() => {
      const billing = {
        subtotal: priceData.subtotal,
        discount: priceData.innateDiscount,
        ageOffer: priceData.ageOffer,
        taxes: priceData.taxes,
        total: priceData.total,
        paymentMethod,
        transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };
      onConfirm(flight, selectedSeats, selectedCatering, billing);

      // Get user email
      let userEmail = `${user.name.replace(/\s+/g,'').toLowerCase()}@example.com`;
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userRecord = users.find((u: any) => u.name === user.name);
        if (userRecord?.email) userEmail = userRecord.email;
      } catch (e) {}

      // Generate ticket
      const ticketData: TicketData = {
        transactionId: billing.transactionId,
        flightId: flight.id,
        airline: flight.airline,
        origin: flight.originCode,
        destination: flight.destinationCode,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        seats: selectedSeats,
        passengerName: user.name,
        totalPrice: priceData.total,
        currency: currency,
        qrCode: ticketService.generateQRCode(billing.transactionId),
        bookingDate: new Date().toLocaleDateString(),
        gate: 'TBD'
      };
      
      setGeneratedTicket(ticketData);
      ticketService.saveTicket(ticketData);

      // Generate receipt
      const foodItemsForReceipt = selectedCatering.map(sc => {
        const item = CATERING_MENU.find(i => i.id === sc.itemId);
        return `${item?.label} (×${sc.quantity})`;
      });

      const receipt: ReceiptData = {
        transactionId: billing.transactionId,
        passengerName: user.name,
        email: userEmail,
        flightNumber: flight.id,
        airline: flight.airline,
        origin: flight.originCode,
        destination: flight.destinationCode,
        departureDate: flight.departureDate,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        seats: selectedSeats,
        totalPassengers: totalTravelers,
        foodItems: foodItemsForReceipt,
        subtotal: priceData.subtotal + priceData.ageOffer,
        discount: priceData.innateDiscount,
        taxes: priceData.taxes,
        total: priceData.total,
        currency: currency,
        paymentMethod: paymentMethod,
        receiptDate: new Date().toLocaleDateString(),
        status: 'PAID'
      };

      setGeneratedReceipt(receipt);
      receiptService.saveReceipt(receipt);
      // automatically trigger PDF download/print
      try {
        receiptService.downloadReceiptAsPDF(receipt);
        notificationService.addNotification('Receipt generated', 'success', false);
      } catch (e) {
        console.error('Receipt download error', e);
        notificationService.addNotification('Receipt error', 'error', false);
      }

      // schedule reminder (demo: stored in localStorage and will show demo email)
      try {
        const flightDeparture = flight.departureDate ? `${flight.departureDate}T${flight.departureTime || '00:00:00'}` : new Date().toISOString();
        const booking = {
          id: billing.transactionId,
          flightId: flight.id,
          userId: user.id,
          userName: user.name,
          userEmail,
          seats: selectedSeats,
          passengers: totalTravelers,
          selectedCatering,
          total: priceData.total,
          flightDeparture
        };
        notificationService.scheduleFlightReminder(booking);
        
        // Add persistent notification about booking
        notificationService.addNotification(
          `✅ Booking confirmed! Transaction ID: ${billing.transactionId}`,
          'success',
          true
        );
      } catch (e) {}
      
      setStep('confirmed');
    }, 2000);
  };

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/98 backdrop-blur-3xl">
        <div className="text-center space-y-10">
          <div className="relative w-32 h-32 mx-auto">
             <div className="absolute inset-0 border-8 border-blue-500/10 rounded-full animate-ping"></div>
             <div className="absolute inset-0 border-8 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center text-4xl">✈️</div>
          </div>
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Terminal Link Active...</h3>
        </div>
      </div>
    );
  }

  if (step === 'confirmed' && generatedReceipt && generatedTicket) {
    const foodItems = selectedCatering.map(sc => {
      const item = CATERING_MENU.find(i => i.id === sc.itemId);
      return {
        label: item?.label || 'Unknown',
        quantity: sc.quantity,
        icon: item?.icon || '🍽️'
      };
    });

    return (
      <PaymentCompletionPage 
        receipt={generatedReceipt}
        foodItems={foodItems}
        onClose={onClose}
      />
    );
  }

  if (step === 'receipt' && generatedReceipt) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/98 backdrop-blur-3xl p-4 overflow-y-auto">
        <div className="bg-slate-900 rounded-[3rem] shadow-2xl max-w-2xl w-full p-8 border border-white/10">
          <div className="text-center space-y-6">
            <div className="text-6xl">📄</div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Payment Receipt</h2>
            <div className="p-4 bg-green-600/10 rounded-xl border border-green-500/20">
              <p className="text-sm font-bold text-green-400">✓ Payment Completed</p>
            </div>
            
            <div className="space-y-3 text-left p-6 bg-white/5 rounded-2xl border border-white/10 max-h-[400px] overflow-y-auto">
              <p><strong className="text-blue-400">Receipt #:</strong> {generatedReceipt.transactionId}</p>
              <p><strong className="text-blue-400">Passenger:</strong> {generatedReceipt.passengerName}</p>
              <p><strong className="text-blue-400">Flight:</strong> {generatedReceipt.airline} - {generatedReceipt.flightNumber}</p>
              <p><strong className="text-blue-400">Route:</strong> {generatedReceipt.origin} → {generatedReceipt.destination}</p>
              <p><strong className="text-blue-400">Date:</strong> {generatedReceipt.departureDate} {generatedReceipt.departureTime}</p>
              <p><strong className="text-blue-400">Seats:</strong> {generatedReceipt.seats.join(', ')}</p>
              <hr className="border-white/10 my-3" />
              <p><strong className="text-blue-400">Subtotal:</strong> {generatedReceipt.currency === 'INR' ? '₹' : '$'}{generatedReceipt.currency === 'INR' ? Math.round(generatedReceipt.subtotal) : generatedReceipt.subtotal.toFixed(2)}</p>
              {generatedReceipt.discount > 0 && <p><strong className="text-green-400">Discount:</strong> -{generatedReceipt.currency === 'INR' ? '₹' : '$'}{generatedReceipt.currency === 'INR' ? Math.round(generatedReceipt.discount) : generatedReceipt.discount.toFixed(2)}</p>}
              <p><strong className="text-blue-400">Taxes:</strong> {generatedReceipt.currency === 'INR' ? '₹' : '$'}{generatedReceipt.currency === 'INR' ? Math.round(generatedReceipt.taxes) : generatedReceipt.taxes.toFixed(2)}</p>
              <p className="text-lg font-bold text-green-400"><strong>Total Paid:</strong> {generatedReceipt.currency === 'INR' ? '₹' : '$'}{generatedReceipt.currency === 'INR' ? Math.round(generatedReceipt.total) : generatedReceipt.total.toFixed(2)}</p>
              <p><strong className="text-blue-400">Payment Method:</strong> {generatedReceipt.paymentMethod} {generatedReceipt.cardLast4 ? `(•••• ${generatedReceipt.cardLast4})` : ''}</p>
              <p><strong className="text-blue-400">Status:</strong> <span className="text-green-400">✓ PAID</span></p>
            </div>

            <div className="space-y-3 pt-4">
              <button 
                onClick={() => {
                  if (generatedReceipt) receiptService.downloadReceiptAsPDF(generatedReceipt);
                }}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:bg-blue-500 transition-all"
              >
                📥 Download Receipt as PDF
              </button>
              <button 
                onClick={onClose}
                className="w-full bg-slate-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:bg-slate-600 transition-all"
              >
                Close & View Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/98 backdrop-blur-3xl">
        <div className="text-center space-y-10">
          <div className="relative w-32 h-32 mx-auto">
             <div className="absolute inset-0 border-8 border-blue-500/10 rounded-full animate-ping"></div>
             <div className="absolute inset-0 border-8 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center text-4xl">✈️</div>
          </div>
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Terminal Link Active...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-[3rem] shadow-2xl max-w-7xl w-full flex flex-col md:flex-row overflow-hidden border border-white/10 min-h-[600px]">
        
        <div className="flex-1 p-8 relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              {step === 'seats' ? 'Assign Cabin Unit' : step === 'foodPreference' ? 'Food Selection' : step === 'catering' ? 'Luxury Catering' : step === 'payment' || step === 'card' ? 'Payment Details' : 'Final Authorization'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">✕</button>
          </div>

          {step === 'seats' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8">
              <div className="grid grid-cols-6 gap-3">
                {[1,2,3,4,5,6].map(row => (
                  <React.Fragment key={row}>
                    {['A','B','C','D','E','F'].map(col => {
                      const id = `${row}${col}`;
                      const isTaken = (row + col.charCodeAt(0)) % 7 === 0;
                      const isSelected = selectedSeats.includes(id);
                      return (
                        <button key={id} disabled={isTaken} onClick={() => toggleSeat(id)}
                          className={`aspect-square w-12 rounded-xl border-2 font-black text-[10px] transition-all ${
                            isTaken ? 'bg-slate-800 border-slate-800 opacity-20 cursor-not-allowed' :
                            isSelected ? 'bg-blue-600 border-blue-400 text-white scale-110' :
                            'bg-slate-950 border-white/5 text-slate-500 hover:border-blue-500'
                          }`}
                        >
                          {id}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                Selected {selectedSeats.length} of {totalTravelers} units
              </p>
            </div>
          )}

          {step === 'foodPreference' && (
            <div className="space-y-6 flex-1 flex flex-col">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">🍽️ Food Preference</h3>
              <p className="text-xs text-slate-400 py-2">Select your dietary preference to view available meals</p>
              <div className="grid grid-cols-2 gap-6 flex-1">
                {['Veg', 'Non-Veg'].map(type => (
                  <button key={type} onClick={() => {
                    setFoodTypeFilter(type as 'Veg' | 'Non-Veg');
                    setStep('catering');
                  }}
                    className={`p-12 rounded-3xl border-3 flex flex-col items-center gap-4 transition-all text-center ${
                      foodTypeFilter === type ? 'bg-green-600/20 border-green-600 shadow-2xl' : 'bg-white/5 border-white/10 hover:border-green-600/50'
                    }`}
                  >
                    <span className="text-7xl">{type === 'Veg' ? '🥗' : '🍖'}</span>
                    <div>
                      <h4 className="text-lg font-black text-white uppercase tracking-widest">{type}</h4>
                      <p className="text-xs text-slate-400 mt-1">{type === 'Veg' ? 'Plant-Based Meals' : 'Meat & Fish Options'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'catering' && (
            <div className="space-y-6 flex-1 flex flex-col">
              <div className="flex gap-2 pb-2">
                {['Food', 'Drink', 'Snack'].map(c => (
                  <button key={c} onClick={() => { setCatFilter(c as CateringCategory); }}
                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      catFilter === c ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {c}s
                  </button>
                ))}
              </div>
              
              {catFilter === 'Food' && (
                <div className="flex gap-2 pb-2 items-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">
                    {foodTypeFilter === 'Veg' ? '🥬 Vegetarian' : '🥩 Non-Vegetarian'}
                  </span>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {getFilteredFoods().filter(m => {
                  if (m.category !== catFilter) return false;
                  return true;
                }).map(item => {
                  const selection = selectedCatering.find(sc => sc.itemId === item.id);
                  const outOfStock = item.stock <= 0;
                  return (
                    <div key={item.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${selection ? 'bg-blue-600/10 border-blue-600' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{item.icon}</span>
                        <div>
                          <p className="text-sm font-black text-white leading-tight">{item.label}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{item.desc}</p>
                          <p className={`text-[8px] font-bold mt-1 ${outOfStock ? 'text-red-500' : 'text-blue-400'}`}>
                            {outOfStock ? 'Stock Depleted' : `${item.stock} in stock`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                         <button 
                           onClick={() => updateCateringQty(item.id, -1)}
                           className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10"
                          >
                            -
                          </button>
                          <span className="text-sm font-black text-white w-4 text-center">{selection?.quantity || 0}</span>
                          <button 
                            disabled={outOfStock || (selection?.quantity || 0) >= item.stock}
                            onClick={() => updateCateringQty(item.id, 1)}
                            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-20"
                          >
                            +
                          </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}



          {step === 'card' && paymentMethod === 'Card' && (
            <div className="space-y-6 flex-1 flex flex-col">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">💳 Card Details</h3>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value.replace(/\D/g, '')})}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Card Holder Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    value={cardDetails.cardHolder}
                    onChange={(e) => setCardDetails({...cardDetails, cardHolder: e.target.value})}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Month</label>
                    <input 
                      type="text" 
                      placeholder="MM"
                      maxLength={2}
                      value={cardDetails.expiryMonth}
                      onChange={(e) => setCardDetails({...cardDetails, expiryMonth: e.target.value.replace(/\D/g, '')})}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-center outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Year</label>
                    <input 
                      type="text" 
                      placeholder="YY"
                      maxLength={2}
                      value={cardDetails.expiryYear}
                      onChange={(e) => setCardDetails({...cardDetails, expiryYear: e.target.value.replace(/\D/g, '')})}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-center outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CVV</label>
                    <input 
                      type="text" 
                      placeholder="123"
                      maxLength={3}
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-center outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-600/10 rounded-xl border border-blue-500/20 mt-4">
                  <p className="text-[10px] text-blue-300"><strong>✓ Secure Payment:</strong> All payments are encrypted with SSL 3.0 encryption</p>
                </div>
              </div>
            </div>
          )}

          {step === 'receipt' && generatedReceipt && (
            <div className="space-y-6 flex-1 flex flex-col">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">✓ Payment Successful</h3>
              <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4 overflow-y-auto">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">Booking ID</p>
                    <p className="text-lg font-black text-white">{generatedReceipt.bookingId}</p>
                  </div>
                  <span className="text-4xl">✅</span>
                </div>
                
                <div className="h-px bg-white/10"></div>
                
                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-2">Flight Details</p>
                  <p className="text-white font-bold">{generatedReceipt.flightNumber}</p>
                  <p className="text-xs text-slate-400">{generatedReceipt.date}</p>
                </div>

                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-2">Passengers ({generatedReceipt.passengers.length})</p>
                  <div className="space-y-2">
                    {generatedReceipt.passengers.map((p, i) => (
                      <div key={i} className="text-xs text-white flex justify-between">
                        <span>{p.name} - Seat {p.seat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-white/10"></div>

                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-2">Amount Paid</p>
                  <p className="text-3xl font-black text-blue-400">{format(generatedReceipt.totalPrice)}</p>
                </div>

                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-2">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <span>💳 Card ending in {generatedReceipt.cardLastFour}</span>
                  </div>
                </div>

                <div className="p-3 bg-green-600/10 rounded-xl border border-green-500/20">
                  <p className="text-[9px] text-green-300"><strong>✓ Payment Status:</strong> {generatedReceipt.status}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    if (generatedReceipt) {
                      receiptService.downloadReceiptAsPDF(generatedReceipt);
                    }
                  }}
                  className="flex-1 bg-green-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-500 transition-all active:scale-95"
                >
                  📥 Download Receipt
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 bg-slate-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-500 transition-all active:scale-95"
                >
                  🖨️ Print
                </button>
              </div>
            </div>
          )}

          {step === 'confirmed' && (
            <div className="space-y-6 flex-1 flex flex-col justify-center items-center text-center">
              <div className="text-7xl animate-bounce">✅</div>
              <h3 className="text-2xl font-black text-white">Booking Confirmed!</h3>
              <p className="text-slate-400 text-sm">Your flight has been successfully booked. Check your email for details.</p>
              <button 
                onClick={() => {
                  onClose();
                  window.location.href = '/dashboard';
                }}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="space-y-6 flex-1 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-white rounded-full animate-spin"></div>
              <h3 className="text-xl font-black text-white">Processing Payment...</h3>
              <p className="text-slate-400 text-sm">Please wait while we process your card details securely.</p>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6 flex-1 flex flex-col">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">💳 Choose Payment Method</h3>
              <div className="grid grid-cols-2 gap-4 flex-1">
                {['Card', 'UPI', 'GooglePay', 'Wallet'].map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m as PaymentMethod)}
                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                      paymentMethod === m ? 'bg-blue-600/20 border-blue-600 scale-105 shadow-xl' : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <span className="text-4xl">{m === 'Card' ? '💳' : m === 'UPI' ? '📱' : m === 'GooglePay' ? '🔵' : '👛'}</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{m}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'receipt' && generatedReceipt && (
            <div className="space-y-6 flex-1 flex flex-col">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">✓ Payment Successful</h3>
              <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4 overflow-y-auto">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">Booking ID</p>
                    <p className="text-lg font-black text-white">{generatedReceipt.bookingId}</p>
                  </div>
                  <span className="text-4xl">✅</span>
                </div>
                
                <div className="h-px bg-white/10"></div>
                
                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-2">Flight Details</p>
                  <p className="text-white font-bold">{generatedReceipt.flightNumber}</p>
                  <p className="text-xs text-slate-400">{generatedReceipt.date}</p>
                </div>

                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-2">Passengers ({generatedReceipt.passengers.length})</p>
                  <div className="space-y-2">
                    {generatedReceipt.passengers.map((p, i) => (
                      <div key={i} className="text-xs text-white flex justify-between">
                        <span>{p.name} - Seat {p.seat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-white/10"></div>

                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-2">Amount Paid</p>
                  <p className="text-3xl font-black text-blue-400">{format(generatedReceipt.totalPrice)}</p>
                </div>

                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-2">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <span>💳 Card ending in {generatedReceipt.cardLastFour}</span>
                  </div>
                </div>

                <div className="p-3 bg-green-600/10 rounded-xl border border-green-500/20">
                  <p className="text-[9px] text-green-300"><strong>✓ Payment Status:</strong> {generatedReceipt.status}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    if (generatedReceipt) {
                      receiptService.downloadReceiptAsPDF(generatedReceipt);
                    }
                  }}
                  className="flex-1 bg-green-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-500 transition-all active:scale-95"
                >
                  📥 Download Receipt
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 bg-slate-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-500 transition-all active:scale-95"
                >
                  🖨️ Print
                </button>
              </div>
            </div>
          )}

          {step === 'confirmed' && (
            <div className="space-y-6 flex-1 flex flex-col justify-center items-center text-center">
              <div className="text-7xl animate-bounce">✅</div>
              <h3 className="text-2xl font-black text-white">Booking Confirmed!</h3>
              <p className="text-slate-400 text-sm">Your flight has been successfully booked. Check your email for details.</p>
              <button 
                onClick={() => {
                  onClose();
                  window.location.href = '/dashboard';
                }}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="space-y-6 flex-1 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-white rounded-full animate-spin"></div>
              <h3 className="text-xl font-black text-white">Processing Payment...</h3>
              <p className="text-slate-400 text-sm">Please wait while we process your card details securely.</p>
            </div>
          )}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pricing Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500 uppercase tracking-widest">Base Fare</span>
                <span className="text-white">{format(priceData.subtotal + priceData.ageOffer)}</span>
              </div>
              {priceData.ageOffer > 0 && (
                <div className="flex justify-between text-xs font-bold text-green-400">
                  <span className="uppercase tracking-widest">Age Offer Apply</span>
                  <span>-{format(priceData.ageOffer)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500 uppercase tracking-widest">Plates & Drinks</span>
                <span className="text-white">+{format(priceData.cateringTotal)}</span>
              </div>
              <div className="h-px bg-white/10 pt-2"></div>
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Amount</p>
                <p className="text-4xl font-black text-white tracking-tighter leading-none">{format(priceData.total)}</p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex gap-3">
            {!['confirmed', 'receipt', 'processing'].includes(step) && (
              <button onClick={() => {
                if (step === 'card') setStep('payment');
                else if (step === 'payment') setStep('catering');
                else if (step === 'catering') setStep('foodPreference');
                else setStep('seats');
              }} className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10 hover:bg-white/10">←</button>
            )}
            <button 
              disabled={selectedSeats.length !== totalTravelers || (step === 'payment' && !paymentMethod) || (step === 'card' && (!cardDetails.cardNumber || !cardDetails.cardHolder || !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.cvv))}
              onClick={async () => {
                if (step === 'seats') setStep('foodPreference');
                else if (step === 'foodPreference') setStep('catering');
                else if (step === 'catering') setStep('payment');
                else if (step === 'payment') {
                  if (paymentMethod === 'Card') setStep('card');
                  else handleFinalConfirm();
                }
                else if (step === 'card') {
                  setStep('processing');
                  setTimeout(async () => {
                    // Get user email from localStorage or use default
                    let userEmail = user.email || `${user.name.replace(/\s+/g,'').toLowerCase()}@example.com`;
                    try {
                      const users = JSON.parse(localStorage.getItem('users') || '[]');
                      const userRecord = users.find((u: any) => u.name === user.name);
                      if (userRecord?.email) userEmail = userRecord.email;
                    } catch (e) {}

                    const foodItemsForReceipt = selectedCatering.map(sc => {
                      const item = CATERING_MENU.find(i => i.id === sc.itemId);
                      return `${item?.label} (×${sc.quantity})`;
                    });

                    const transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                    const receipt: ReceiptData = {
                      transactionId: transactionId,
                      passengerName: user.name,
                      email: userEmail,
                      flightNumber: flight.id,
                      airline: flight.airline,
                      origin: flight.originCode,
                      destination: flight.destinationCode,
                      departureDate: flight.departureDate,
                      departureTime: flight.departureTime,
                      arrivalTime: flight.arrivalTime,
                      seats: selectedSeats,
                      totalPassengers: totalTravelers,
                      foodItems: foodItemsForReceipt,
                      subtotal: priceData.subtotal + priceData.ageOffer,
                      discount: priceData.innateDiscount,
                      taxes: priceData.taxes,
                      total: priceData.total,
                      currency: currency,
                      paymentMethod: paymentMethod,
                      cardLast4: cardDetails.cardNumber.slice(-4),
                      receiptDate: new Date().toLocaleDateString(),
                      status: 'PAID'
                    };
                    setGeneratedReceipt(receipt);
                    receiptService.saveReceipt(receipt);
                    try {
                      receiptService.downloadReceiptAsPDF(receipt);
                      notificationService.addNotification('Receipt generated', 'success', false);
                    } catch (e) {
                      console.error('Receipt download error', e);
                      notificationService.addNotification('Receipt error', 'error', false);
                    }
                    setStep('confirmed');
                  }, 2000);
                }
              }}
              className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-20"
            >
              {step === 'processing' ? '⏳ Processing...' : step === 'seats' ? 'Select Food' : step === 'foodPreference' ? 'Review Meals' : step === 'catering' ? 'Proceed to Checkout' : step === 'payment' ? (paymentMethod === 'Card' ? 'Enter Card Details' : 'Complete Payment') : step === 'card' ? 'Process Payment' : 'Download Ticket'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightBookingModal;
