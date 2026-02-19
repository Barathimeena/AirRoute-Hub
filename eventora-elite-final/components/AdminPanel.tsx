import React, { useState } from 'react';
import { Flight, Booking } from '../types';

interface AdminPanelProps {
  flights: Flight[];
  bookings: Booking[];
  onAddFlight: (flight: Flight) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ flights, bookings, onAddFlight }) => {
  const [form, setForm] = useState<Partial<Flight>>({
    airline: '',
    origin: '',
    originCode: '',
    destination: '',
    destinationCode: '',
    departureDate: '',
    departureTime: '',
    arrivalTime: '',
    basePrice: 0,
    class: 'Economy',
    totalSeats: 0
  });
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

  const handleChange = (field: keyof Flight, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.airline || !form.origin || !form.originCode || !form.destination || !form.destinationCode || !form.departureDate || !form.departureTime) {
      alert('Please fill out the required fields');
      return;
    }
    const id = `FL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newFlight: Flight = {
      id,
      airline: form.airline || '',
      airlineLogo: '',
      origin: form.origin || '',
      originCode: form.originCode || '',
      destination: form.destination || '',
      destinationCode: form.destinationCode || '',
      departureTime: form.departureTime || '',
      arrivalTime: form.arrivalTime || '',
      departureDate: form.departureDate || '',
      departureDay: new Date(form.departureDate || '').toLocaleDateString('en-US', { weekday: 'long' }),
      duration: '',
      basePrice: form.basePrice || 0,
      stops: 0,
      class: (form.class as any) || 'Economy',
      totalSeats: form.totalSeats || 0,
      passengersBooked: 0
    } as Flight;

    onAddFlight(newFlight);
    setForm({ airline: '', origin: '', originCode: '', destination: '', destinationCode: '', departureDate: '', departureTime: '', arrivalTime: '', basePrice: 0, class: 'Economy', totalSeats: 0 });
  };

  const flightBookings = (flightId: string) => bookings.filter(b => b.flightId === flightId);

  const passengerCount = (flightId: string) => {
    return flightBookings(flightId).reduce((acc, b) => {
      if (typeof b.passengers === 'object') {
        return acc + (b.passengers.young || 0) + (b.passengers.adult || 0) + (b.passengers.elder || 0);
      }
      return acc;
    }, 0);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <h2 className="text-3xl font-black text-white">Administrator Panel</h2>

      {/* global bookings overview */}
      <div className="bg-white/10 p-6 rounded-2xl border border-white/20">
        <h3 className="text-xl font-bold mb-4 text-white">All Bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-white">No bookings have been made yet.</p>
        ) : (
          <table className="w-full text-sm text-white">
            <thead>
              <tr className="border-b border-white/20">
                <th className="py-2 text-left">Booking ID</th>
                <th className="py-2 text-left">Passenger</th>
                <th className="py-2 text-left">Flight</th>
                <th className="py-2 text-left">Seats</th>
                <th className="py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-b border-white/10">
                  <td className="py-2">{b.id}</td>
                  <td className="py-2">{b.userName}</td>
                  <td className="py-2">{b.flightId}</td>
                  <td className="py-2">{Array.isArray(b.seats) ? b.seats.join(', ') : ''}</td>
                  <td className="py-2">{b.flightDeparture}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white/10 p-6 rounded-2xl border border-white/20">
        <h3 className="text-xl font-bold mb-4 text-white">Add New Flight</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white">
          <input placeholder="Airline" value={form.airline} onChange={e => handleChange('airline', e.target.value)} className="p-3 bg-white/5 rounded-lg" />
          <input placeholder="Origin (name)" value={form.origin} onChange={e => handleChange('origin', e.target.value)} className="p-3 bg-white/5 rounded-lg" />
          <input placeholder="Origin Code" value={form.originCode} onChange={e => handleChange('originCode', e.target.value)} className="p-3 bg-white/5 rounded-lg" />
          <input placeholder="Destination (name)" value={form.destination} onChange={e => handleChange('destination', e.target.value)} className="p-3 bg-white/5 rounded-lg" />
          <input placeholder="Destination Code" value={form.destinationCode} onChange={e => handleChange('destinationCode', e.target.value)} className="p-3 bg-white/5 rounded-lg" />
          <input type="date" placeholder="Departure Date" value={form.departureDate} onChange={e => handleChange('departureDate', e.target.value)} className="p-3 bg-white/5 rounded-lg" />
          <input type="time" placeholder="Departure Time" value={form.departureTime} onChange={e => handleChange('departureTime', e.target.value)} className="p-3 bg-white/5 rounded-lg" />
          <input type="time" placeholder="Arrival Time" value={form.arrivalTime} onChange={e => handleChange('arrivalTime', e.target.value)} className="p-3 bg-white/5 rounded-lg" />
          <input type="number" placeholder="Base Price" value={form.basePrice} onChange={e => handleChange('basePrice', Number(e.target.value))} className="p-3 bg-white/5 rounded-lg" />
          <input type="number" placeholder="Total Seats" value={form.totalSeats} onChange={e => handleChange('totalSeats', Number(e.target.value))} className="p-3 bg-white/5 rounded-lg" />
          <button type="submit" className="col-span-full bg-blue-600 py-3 rounded-lg text-white font-bold">Create Flight</button>
        </form>
      </div>

      <div className="bg-white/10 p-6 rounded-2xl border border-white/20">
        <h3 className="text-xl font-bold mb-4 text-white">Existing Flights</h3>
        {flights.length === 0 ? (
          <p className="text-white">No flights available.</p>
        ) : (
          <table className="w-full text-sm text-white">
            <thead>
              <tr className="border-b border-white/20">
                <th className="py-2 text-left">ID</th>
                <th className="py-2 text-left">Route</th>
                <th className="py-2 text-left">Departure</th>
                <th className="py-2 text-left">Booked</th>
                <th className="py-2 text-left">Passengers</th>
                <th className="py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flights.map(f => (
                <tr key={f.id} className="border-b border-white/10">
                  <td className="py-2">{f.id}</td>
                  <td className="py-2">{f.originCode} → {f.destinationCode}</td>
                  <td className="py-2">{f.departureDate} {f.departureTime}</td>
                  <td className="py-2">{flightBookings(f.id).length}</td>
                  <td className="py-2">{passengerCount(f.id)}</td>
                  <td className="py-2">
                    <button onClick={() => setSelectedFlightId(f.id)} className="text-blue-300 underline">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {selectedFlightId && (
          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <h4 className="font-bold text-white mb-2">Bookings for {selectedFlightId}</h4>
            {flightBookings(selectedFlightId).length === 0 ? (
              <p className="text-white">No bookings yet.</p>
            ) : (
              <ul className="text-white text-sm space-y-2">
                {flightBookings(selectedFlightId).map(b => (
                  <li key={b.id} className="border border-white/20 p-2 rounded-lg">
                    <p><strong>{b.userName}</strong> (ID: {b.id})</p>
                    <p>Seats: {Array.isArray(b.seats) ? b.seats.join(', ') : ''}</p>
                    <p>Passengers: {typeof b.passengers === 'object' ? `${b.passengers.adult + b.passengers.young + b.passengers.elder}` : ''}</p>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setSelectedFlightId(null)} className="mt-4 text-xs underline text-blue-200">Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
