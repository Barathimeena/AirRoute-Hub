
import React, { useState, useMemo } from 'react';
import { Flight, Booking, User, PassengerCounts, Feedback, Notification, SelectedCatering } from './types';
import Navbar from './components/Navbar';
import notificationService from './services/notificationService';
import locationService from './services/locationService';
import { useEffect } from 'react';
import FlightSearch from './components/FlightSearch';
import FlightResults from './components/FlightResults';
import FlightBookingModal from './components/FlightBookingModal';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';

const generateFlights = (): Flight[] => {
  const airlines = [
    { name: 'Air India', logo: '🇮🇳' },
    { name: 'IndiGo', logo: '✈️' },
    { name: 'Emirates', logo: '🇦🇪' },
    { name: 'Singapore Airlines', logo: '🇸🇬' },
    { name: 'Delta Air Lines', logo: '🇺🇸' },
    { name: 'Qantas', logo: '🇦🇺' },
    { name: 'Air Canada', logo: '🇨🇦' },
    { name: 'British Airways', logo: '🇬🇧' },
    { name: 'Qatar Airways', logo: '🇶🇦' },
    { name: 'Lufthansa', logo: '🇩🇪' }
  ];
  
  const cities = [
    // India - expanded
    { name: 'Chennai', code: 'MAA' }, { name: 'Madurai', code: 'IXM' }, { name: 'Trichy', code: 'TRZ' }, { name: 'Coimbatore', code: 'CJB' },
    { name: 'Mumbai', code: 'BOM' }, { name: 'Pune', code: 'PNQ' }, { name: 'Nagpur', code: 'NAG' },
    { name: 'Bengaluru', code: 'BLR' }, { name: 'Mangalore', code: 'IXE' },
    { name: 'Hyderabad', code: 'HYD' }, { name: 'New Delhi', code: 'DEL' },
    { name: 'Kochi', code: 'COK' }, { name: 'Trivandrum', code: 'TRV' }, { name: 'Calicut', code: 'CCJ' },
    { name: 'Kolkata', code: 'CCU' }, { name: 'Ahmedabad', code: 'AMD' },
    { name: 'Lucknow', code: 'LKO' }, { name: 'Varanasi', code: 'VNS' },
    // USA
    { name: 'Los Angeles', code: 'LAX' }, { name: 'San Francisco', code: 'SFO' }, { name: 'New York', code: 'JFK' }, { name: 'Miami', code: 'MIA' }, { name: 'Orlando', code: 'MCO' }, { name: 'Dallas', code: 'DFW' }, { name: 'Houston', code: 'IAH' }, { name: 'Chicago', code: 'ORD' }, { name: 'Seattle', code: 'SEA' },
    // Canada
    { name: 'Toronto', code: 'YYZ' }, { name: 'Vancouver', code: 'YVR' }, { name: 'Montreal', code: 'YUL' }, { name: 'Calgary', code: 'YYC' },
    // Australia
    { name: 'Sydney', code: 'SYD' }, { name: 'Melbourne', code: 'MEL' }, { name: 'Brisbane', code: 'BNE' }, { name: 'Perth', code: 'PER' },
    // UK
    { name: 'London', code: 'LHR' }, { name: 'Edinburgh', code: 'EDI' }, { name: 'Glasgow', code: 'GLA' }, { name: 'Cardiff', code: 'CWL' }, { name: 'Belfast', code: 'BFS' },
    // UAE
    { name: 'Dubai', code: 'DXB' }, { name: 'Abu Dhabi', code: 'AUH' }, { name: 'Sharjah', code: 'SHJ' }, { name: 'Ras Al Khaimah', code: 'RKT' },
    // Others
    { name: 'Singapore', code: 'SIN' }, { name: 'Toronto', code: 'YYZ' }
  ];

  const flights: Flight[] = [];
  const now = new Date();
  let flightIndex = 0;

  // Generate flights for all city pairs
  for (let originIdx = 0; originIdx < cities.length; originIdx++) {
    for (let destIdx = 0; destIdx < cities.length; destIdx++) {
      if (originIdx === destIdx) continue; // Skip same origin and destination

      const origin = cities[originIdx];
      const dest = cities[destIdx];
      
      // Generate 3 flights per route on different times
      for (let timeSlot = 0; timeSlot < 3; timeSlot++) {
        const airline = airlines[flightIndex % airlines.length];
        const departureDate = new Date(now);
        departureDate.setDate(now.getDate() + (flightIndex % 30));
        
        flights.push({
          id: `${airline.name.substring(0, 2).toUpperCase()}-${3000 + flightIndex}`,
          airline: airline.name,
          airlineLogo: airline.logo,
          origin: origin.name,
          originCode: origin.code,
          destination: dest.name,
          destinationCode: dest.code,
          departureTime: `${String((timeSlot * 8) % 24).padStart(2, '0')}:${String(timeSlot * 20).padStart(2, '0')}`,
          arrivalTime: `${String(((timeSlot * 8) + 4) % 24).padStart(2, '0')}:45`,
          departureDate: departureDate.toISOString().split('T')[0],
          departureDay: departureDate.toLocaleDateString('en-US', { weekday: 'long' }),
          duration: `${3 + (flightIndex % 12)}h ${(flightIndex % 4) * 15}m`,
          basePrice: 150 + (flightIndex % 100) * 10,
          stops: flightIndex % 10 === 0 ? 1 : 0,
          class: flightIndex % 12 === 0 ? 'First' : flightIndex % 6 === 0 ? 'Business' : 'Economy',
          totalSeats: 200,
          passengersBooked: 50 + (flightIndex % 140),
          discountPercent: flightIndex % 20 === 0 ? 20 : 0,
          discountLabel: flightIndex % 20 === 0 ? 'Flash Deal' : undefined,
          isSoldOut: (50 + (flightIndex % 140)) >= 200
        });
        flightIndex++;
      }
    }
  }
  return flights;
};

