
import React, { useState, useEffect } from 'react';
import { isHumanName } from '../services/humanService';
import { User, Booking, Flight, Notification, Feedback } from '../types';

interface DashboardProps {
  user: User;
  bookings: Booking[];
  flights: Flight[];
  onAddFeedback: (rating: number, comment: string) => void;
  feedbacks: Feedback[];
  notifications: Notification[];
  onRemoveNotification: (id: string) => void;
}

// Helper function to calculate time until departure
const getTimeUntilDeparture = (departureDate: string, departureTime: string) => {
  try {
    const depDateTime = new Date(`${departureDate}T${departureTime}`);
    const now = new Date();
    const diff = depDateTime.getTime() - now.getTime();
    
    if (diff <= 0) return { text: 'Departed', type: 'departed', color: 'text-slate-400' };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0 && minutes < 120) {
      return { text: `${minutes}m`, type: 'urgent', color: 'text-red-500' };
    } else if (hours < 6) {
      return { text: `${hours}h ${minutes}m`, type: 'soon', color: 'text-orange-500' };
    } else if (hours < 24) {
      return { text: `${hours}h`, type: 'upcoming', color: 'text-blue-400' };
    } else {
      const days = Math.floor(hours / 24);
      return { text: `${days}d ${hours % 24}h`, type: 'upcoming', color: 'text-slate-400' };
    }
  } catch (e) {
    return { text: 'TBD', type: 'unknown', color: 'text-slate-400' };
  }
};

