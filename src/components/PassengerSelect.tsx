import React, { useState, useRef, useEffect } from 'react';
import { Users, ChevronDown } from 'lucide-react';

interface PassengerBreakdown {
  adults: number;
  children: number;
  infants: number;
}

interface PassengerSelectProps {
  value: PassengerBreakdown;
  onChange: (breakdown: PassengerBreakdown) => void;
}

export default function PassengerSelect({ value, onChange }: PassengerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleIncrement = (type: keyof PassengerBreakdown) => {
    const maxPassengers = 9;
    const total = value.adults + value.children + value.infants;
    if (total < maxPassengers) {
      onChange({ ...value, [type]: value[type] + 1 });
    }
  };

  const handleDecrement = (type: keyof PassengerBreakdown) => {
    if (value[type] > (type === 'adults' ? 1 : 0)) {
      onChange({ ...value, [type]: value[type] - 1 });
    }
  };

  const total = value.adults + value.children + value.infants;
  const displayText = `${total} Passenger${total !== 1 ? 's' : ''}`;

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center gap-2">
          <Users size={18} className="text-gray-400" />
          <span>{displayText}</span>
        </div>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 border border-gray-300 rounded-lg bg-white shadow-lg p-4 min-w-max">
          {/* Adults */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold text-gray-900">Adults</div>
                <div className="text-xs text-gray-500">18+</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDecrement('adults')}
                  disabled={value.adults <= 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{value.adults}</span>
                <button
                  type="button"
                  onClick={() => handleIncrement('adults')}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Children */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold text-gray-900">Children</div>
                <div className="text-xs text-gray-500">2-17 years</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDecrement('children')}
                  disabled={value.children <= 0}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{value.children}</span>
                <button
                  type="button"
                  onClick={() => handleIncrement('children')}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Infants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold text-gray-900">Infants</div>
                <div className="text-xs text-gray-500">0-1 year</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDecrement('infants')}
                  disabled={value.infants <= 0}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{value.infants}</span>
                <button
                  type="button"
                  onClick={() => handleIncrement('infants')}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Total Info */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            Total: {total} passenger{total !== 1 ? 's' : ''} (max 9)
          </div>
        </div>
      )}
    </div>
  );
}
