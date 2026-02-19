
import React, { useEffect, useState } from 'react';
import { Flight } from '../types';

interface FlightResultsProps {
  flights: Flight[];
  onSelect: (f: Flight) => void;
  onWaitlist: (f: Flight) => void;
  currency: 'USD' | 'INR';
}

const FlightResults: React.FC<FlightResultsProps> = ({ flights, onSelect, onWaitlist, currency }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60 * 1000); // refresh every minute
    return () => clearInterval(id);
  }, []);

  const parseDeparture = (f: Flight) => {
    try {
      const date = f.departureDate || '';
      let time = f.departureTime || '00:00';
      if (time.length === 4) time = '0' + time;
      if (time.split(':').length === 2) time = time + ':00';
      return new Date(`${date}T${time}`);
    } catch (e) { return new Date(); }
  };

  const timeUntil = (f: Flight) => {
    const d = parseDeparture(f).getTime() - Date.now();
    if (d <= 0) return 'Departed';
    const mins = Math.floor(d / 60000);
    const days = Math.floor(mins / (60 * 24));
    const hours = Math.floor((mins - days * 24 * 60) / 60);
    const minutes = mins % 60;
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const soonest = flights.slice().filter(f=> parseDeparture(f).getTime() - Date.now() > 0).sort((a,b)=> parseDeparture(a).getTime() - parseDeparture(b).getTime())[0];
  const formatPrice = (p: number, discountPercent = 0) => {
    const discountedPrice = p * (1 - discountPercent / 100);
    const finalPrice = currency === 'INR' ? discountedPrice * 83 : discountedPrice;
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: currency, maximumFractionDigits: 0
    }).format(finalPrice);
  };

  const formatBasePrice = (p: number) => {
    const finalPrice = currency === 'INR' ? p * 83 : p;
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: currency, maximumFractionDigits: 0
    }).format(finalPrice);
  };

  if (flights.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-6 glass rounded-[3rem] border-dashed border-white/20">
        <div className="text-7xl">📭</div>
        <h3 className="text-3xl font-black text-white tracking-tighter">No Elite Connections Found</h3>
        <p className="text-slate-400 max-w-sm mx-auto font-medium">We couldn't find any direct routes for these hubs with the current filters. Try broadening your hub name, adjusting the date/time, or clearing the fields.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Reset Terminal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {soonest && (
        <div className="glass p-4 rounded-2xl border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl">📢</div>
            <div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Soonest Flight</div>
              <div className="text-sm font-black text-white">{soonest.id} • {soonest.originCode} ➔ {soonest.destinationCode}</div>
            </div>
          </div>
          <div className="text-sm font-black text-blue-400">Departs in {timeUntil(soonest)}</div>
        </div>
      )}
      <div className="flex justify-between items-center px-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">International Connection Manifest</h3>
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">{flights.length} Direct Hubs Found</p>
      </div>
      
      {flights.map(flight => (
        <div key={flight.id} className={`bg-white rounded-[3rem] p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between border border-slate-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative animate-in fade-in zoom-in-95 duration-500 ${flight.isSoldOut ? 'opacity-80' : ''}`}>
          
          <div className="absolute top-6 right-10 flex gap-3 items-center">
            {flight.discountLabel && (
              <span className="text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest bg-blue-600 text-white shadow-xl shadow-blue-600/30">
                {flight.discountLabel}
              </span>
            )}
            <span className={`text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
              flight.isSoldOut ? 'bg-slate-100 text-slate-400' :
              (flight.totalSeats - flight.passengersBooked) < 15 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
            }`}>
              {flight.isSoldOut ? 'Manifest Full' : `${flight.totalSeats - flight.passengersBooked} Units Available`}
            </span>
            <span className="text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-white/5 text-slate-300">
              ⏱ {timeUntil(flight)}
            </span>
          </div>

          <div className="flex items-center space-x-8 w-full lg:w-1/4">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center font-black text-4xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
              {flight.airlineLogo}
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-900 tracking-tighter leading-tight">{flight.airline}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{flight.id} • {flight.class}</p>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-between px-10 w-full py-10 lg:py-0">
            <div className="text-center">
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{flight.departureTime}</p>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1">{flight.originCode}</p>
              <p className="text-[9px] font-bold text-slate-300 uppercase mt-1 truncate max-w-[80px]">{flight.origin}</p>
            </div>
            <div className="flex-1 mx-8 flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-300 mb-3 uppercase tracking-tighter">{flight.duration}</span>
              <div className="w-full h-px bg-slate-100 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 flex items-center gap-2">
                   <span className="text-xl transform group-hover:translate-x-12 transition-transform duration-[2000ms]">✈️</span>
                </div>
              </div>
              <p className="text-[9px] font-black text-blue-500 mt-3 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">{flight.stops === 0 ? 'Direct Terminal' : `${flight.stops} Connection Stop`}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{flight.arrivalTime}</p>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1">{flight.destinationCode}</p>
              <p className="text-[9px] font-bold text-slate-300 uppercase mt-1 truncate max-w-[80px]">{flight.destination}</p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-10 w-full lg:w-1/4 pt-8 lg:pt-0 border-t lg:border-t-0 border-slate-50">
            <div className="text-right">
              <div className="flex flex-col">
                {flight.discountPercent && flight.discountPercent > 0 && (
                  <span className="text-[11px] text-slate-400 line-through font-black">
                    {formatBasePrice(flight.basePrice)}
                  </span>
                )}
                <p className="text-4xl font-black text-slate-900 tracking-tighter">
                  {formatPrice(flight.basePrice, flight.discountPercent)}
                </p>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Elite Fare / Unit</p>
            </div>
            {flight.isSoldOut ? (
              <button 
                onClick={() => onWaitlist(flight)}
                className="bg-slate-100 text-slate-500 font-black px-10 py-5 rounded-[1.5rem] hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
              >
                Join Waitlist
              </button>
            ) : (
              <button 
                onClick={() => onSelect(flight)}
                className="bg-blue-600 text-white font-black px-12 py-5 rounded-[1.5rem] hover:bg-blue-700 shadow-2xl shadow-blue-600/30 transition-all active:scale-95 text-xs uppercase tracking-widest"
              >
                Secure Hub
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlightResults;
