import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AirlineFilterProps {
  airlines: string[];
  onChange: (airlines: string[]) => void;
  availableAirlines: string[];
}

/**
 * Major airlines list
 */
export const MAJOR_AIRLINES = [
  { code: 'AA', name: 'American Airlines' },
  { code: 'UA', name: 'United Airlines' },
  { code: 'DL', name: 'Delta Air Lines' },
  { code: 'SW', name: 'Southwest Airlines' },
  { code: 'B6', name: 'JetBlue Airways' },
  { code: 'AS', name: 'Alaska Airlines' },
  { code: 'NK', name: 'Spirit Airlines' },
  { code: 'F9', name: 'Frontier Airlines' },
  { code: 'G4', name: 'Allegiant Air' },
  { code: 'WN', name: 'Southwest Airlines' },
  // International carriers
  { code: 'BA', name: 'British Airways' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'AF', name: 'Air France' },
  { code: 'KL', name: 'KLM Royal Dutch Airlines' },
  { code: 'IB', name: 'Iberia' },
  { code: 'QF', name: 'Qantas' },
  { code: 'SQ', name: 'Singapore Airlines' },
  { code: 'NH', name: 'All Nippon Airways' },
  { code: 'CA', name: 'Air China' },
];

export default function AirlineFilter({
  airlines,
  onChange,
  availableAirlines,
}: AirlineFilterProps) {
  const [visibleAirlines] = useState(
    MAJOR_AIRLINES.filter((a) => availableAirlines.includes(a.code) || availableAirlines.length === 0)
  );

  const toggleAirline = (code: string) => {
    if (airlines.includes(code)) {
      onChange(airlines.filter((a) => a !== code));
    } else {
      onChange([...airlines, code]);
    }
  };

  const clearAll = () => onChange([]);

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Filter by Airline</h3>
        {airlines.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {visibleAirlines.map((airline) => (
          <label key={airline.code} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="checkbox"
              checked={airlines.includes(airline.code)}
              onChange={() => toggleAirline(airline.code)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">
              {airline.code} - {airline.name}
            </span>
          </label>
        ))}
      </div>

      {airlines.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {airlines.map((code) => {
            const airline = MAJOR_AIRLINES.find((a) => a.code === code);
            return (
              <div
                key={code}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {airline?.code}
                <button
                  onClick={() => toggleAirline(code)}
                  className="hover:text-blue-600"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