const INITIAL_FLIGHTS = generateFlights();

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userCountry, setUserCountry] = useState<string>(''); // Store user's selected country
  const [view, setView] = useState<'home' | 'dashboard' | 'admin'>('home');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [searchParams, setSearchParams] = useState<{origin: string, dest: string, date: string, time: string, pass: PassengerCounts} | null>(null);
  const [flightsState, setFlightsState] = useState<Flight[]>(INITIAL_FLIGHTS);
  const [detectedCurrency, setDetectedCurrency] = useState<'INR' | 'USD'>('USD');

  useEffect(() => {
    // Detect user location and set currency on app load
    locationService.getCurrencyByLocation().then(currency => {
      setDetectedCurrency(currency);
    }).catch(() => {
      // Default to USD if detection fails
      setDetectedCurrency('USD');
    });
  }, []);

  const handleLogin = (
    name: string,
    country: string = 'IN',
    currency: 'INR' | 'USD' = 'INR',
    role: 'ADMIN' | 'FREELANCER' | 'RECRUITER' = 'FREELANCER'
  ) => {
    // Store user's country for currency determination
    setUserCountry(country);
    setDetectedCurrency(currency);
    setUser({
      id: 'P-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      walletBalance: 300000, loyaltyPoints: 12000, preferredLanguage: 'English',
      role
    });
    addNotification('SUCCESS', 'Login Successful', `Welcome ${name}. Terminal access granted from ${country}. Currency: ${currency}`);
    // if admin automatically show admin panel
    if (role === 'ADMIN') {
      setView('admin');
    }
  };

  // extended signature accepts optional departureTimestamp for countdown
  const addNotification = (
    type: 'INFO' | 'ALERT' | 'SUCCESS',
    title: string,
    message: string,
    departureTimestamp?: number
  ) => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      date: new Date().toLocaleTimeString(),
      isRead: false
    };
    if (departureTimestamp) {
      newNotif.departureTimestamp = departureTimestamp;
    }
    setNotifications(prev => [newNotif, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // On app load, convert any due reminders into in-app notifications
  // Setup departure time alerts for booked flights
  useEffect(() => {
    try {
      const due = notificationService.getDueReminders(48);
      if (due && due.length > 0) {
        due.forEach((r: any) => {
          const depTime = new Date(r.flightDeparture).getTime();
          const now = new Date().getTime();
          const hoursUntil = (depTime - now) / (1000 * 60 * 60);
          addNotification(
            'ALERT',
            '🛫 Flight Departure Alert',
            `Your flight ${r.flightId} departs in ~${Math.ceil(hoursUntil)} hours. Check-in now!`,
            depTime
          );
        });
        const ids = due.map((r: any) => r.id);
        notificationService.markReminded(ids);
      }
    } catch (e) { }

    // Setup interval to check for upcoming departures
    const departureCheckInterval = setInterval(() => {
      try {
        bookings.forEach(booking => {
          const departureTime = new Date(booking.flightDeparture).getTime();
          const now = Date.now();
          const timeUntilDeparture = departureTime - now;
          const hoursUntil = timeUntilDeparture / (1000 * 60 * 60);
          
          // Alert 24 hours before
          const departureTimeStamp = departureTime;
          if (hoursUntil > 23.9 && hoursUntil <= 24) {
            addNotification(
              'ALERT',
              '🛫 Departure in 24 Hours',
              `Flight ${booking.flightId} departs tomorrow. Prepare your documents!`,
              departureTimeStamp
            );
          }
          // Alert 6 hours before
          else if (hoursUntil > 5.9 && hoursUntil <= 6) {
            addNotification(
              'ALERT',
              '⚠️ Departure in 6 Hours',
              `Flight ${booking.flightId} departs soon. Head to the airport!`,
              departureTimeStamp
            );
          }
          // Alert 2 hours before
          else if (hoursUntil > 1.9 && hoursUntil <= 2) {
            addNotification(
              'ALERT',
              '🚨 Departure in 2 Hours',
              `Flight ${booking.flightId} is about to depart. Final boarding call!`,
              departureTimeStamp
            );
          }
        });
      } catch (e) {
        console.log('Departure check error:', e);
      }
    }, 60000); // Check every minute

    return () => clearInterval(departureCheckInterval);
  }, [bookings]);

  const currency = useMemo(() => {
    // Use user's country to determine currency
    // If user is from India, show INR; otherwise show USD
    if (userCountry) {
      const isIndia = userCountry.toLowerCase().includes('india');
      return isIndia ? 'INR' : 'USD';
    }
    // Fallback to detected currency
    return detectedCurrency;
  }, [userCountry, detectedCurrency]);

  const filteredFlights = useMemo(() => {
    if (!searchParams) return flightsState.slice(0, 20);
    const { origin, dest, date, time } = searchParams;
    
    return flightsState.filter(f => {
      // Helper: normalize text for comparison
      const norm = (s = '') => (s || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');

      const lowNameO = norm(f.origin);
      const lowCodeO = norm(f.originCode);
      const lowNameD = norm(f.destination);
      const lowCodeD = norm(f.destinationCode);

      const qO = norm(origin);
      const qD = norm(dest);

      const matchField = (q: string, name: string, code: string) => {
        if (!q) return true;
        if (q.length <= 1) return name.includes(q) || code.includes(q);
        // direct includes
        if (name.includes(q) || code.includes(q)) return true;
        // try token starts
        if (name.split('').some((_,i)=> name.startsWith(q))) return true;
        // fallback: partial token match
        return name.indexOf(q) !== -1 || code.indexOf(q) !== -1;
      };

      const originMatch = matchField(qO, lowNameO, lowCodeO);
      const destMatch = matchField(qD, lowNameD, lowCodeD);
      const dateMatch = !date || !date.trim() || f.departureDate === date;
      const timeMatch = !time || !time.trim() || f.departureTime === time;

      return originMatch && destMatch && dateMatch && timeMatch;
    });
  }, [searchParams, flightsState]);

  const handleFlightBooking = (flight: Flight, seats: string[], catering: SelectedCatering[], billing: any) => {
    if (!user) return;
    const newBooking: Booking = {
      id: `ELT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      flightId: flight.id, userId: user.id, userName: user.name,
      seats, passengers: searchParams?.pass || { young: 0, adult: 1, elder: 0 },
      selectedCatering: catering, subtotal: billing.subtotal, discount: billing.discount,
      ageOffer: billing.ageOffer || 0,
      taxes: billing.taxes, totalPrice: billing.total,
      currency, status: 'Confirmed', 
      bookingDate: new Date().toLocaleDateString(),
      flightDeparture: flight.departureDate,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TKT-${user.id}-${flight.id}`,
      paymentMethod: billing.paymentMethod,
      transactionId: `TXN-${Date.now()}`,
      gate: `G-${Math.floor(Math.random() * 50) + 1}`
    };
    
    setBookings([newBooking, ...bookings]);
    addNotification('SUCCESS', 'Hub Secured', `Itinerary for ${flight.originCode} to ${flight.destinationCode} is now confirmed.`);
    
    const deduction = currency === 'INR' ? billing.total / 83 : billing.total;
    setUser({ ...user, walletBalance: user.walletBalance - deduction, loyaltyPoints: user.loyaltyPoints + 1500 });
    setSelectedFlight(null);
    setView('dashboard');

    try {
      const flightDepartureIso = flight.departureDate || new Date().toISOString();
      const departureTime = new Date(flightDepartureIso).getTime();
      const now = Date.now();
      const hoursUntil = (departureTime - now) / (1000 * 60 * 60);
      // persist reminder and if within 48h, add an in-app notification
      notificationService.scheduleFlightReminder({
        id: newBooking.id,
        flightId: flight.id,
        userId: user.id,
        userName: user.name,
        userEmail: user.id + '@example.com',
        seats: newBooking.seats,
        selectedCatering: newBooking.selectedCatering,
        total: newBooking.totalPrice || newBooking.totalPrice,
        flightDeparture: flight.departureDate
      });
      if (hoursUntil <= 48) {
        const departTS = new Date(flight.departureDate + 'T' + flight.departureTime).getTime();
        addNotification(
          'ALERT',
          'Flight Departure Alert',
          `Your flight ${flight.id} departs in ~${Math.ceil(hoursUntil)} hours. Check-in now!`,
          departTS
        );
      }
    } catch (e) { }
  };

  const handleAddFeedback = (rating: number, comment: string) => {
    if (!user) return;
    const fb: Feedback = {
      id: Date.now().toString(),
      userName: user.name,
      rating, comment, date: new Date().toLocaleDateString()
    };
    setFeedbacks([fb, ...feedbacks]);
    addNotification('INFO', 'Feedback Shared', 'Your travel report has been submitted to terminal command.');
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
      <div className="min-h-screen flex flex-col relative text-slate-100">
        <Navbar user={user} onNavigate={(v: any) => setView(v)} activeView={view} onLogout={() => setUser(null)} notificationsCount={notifications.length} />
      
      <main className="flex-grow pt-24 pb-20 no-print">
        {view === 'home' && (
          <div className="max-w-7xl mx-auto px-6">
            <header className="py-12 text-center space-y-8">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] text-glow">
                Eventora Hub <br/> 
                <span className="text-blue-500">Elite Aviation</span>
              </h1>
              <p className="text-slate-400 max-w-2xl mx-auto font-medium text-lg">
                Exclusive flight network connecting 50+ global hubs. <br/>
                Experience the peak of professional travel.
              </p>
              <div className="mt-12">
                <FlightSearch onSearch={(origin, dest, date, time, pass) => setSearchParams({origin, dest, date, time, pass})} />
              </div>
            </header>
            
            <section className="mt-10">
              <FlightResults 
                flights={filteredFlights} 
                onSelect={setSelectedFlight} 
                onWaitlist={(f) => addNotification('ALERT', 'Standby Active', `You are now on the standby list for ${f.id}.`)}
                currency={currency} 
              />
            </section>
          </div>
        )}

        {view === 'dashboard' && (
          <Dashboard 
            user={user} 
            bookings={bookings} 
            flights={flightsState} 
            onAddFeedback={handleAddFeedback} 
            feedbacks={feedbacks}
            notifications={notifications}
            onRemoveNotification={removeNotification}
          />
        )}
        {view === 'admin' && user?.role === 'ADMIN' && (
          <AdminPanel
            flights={flightsState}
            bookings={bookings}
            onAddFlight={(f) => {
              setFlightsState(prev => [f, ...prev]);
              addNotification('SUCCESS', 'Flight Added', `New flight ${f.originCode}→${f.destinationCode} on ${f.departureDate}`);
            }}
          />
        )}
        {view === 'admin' && user?.role === 'ADMIN' && (
          <AdminPanel
            flights={flightsState}
            bookings={bookings}
            onAddFlight={(f) => {
              setFlightsState(prev => [f, ...prev]);
              addNotification('SUCCESS', 'Flight Added', `New flight ${f.originCode}→${f.destinationCode} on ${f.departureDate}`);
            }}
          />
        )}
      </main>

      {selectedFlight && (
        <FlightBookingModal 
          flight={selectedFlight} currency={currency} user={user} 
          passengers={searchParams?.pass || {young:0, adult:1, elder:0}} 
          onClose={() => setSelectedFlight(null)} onConfirm={handleFlightBooking} 
        />
      )}
      <Chatbot user={user} />
    </div>
  );
};

export default App;
