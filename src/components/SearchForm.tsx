'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, Plus, Trash2 } from 'lucide-react';
import AirportSelect from './AirportSelect';
import PassengerSelect from './PassengerSelect';

interface PassengerBreakdown {
  adults: number;
  children: number;
  infants: number;
}

interface FlightLeg {
  id: string;
  from: string;
  to: string;
  departDate: string;
}

interface SearchFormProps {
  onSearch: (searchParams: {
    from: string;
    to: string;
    departDate: string;
    returnDate?: string;
    passengers?: number;
    passengerBreakdown?: PassengerBreakdown;
    tripType: 'one-way' | 'round-trip' | 'multi-city';
    cabin?: 'economy' | 'business' | 'first' | 'premium-economy';
    segments?: { from: string; to: string; departDate: string }[];
  }) => void;
  isLoading?: boolean;
}

let legIdCounter = 0;
function createLeg(from = '', to = '', departDate = ''): FlightLeg {
  return { id: `leg-${++legIdCounter}`, from, to, departDate };
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading = false }) => {
  const [tripType, setTripType] = useState<'one-way' | 'round-trip' | 'multi-city'>('one-way');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [cabin, setCabin] = useState<'economy' | 'business' | 'first' | 'premium-economy'>('economy');
  const [passengerBreakdown, setPassengerBreakdown] = useState<PassengerBreakdown>({
    adults: 1,
    children: 0,
    infants: 0,
  });

  // Multi-city legs
  const [legs, setLegs] = useState<FlightLeg[]>([
    createLeg(),
    createLeg(),
  ]);

  const handleTripTypeChange = (type: typeof tripType) => {
    setTripType(type);
    if (type === 'multi-city' && legs.length < 2) {
      setLegs([createLeg(), createLeg()]);
    }
  };

  const updateLeg = (index: number, field: keyof FlightLeg, value: string) => {
    setLegs((prev) => prev.map((leg, i) => (i === index ? { ...leg, [field]: value } : leg)));
  };

  const addLeg = () => {
    if (legs.length >= 6) return;
    // Auto-fill "from" of new leg with "to" of last leg
    const lastLeg = legs[legs.length - 1];
    setLegs((prev) => [...prev, createLeg(lastLeg?.to || '', '', '')]);
  };

  const removeLeg = (index: number) => {
    if (legs.length <= 2) return;
    setLegs((prev) => prev.filter((_, i) => i !== index));
  };

  const swapAirports = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const swapLegAirports = (index: number) => {
    setLegs((prev) =>
      prev.map((leg, i) =>
        i === index ? { ...leg, from: leg.to, to: leg.from } : leg
      )
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (tripType === 'multi-city') {
      for (let i = 0; i < legs.length; i++) {
        if (!legs[i].from || !legs[i].to || !legs[i].departDate) {
          alert(`Please fill in all fields for flight ${i + 1}`);
          return;
        }
      }

      const totalPassengers = passengerBreakdown.adults + passengerBreakdown.children + passengerBreakdown.infants;
      onSearch({
        from: legs[0].from.toUpperCase(),
        to: legs[0].to.toUpperCase(),
        departDate: legs[0].departDate,
        passengers: totalPassengers,
        passengerBreakdown,
        tripType: 'multi-city',
        cabin,
        segments: legs.map((leg) => ({
          from: leg.from.toUpperCase(),
          to: leg.to.toUpperCase(),
          departDate: leg.departDate,
        })),
      });
      return;
    }

    if (!from || !to || !departDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (tripType === 'round-trip' && !returnDate) {
      alert('Please select a return date for round-trip');
      return;
    }

    const totalPassengers = passengerBreakdown.adults + passengerBreakdown.children + passengerBreakdown.infants;

    onSearch({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      departDate,
      returnDate: tripType === 'round-trip' ? returnDate : undefined,
      passengers: totalPassengers,
      passengerBreakdown,
      tripType,
      cabin,
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSearch} className="w-full bg-white rounded-lg shadow-md p-6 space-y-5">
      {/* Trip Type Selection */}
      <div className="flex gap-4 border-b pb-4">
        {(['one-way', 'round-trip', 'multi-city'] as const).map((type) => (
          <label key={type} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tripType"
              value={type}
              checked={tripType === type}
              onChange={() => handleTripTypeChange(type)}
              className="w-4 h-4"
            />
            <span className="text-gray-700 capitalize">{type.replace('-', ' ')}</span>
          </label>
        ))}
      </div>

      {/* One-way / Round-trip layout */}
      {tripType !== 'multi-city' && (
        <>
          {/* From - Swap - To in one line */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <AirportSelect
                value={from}
                onChange={setFrom}
                label="From"
                placeholder="Departure city or airport"
              />
            </div>
            <button
              type="button"
              onClick={swapAirports}
              className="mb-0.5 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              title="Swap airports"
            >
              <ArrowRightLeft size={20} className="text-gray-500" />
            </button>
            <div className="flex-1">
              <AirportSelect
                value={to}
                onChange={setTo}
                label="To"
                placeholder="Arrival city or airport"
              />
            </div>
          </div>

          {/* Dates and Passengers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Depart</label>
              <input
                type="date"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                min={today}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {tripType === 'round-trip' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={departDate || today}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}

            <div className={tripType === 'round-trip' ? '' : 'md:col-start-2'}>
              <PassengerSelect
                value={passengerBreakdown}
                onChange={setPassengerBreakdown}
              />
            </div>
          </div>
        </>
      )}

      {/* Multi-city layout */}
      {tripType === 'multi-city' && (
        <div className="space-y-4">
          {legs.map((leg, index) => (
            <div key={leg.id} className="relative border border-gray-200 rounded-lg p-4 bg-gray-50">
              {/* Leg header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Flight {index + 1}</span>
                {legs.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeLeg(index)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                    title="Remove this flight"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* From - Swap - To in one line */}
              <div className="flex items-end gap-2 mb-3">
                <div className="flex-1">
                  <AirportSelect
                    value={leg.from}
                    onChange={(code) => updateLeg(index, 'from', code)}
                    label="From"
                    placeholder="Departure city"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => swapLegAirports(index)}
                  className="mb-0.5 p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                  title="Swap airports"
                >
                  <ArrowRightLeft size={18} className="text-gray-500" />
                </button>
                <div className="flex-1">
                  <AirportSelect
                    value={leg.to}
                    onChange={(code) => updateLeg(index, 'to', code)}
                    label="To"
                    placeholder="Arrival city"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">Depart</label>
                <input
                  type="date"
                  value={leg.departDate}
                  onChange={(e) => updateLeg(index, 'departDate', e.target.value)}
                  min={index > 0 && legs[index - 1].departDate ? legs[index - 1].departDate : today}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          ))}

          {/* Add leg button */}
          {legs.length < 6 && (
            <button
              type="button"
              onClick={addLeg}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Plus size={18} />
              Add another flight
            </button>
          )}

          {/* Passengers for multi-city */}
          <div className="max-w-xs">
            <PassengerSelect
              value={passengerBreakdown}
              onChange={setPassengerBreakdown}
            />
          </div>
        </div>
      )}

      {/* Cabin Class */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cabin Class</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(['economy', 'premium-economy', 'business', 'first'] as const).map((cabinOption) => (
            <label key={cabinOption} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="cabin"
                value={cabinOption}
                checked={cabin === cabinOption}
                onChange={(e) => setCabin(e.target.value as typeof cabin)}
                className="w-4 h-4"
              />
              <span className="text-gray-700 capitalize text-sm">{cabinOption.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Search Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {isLoading ? 'Searching...' : 'Search Flights'}
      </button>
    </form>
  );
};

export default SearchForm;
