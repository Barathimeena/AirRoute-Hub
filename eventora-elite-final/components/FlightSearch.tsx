
import React, { useState } from 'react';
import { PassengerCounts } from '../types';

interface FlightSearchProps {
  onSearch: (origin: string, destination: string, date: string, time: string, passengers: PassengerCounts) => void;
}

const FlightSearch: React.FC<FlightSearchProps> = ({ onSearch }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [passengers, setPassengers] = useState<PassengerCounts>({ young: 0, adult: 1, elder: 0 });
  const [showPassModal, setShowPassModal] = useState(false);

  const totalPass = passengers.young + passengers.adult + passengers.elder;

  const HUBS = [
    'Chennai','Madurai','Trichy','Coimbatore','Mumbai','Pune','Nagpur','Bengaluru','Mangalore','Hyderabad','New Delhi','Kochi','Trivandrum','Calicut','Kolkata','Ahmedabad','Lucknow','Varanasi',
    'Los Angeles','San Francisco','New York','Miami','Orlando','Dallas','Houston','Chicago','Seattle',
    'Toronto','Vancouver','Montreal','Calgary',
    'Sydney','Melbourne','Brisbane','Perth',
    'London','Edinburgh','Glasgow','Cardiff','Belfast',
    'Dubai','Abu Dhabi','Sharjah','Ras Al Khaimah','Singapore'
  ];

  const updatePass = (type: keyof PassengerCounts, delta: number) => {
    setPassengers(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta)
    }));
  };

  const swapHubs = (e: React.MouseEvent) => {
    e.preventDefault();
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const triggerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // make hubs and date/time validation more forgiving and helpful
    const trim = (s: string) => s.trim();

    // ensure the user has chosen valid hubs from the list
    const validOrigin = HUBS.some(h => h.toLowerCase() === trim(origin).toLowerCase());
    const validDest = HUBS.some(h => h.toLowerCase() === trim(destination).toLowerCase());
    if (!validOrigin || !validDest) {
      alert('⚠️ Please select valid Departure and Arrival hubs from the dropdown.');
      return;
    }
    if (trim(origin).toLowerCase() === trim(destination).toLowerCase()) {
      alert('⚠️ Departure and arrival hubs cannot be the same.');
      return;
    }

    // date/time are optional now; the results list will show all dates if empty
    if (date && !date.trim()) {
      setDate('');
    }
    if (time && !time.trim()) {
      setTime('');
    }

    onSearch(origin, destination, date, time, passengers);
  };

  return (
    <div className="glass p-6 rounded-[3rem] shadow-2xl max-w-7xl mx-auto border border-blue-500/30 relative z-30 bg-gradient-to-br from-blue-900/20 via-slate-900/50 to-slate-950/80 backdrop-blur-2xl" style={{
      backgroundImage: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(15,23,42,0.6) 100%)'
    }}>
      <form onSubmit={triggerSearch} className="flex flex-col lg:flex-row items-stretch gap-3">
        
        {/* Origin */}
        <div className="flex-1 bg-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors border border-white/5 focus-within:bg-white/10">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block">Departure Hub</label>
          <div className="flex items-center mt-1">
            <span className="text-xl mr-3">🛫</span>
            <input 
              list="hubs-list"
              type="text" 
              className="w-full text-lg font-bold text-white bg-transparent outline-none placeholder:text-slate-700" 
              placeholder="e.g. Mumbai" 
              value={origin} 
              onChange={(e) => setOrigin(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex items-center justify-center -mx-2">
           <button 
             type="button" 
             onClick={swapHubs}
             className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-xl rotate-0 hover:rotate-180 duration-500"
           >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
           </button>
        </div>

        {/* Destination */}
        <div className="flex-1 bg-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors border border-white/5 focus-within:bg-white/10">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block">Arrival Hub</label>
          <div className="flex items-center mt-1">
            <span className="text-xl mr-3">🛬</span>
            <input 
              list="hubs-list"
              type="text" 
              className="w-full text-lg font-bold text-white bg-transparent outline-none placeholder:text-slate-700" 
              placeholder="e.g. New York" 
              value={destination} 
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>
        </div>

        <datalist id="hubs-list">
          {HUBS.map(h => <option key={h} value={h} />)}
        </datalist>

        {/* Date Selection - MANDATORY */}
        <div className="flex-1 bg-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors border border-white/5 focus-within:bg-white/10">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block">Travel Date <span className="text-xs text-slate-400">(optional)</span></label>
          <div className="flex items-center mt-1">
            <span className="text-xl mr-3">📅</span>
            <input 
              type="date" 
              className="w-full text-lg font-bold text-white bg-transparent outline-none cursor-pointer filter invert brightness-200" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Time Selection - MANDATORY */}
        <div className="flex-1 bg-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors border border-white/5 focus-within:bg-white/10">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block">Departure Time <span className="text-xs text-slate-400">(optional)</span></label>
          <div className="flex items-center mt-1">
            <span className="text-xl mr-3">🕐</span>
            <input 
              type="time" 
              className="w-full text-lg font-bold text-white bg-transparent outline-none cursor-pointer filter invert brightness-200" 
              value={time} 
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* Passenger Picker */}
        <div className="relative flex-1">
          <button 
            type="button"
            onClick={() => setShowPassModal(!showPassModal)}
            className="w-full h-full bg-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors border border-white/5 text-left flex flex-col justify-center"
          >
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block">Travelers</label>
            <div className="flex items-center mt-1">
              <span className="text-xl mr-3">👥</span>
              <span className="text-lg font-bold text-white">{totalPass} Units</span>
            </div>
          </button>

          {showPassModal && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] p-8 z-50 border border-slate-100 space-y-5 animate-in fade-in slide-in-from-top-4">
              <PassRow label="Young (Under 18) - 20% OFF" count={passengers.young} onAdd={() => updatePass('young', 1)} onSub={() => updatePass('young', -1)} />
              <PassRow label="Adult (18 - 60)" count={passengers.adult} onAdd={() => updatePass('adult', 1)} onSub={() => updatePass('adult', -1)} />
              <PassRow label="Elder (60+) - 15% OFF" count={passengers.elder} onAdd={() => updatePass('elder', 1)} onSub={() => updatePass('elder', -1)} />
              <button 
                type="button"
                onClick={() => setShowPassModal(false)}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
              >
                Apply Manifest
              </button>
            </div>
          )}
        </div>

        <button 
          type="submit"
          className="lg:w-48 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 active:scale-95 flex items-center justify-center space-x-2 py-6 lg:py-0"
        >
          <span>Find Flight</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </form>
    </div>
  );
};

const PassRow = ({ label, count, onAdd, onSub }: any) => (
  <div className="flex justify-between items-center">
    <div className="space-y-0.5">
       <span className="text-sm font-black text-slate-800 block">{label.split(' - ')[0]}</span>
       {label.includes('OFF') && <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block">{label.split(' - ')[1]}</span>}
    </div>
    <div className="flex items-center space-x-4">
      <button type="button" onClick={onSub} className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center font-black text-slate-400 hover:bg-slate-50 transition-colors">-</button>
      <span className="text-xl font-black text-slate-900 w-6 text-center">{count}</span>
      <button type="button" onClick={onAdd} className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center font-black text-blue-600 hover:bg-blue-50 transition-colors">+</button>
    </div>
  </div>
);

export default FlightSearch;
