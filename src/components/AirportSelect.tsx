import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { Airport, searchAirports, getAirportDetails, getAirportByCode } from '@/lib/airports';

interface AirportSelectProps {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  label?: string;
}

export default function AirportSelect({
  value,
  onChange,
  placeholder = 'Select airport',
  label = 'Airport',
}: AirportSelectProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      let cancelled = false;
      const timer = setTimeout(() => {
        searchAirports(query).then((filtered) => {
          if (!cancelled) {
            setResults(filtered);
            setIsOpen(true);
          }
        });
      }, 250);
      return () => { cancelled = true; clearTimeout(timer); };
    } else {
      setResults([]);
      if (!selectedAirport) setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync selected airport when value changes externally (e.g. swap)
  useEffect(() => {
    if (!value) {
      setSelectedAirport(null);
      setQuery('');
    } else if (!selectedAirport || selectedAirport.code !== value) {
      setQuery('');
      getAirportByCode(value).then((airport) => {
        if (airport) {
          setSelectedAirport(airport);
        } else {
          setSelectedAirport({ code: value, name: value, city: '', country: '', keywords: '' });
        }
      });
    }
  }, [value]);

  const handleSelect = (airport: Airport) => {
    onChange(airport.code);
    setSelectedAirport(airport);
    setQuery('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (selectedAirport) {
      setSelectedAirport(null);
      onChange('');
    }
  };

  const displayValue = selectedAirport
    ? `${selectedAirport.name} (${selectedAirport.code})`
    : value || '';

  return (
    <div ref={containerRef} className="relative w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

      <div className="relative">
        <div className="absolute left-3 top-2.5 text-gray-400">
          <MapPin size={18} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query || displayValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.length > 0 || results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
          <ChevronDown size={18} />
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 border border-gray-300 rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto">
          {results.map((airport) => (
            <button
              key={airport.code}
              type="button"
              onClick={() => handleSelect(airport)}
              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
              title={getAirportDetails(airport)}
            >
              <div className="font-semibold text-gray-900 text-sm">
                {airport.name} ({airport.code})
              </div>
              <div className="text-xs text-gray-500">
                {airport.city}{airport.country ? `, ${airport.country}` : ''}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length > 0 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 border border-gray-300 rounded-lg bg-white shadow-lg p-4 text-gray-500 text-sm">
          No airports found
        </div>
      )}
    </div>
  );
}
