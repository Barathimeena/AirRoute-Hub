
import React from 'react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  onBook: () => void;
  currency: 'USD' | 'INR';
}

const EventCard: React.FC<EventCardProps> = ({ event, onBook, currency }) => {
  const isSoldOut = event.availableSeats === 0;
  const price = currency === 'INR' ? event.basePrice * 83 : event.basePrice;

  return (
    <div className="glass rounded-[2rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500 border border-white/5 hover:border-indigo-500/50">
      <div className="relative h-64 overflow-hidden">
        <img src={event.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{event.category}</span>
          {event.isPopular && <span className="bg-orange-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Trending</span>}
        </div>
        <div className="absolute bottom-4 left-6">
          <p className="text-white text-2xl font-black tracking-tight">{event.title}</p>
          <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">{event.venue} • {event.city}</p>
        </div>
      </div>
      
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl">📅</span>
            <span className="text-sm font-bold text-slate-400">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center space-x-1">
             <span className="text-orange-400 text-sm">★</span>
             <span className="text-sm font-black text-slate-300">{event.rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry From</p>
            <p className="text-3xl font-black text-white">{currency === 'INR' ? '₹' : '$'}{price.toLocaleString()}</p>
          </div>
          {isSoldOut ? (
            <button className="bg-slate-800 text-slate-500 px-6 py-3 rounded-2xl font-black text-sm cursor-not-allowed">Waitlist</button>
          ) : (
            <button 
              onClick={onBook}
              className="bg-white text-slate-900 px-8 py-3 rounded-2xl font-black text-sm hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95"
            >
              Get Tickets
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