const Dashboard: React.FC<DashboardProps> = ({ user, bookings, flights, onAddFeedback, feedbacks, notifications, onRemoveNotification }) => {
  const [ticketToPrint, setTicketToPrint] = useState<Booking | null>(null);
  const [fbRating, setFbRating] = useState(5);
  const [fbComment, setFbComment] = useState('');
  const [, setUpdateTick] = useState(0); // For live countdown updates (minutes)
  const [secondsTick, setSecondsTick] = useState(0); // for second-level updates

  // Update departure times every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTick(t => t + 1);
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // update countdowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePrint = (booking: Booking) => {
    // Open a print window with the ticket content to ensure reliable download/print
    try {
      const flight = flights.find(f => f.id === booking.flightId);
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Elite Ticket</title><style>body{font-family:system-ui,Segoe UI,Roboto,Arial;background:#fff;color:#111;padding:32px} .ticket{max-width:800px;margin:0 auto;border:8px solid #111;padding:24px;border-radius:24px} .row{display:flex;justify-content:space-between;margin-bottom:8px}</style></head><body><div class="ticket"><h1>ELITE AVIATION</h1><h2>Ticket: ${booking.id}</h2><div class="row"><div><strong>Passenger</strong><div>${booking.userName}</div></div><div><strong>Route</strong><div>${flight?.originCode} → ${flight?.destinationCode}</div></div></div><div class="row"><div><strong>Departure</strong><div>${flight?.origin} • ${flight?.departureTime} • ${booking.flightDeparture}</div></div><div><strong>Arrival</strong><div>${flight?.destination} • ${flight?.arrivalTime}</div></div></div><div style="margin-top:20px"><img src="${booking.qrCode}" alt="qr"/></div><p style="margin-top:16px;font-size:12px;color:#666">Present this pass at terminal check-in. Gate: ${booking.gate}</p></div></body></html>`;
      const w = window.open('', '_blank', 'noopener,noreferrer');
      if (!w) {
        alert('Popup blocked. Allow popups to download the ticket.');
        return;
      }
      w.document.open();
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => { w.print(); w.close(); }, 700);
    } catch (e) {
      alert('Unable to open ticket print window.');
    }
  };

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (fbComment.trim()) {
      onAddFeedback(fbRating, fbComment);
      setFbComment('');
      setFbRating(5);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-10 animate-in fade-in duration-700">
      <header className="glass p-12 rounded-[3.5rem] flex flex-col md:flex-row justify-between items-center gap-8 border border-white/10 relative overflow-hidden">
          <div className="space-y-4">
            <h2 className="text-5xl font-black tracking-tighter text-white leading-none">Terminal Command, <br/>{user.name} <span className="text-[12px] ml-3 align-middle font-black uppercase" style={{color: isHumanName(user.name)?'#34d399':'#fbbf24'}}>{isHumanName(user.name)?'Human':'AI'}</span></h2>
           <p className="text-slate-400 font-medium text-lg">Elite ID: <span className="text-blue-500 font-black">{user.id}</span></p>
        </div>
        <div className="flex gap-12">
           <div className="text-center">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Elite Credits</p>
             <p className="text-4xl font-black text-white tracking-tighter">${user.walletBalance.toLocaleString()}</p>
           </div>
           <div className="text-center">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Loyalty Points</p>
             <p className="text-4xl font-black text-blue-500 tracking-tighter">{user.loyaltyPoints.toLocaleString()}</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-10">
          <section className="space-y-8">
            <h3 className="text-2xl font-black text-white px-2 tracking-tight">Active Hub Routes</h3>
            <div className="space-y-6">
              {bookings.length === 0 ? (
                <div className="glass p-24 rounded-[3rem] text-center space-y-6 border-dashed border-white/10">
                  <div className="text-6xl opacity-30">✈️</div>
                  <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No confirmed routes in terminal manifest</p>
                </div>
              ) : (
                bookings.map(booking => {
                  const flight = flights.find(f => f.id === booking.flightId);
                  return (
                    <div key={booking.id} className="glass rounded-[3rem] overflow-hidden flex flex-col md:flex-row border border-white/10 hover:bg-slate-900/40 transition-all group">
                      <div className="p-10 bg-white/5 border-r border-white/10 flex flex-col items-center justify-center space-y-4 shrink-0">
                        <div className="bg-white p-3 rounded-2xl shadow-2xl">
                          <img src={booking.qrCode} className="w-24 h-24" alt="Ticket QR" />
                        </div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Verify Pass</span>
                      </div>
                      <div className="flex-1 p-10 space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-3xl font-black text-white tracking-tighter">{flight?.originCode} ➔ {flight?.destinationCode}</h4>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1.5">{flight?.airline} • {booking.id}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-5 py-2 rounded-full uppercase tracking-widest border border-blue-400/20">Elite Verified</span>
                            {flight && (
                              <span className={`text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                                getTimeUntilDeparture(booking.flightDeparture, flight.departureTime).type === 'urgent' 
                                  ? 'bg-red-600/20 border border-red-500 text-red-400' 
                                  : getTimeUntilDeparture(booking.flightDeparture, flight.departureTime).type === 'soon'
                                  ? 'bg-orange-600/20 border border-orange-500 text-orange-400'
                                  : 'bg-slate-600/20 border border-slate-500 text-slate-400'
                              }`}>
                                🕐 {getTimeUntilDeparture(booking.flightDeparture, flight.departureTime).text}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-6 border-t border-white/10">
                          <div>
                             <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Departure</p> 
                             <p className="text-sm font-bold text-slate-200">{flight?.origin} <br/> <span className="text-blue-400">{flight?.departureTime}</span></p>
                          </div>
                          <div>
                             <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Cabin Units</p> 
                             <p className="text-sm font-bold text-white bg-white/10 px-3 py-1 rounded-lg inline-block">{booking.seats.join(', ')}</p>
                          </div>
                          <div className="hidden md:block">
                             <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Hub Gate</p> 
                             <p className="text-sm font-bold text-blue-400 uppercase">{booking.gate}</p>
                          </div>
                        </div>
                        <div className="flex gap-4 pt-6">
                          <button onClick={() => handlePrint(booking)} className="flex-1 bg-white text-slate-900 hover:bg-blue-600 hover:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95">Download Pass</button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="space-y-8">
             <h3 className="text-2xl font-black text-white tracking-tight px-2">Terminal Experience Survey</h3>
             <div className="glass p-10 rounded-[3rem] border border-white/10">
                <form onSubmit={submitFeedback} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Elite Service Rating</label>
                        <div className="flex gap-3">
                           {[1,2,3,4,5].map(star => (
                             <button key={star} type="button" onClick={() => setFbRating(star)} className={`text-3xl ${star <= fbRating ? 'text-blue-500' : 'text-slate-800'}`}>★</button>
                           ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Travel Log Detail</label>
                        <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-slate-300 outline-none h-32 resize-none" placeholder="Report on hub efficiency or cabin comfort..." value={fbComment} onChange={e => setFbComment(e.target.value)} />
                      </div>
                      <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest">File Report</button>
                   </div>
                   <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Recent Hub Logs</p>
                      {feedbacks.map(f => (
                        <div key={f.id} className="p-5 bg-white/5 rounded-[1.5rem] border border-white/5 space-y-2">
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-white">{f.userName}</span>
                              <span className="text-[10px] text-blue-400">{'★'.repeat(f.rating)}</span>
                           </div>
                           <p className="text-xs text-slate-400 italic font-medium leading-relaxed">"{f.comment}"</p>
                        </div>
                      ))}
                   </div>
                </form>
             </div>
          </section>
        </div>

        <div className="space-y-8">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-2xl font-black text-white tracking-tight">Notif Hub</h3>
              <div className="flex items-center gap-3">
               <div className="text-sm font-black text-slate-400">{notifications.length} Alerts</div>
              </div>
            </div>
           <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="glass p-10 rounded-[2.5rem] text-center border-white/5 opacity-40">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Alerts Pending</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`p-6 rounded-[2rem] border-2 flex gap-4 transition-all group hover:shadow-lg ${
                    n.type === 'SUCCESS' ? 'bg-green-600/10 border-green-500/20' :
                    n.type === 'ALERT' ? 'bg-red-600/10 border-red-500/20' : 'bg-blue-600/10 border-blue-500/20'
                  }`}>
                    <div className="flex items-start gap-4 w-full">
                      <div className="text-2xl shrink-0 relative">
                        {n.type === 'SUCCESS' ? '✅' : n.type === 'ALERT' ? '🚨' : '📡'}
                        {n.type === 'ALERT' && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-black text-white uppercase tracking-tight leading-none">{n.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-snug mt-2 font-medium">{n.message}</p>
                        {/* if notification has departure timestamp show live countdown */}
                        {n.departureTimestamp && (() => {
                          const diff = n.departureTimestamp - Date.now();
                          let countdownText = 'Departed';
                          if (diff > 0) {
                            const hrs = Math.floor(diff / (1000 * 60 * 60));
                            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            const secs = Math.floor((diff % (1000 * 60)) / 1000);
                            countdownText = `${hrs}h ${mins}m ${secs}s`;
                          }
                          return (
                            <p className="text-[10px] text-slate-300 mt-1 uppercase">⏱ {countdownText}</p>
                          );
                        })()}
                        {n.type === 'ALERT' && n.message.toLowerCase().includes('depart') && (
                          <div className="mt-3 inline-block px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full">
                            <p className="text-[10px] font-black text-red-300 uppercase tracking-widest">🔴 Flight Alert</p>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => onRemoveNotification(n.id)}
                        className="text-xl text-slate-500 hover:text-white transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                        title="Dismiss notification"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>

      {ticketToPrint && (
        <div className="print-only fixed inset-0 bg-white text-slate-900 p-12 z-[200]">
          <div className="max-w-4xl mx-auto border-[12px] border-slate-900 p-12 rounded-[4rem] space-y-12 relative">
             <div className="flex justify-between items-center border-b-[6px] border-slate-900 pb-10">
                <h1 className="text-6xl font-black tracking-tighter text-slate-900">ELITE <span className="text-blue-600">AVIATION</span></h1>
                <div className="text-right">
                   <p className="text-sm font-black uppercase tracking-[0.5em] text-slate-500">Boarding Passport</p>
                   <p className="text-3xl font-black mt-2">{ticketToPrint.id}</p>
                </div>
             </div>
             
             <div className="grid grid-cols-3 gap-12 text-center">
                <div className="space-y-2">
                   <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Elite Hub Traveler</p>
                   <p className="text-2xl font-black text-slate-900">{ticketToPrint.userName}</p>
                </div>
                <div className="space-y-2">
                   <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Hub Route</p>
                   <p className="text-2xl font-black text-slate-900">{ticketToPrint.flightId}</p>
                </div>
                <div className="space-y-2">
                   <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Cabin Units</p>
                   <p className="text-2xl font-black text-blue-600">{ticketToPrint.seats.join(', ')}</p>
                </div>
             </div>

             <div className="flex justify-between items-center bg-slate-50 p-12 rounded-[3rem] border-2 border-slate-100">
                <div className="text-center">
                   <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Departure Hub</p>
                   <p className="text-7xl font-black tracking-tighter text-slate-900">{flights.find(f => f.id === ticketToPrint.flightId)?.originCode}</p>
                   <p className="text-lg font-bold text-blue-600 mt-2">{flights.find(f => f.id === ticketToPrint.flightId)?.departureTime}</p>
                </div>
                <div className="text-6xl text-slate-200">➔</div>
                <div className="text-center">
                   <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Arrival Hub</p>
                   <p className="text-7xl font-black tracking-tighter text-slate-900">{flights.find(f => f.id === ticketToPrint.flightId)?.destinationCode}</p>
                   <p className="text-lg font-bold text-slate-400 mt-2">{flights.find(f => f.id === ticketToPrint.flightId)?.arrivalTime}</p>
                </div>
             </div>

             <div className="flex justify-between items-end border-t-[6px] border-slate-900 pt-10">
                <div className="space-y-6">
                   <div>
                     <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Terminal Gate</p>
                     <p className="text-5xl font-black text-slate-900">{ticketToPrint.gate}</p>
                   </div>
                   <div>
                     <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Travel Manifest Date</p>
                     <p className="text-2xl font-black text-slate-900">{ticketToPrint.flightDeparture}</p>
                   </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-2 border-4 border-slate-900 rounded-2xl">
                    <img src={ticketToPrint.qrCode} className="w-48 h-48" alt="Pass QR" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">Elite Hub Scan</p>
                </div>
             </div>
             
             <p className="text-center text-[8px] font-black uppercase tracking-[0.5em] text-slate-300">Authorized Hub Passport • Eventora Elite Aviation • Verified Access Only</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
