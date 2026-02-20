'use client';

import React from 'react';
import { Filter } from 'lucide-react';

interface FilterSidebarProps {
  priceRange: { min: number; max: number };
  onPriceChange: (maxPrice: number) => void;
  onStopsChange: (maxStops: number | undefined) => void;
  onAirlinesChange: (airlines: string[]) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  selectedAirlines: string[];
  maxPrice: number;
  maxStops: number | undefined;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  priceRange,
  onPriceChange,
  onStopsChange,
  onAirlinesChange,
  onSortChange,
  selectedAirlines,
  maxPrice,
  maxStops = 10,
}) => {
  const airlines = [
    { code: 'AA', name: 'American Airlines' },
    { code: 'UA', name: 'United Airlines' },
    { code: 'DL', name: 'Delta Air Lines' },
    { code: 'SW', name: 'Southwest Airlines' },
    { code: 'BA', name: 'British Airways' },
    { code: 'LH', name: 'Lufthansa' },
    { code: 'AF', name: 'Air France' },
    { code: 'KL', name: 'KLM' },
  ];

  return (
    <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter size={20} />
        <h2 className="text-lg font-bold">Filters</h2>
      </div>

      {/* Sort Options */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Sort by</h3>
        <select
          onChange={(e) => onSortChange(e.target.value, 'asc')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="score">Best Value (Score)</option>
          <option value="price">Lowest Price</option>
          <option value="duration">Shortest Duration</option>
          <option value="stops">Fewest Stops</option>
        </select>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Max Price: ${maxPrice}
        </label>
        <input
          type="range"
          min={priceRange.min}
          max={priceRange.max}
          value={maxPrice}
          onChange={(e) => onPriceChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>${Math.round(priceRange.min)}</span>
          <span>${Math.round(priceRange.max)}</span>
        </div>
      </div>

      {/* Stops Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Stops</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="stops"
              value="all"
              checked={maxStops === 10}
              onChange={() => onStopsChange(10)}
              className="w-4 h-4"
            />
            <span className="text-sm">All flights</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="stops"
              value="nonstop"
              checked={maxStops === 0}
              onChange={() => onStopsChange(0)}
              className="w-4 h-4"
            />
            <span className="text-sm">Non-stop</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="stops"
              value="one-stop"
              checked={maxStops === 1}
              onChange={() => onStopsChange(1)}
              className="w-4 h-4"
            />
            <span className="text-sm">Up to 1 stop</span>
          </label>
        </div>
      </div>

      {/* Airlines Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Airlines</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {airlines.map((airline) => (
            <label key={airline.code} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedAirlines.includes(airline.code)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onAirlinesChange([...selectedAirlines, airline.code]);
                  } else {
                    onAirlinesChange(selectedAirlines.filter((a) => a !== airline.code));
                  }
                }}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">{airline.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
