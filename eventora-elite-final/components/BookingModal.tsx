
import React, { useState } from 'react';
import { Event, User } from '../types';

interface BookingModalProps {
  event: Event;
  currency: 'USD' | 'INR';
  user: User;
  onClose: () => void;
  onConfirm: (event: Event, seats: string[], total: number) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ event, currency, user, onClose, onConfirm }) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const base = currency === 'INR' ? event.basePrice * 83 : event.basePrice;
  const total = selectedSeats.length * base;

  const toggleSeat = (id: string) => {
    if (selectedSeats.includes(id)) {
      setSelectedSeats(selectedSeats.filter(s => s !== id));
    } else if (selectedSeats.length < 10) {
      setSelectedSeats([...selectedSeats, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 rounded-[3rem] shadow-2xl max-w-5xl w-full flex flex-col md:flex-row overflow-hidden border border-white/10">
        
        {/* Seat Map Section */}
        <div className="flex-1 p-12 flex flex-col items-center bg-slate-950/50 border-r border-white/5">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-white">Choose Your Seats</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">{event.venue} Main Stage</p>
          </div>

          <div className="w-full max-w-sm space-y-12">
            <div className="h-2 w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
            
            <div className="grid grid-cols-6 gap-3">
              {['A', 'B', 'C', 'D'].map(row => (
                <React.Fragment key={row}>
                  {[1, 2, 3, 4, 5, 6].map(col => {
                    const id = `${row}${col}`;
                    const isSelected = selectedSeats.includes(id);
                    const isTaken = Math.random() < 0.15;
                    return (
                      <button 
                        key={id}
                        disabled={isTaken}
                        onClick={() => toggleSeat(id)}
                        className={`w-full aspect-square rounded-xl border-2 font-black text-[10px] transition-all ${
                          isTaken ? 'bg-slate-800 border-slate-800 text-slate-600 cursor-not-allowed' :
                          isSelected ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg scale-110' :
                          'bg-slate-900 border-white/5 text-slate-500 hover:border-indigo-400'
                        }`}
                      >
                        {id}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
            
            <div className="flex justify-center gap-6 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-800"></div><span className="text-[10px] font-bold text-slate-500">Taken</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded border border-white/10"></div><span className="text-[10px] font-bold text-slate-500">Free</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-indigo-600"></div><span className="text-[10px] font-bold text-slate-500">Selected</span></div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="w-full md:w-[450px] p-12 flex flex-col justify-between">
          <div className="space-y-10">
            <div className="flex justify-between items-start">
               <div>
                  <h4 className="text-3xl font-black text-white tracking-tighter">Summary</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Order #EVT-{Math.floor(Math.random()*10000)}</p>
               </div>
               <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>

            <div className="glass p-8 rounded-[2rem] space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">Seats</span>
                <span className="text-sm font-black text-indigo-400">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">Total Price</span>
                <span className="text-2xl font-black text-white">{currency === 'INR' ? '₹' : '$'}{total.toLocaleString()}</span>
              </div>
              <div className="h-px bg-white/5"></div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Method</p>
                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                       <span className="text-xl">💳</span>
                       <div>
                          <p className="text-xs font-bold text-white">Eventora Wallet</p>
                          <p className="text-[10px] text-slate-500">Balance: ${user.walletBalance.toLocaleString()}</p>
                       </div>
                    </div>
                    <span className="text-indigo-400">✓</span>
                 </div>
              </div>
            </div>
          </div>

          <button 
            disabled={selectedSeats.length === 0}
            onClick={() => onConfirm(event, selectedSeats, total)}
            className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed mt-10"
          >
            Confirm Reservation
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
