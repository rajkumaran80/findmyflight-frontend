'use client';

import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { formatPrice, formatDuration } from '@/lib/utils';
import { FilterMeta } from '@/pages/search';

interface FilterSidebarProps {
  filterMeta: FilterMeta;
  fromAirport: string;
  toAirport: string;
  currency: string;

  priceRange: { min: number; max: number };
  maxPrice: number;
  maxStops: number | undefined;
  selectedAirlines: string[];
  departureTimeSlots: boolean[];
  arrivalTimeSlots: boolean[];
  maxDuration: number | undefined;
  maxDurationLimit: number;
  sortBy: string;

  onPriceChange: (maxPrice: number) => void;
  onStopsChange: (maxStops: number | undefined) => void;
  onAirlinesChange: (airlines: string[]) => void;
  onDepartureTimeSlotsChange: (slots: boolean[]) => void;
  onArrivalTimeSlotsChange: (slots: boolean[]) => void;
  onDurationChange: (maxDuration: number | undefined) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onResetFilters: () => void;
}

const TIME_SLOT_LABELS = ['00:00\u201305:59', '06:00\u201311:59', '12:00\u201317:59', '18:00\u201323:59'];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filterMeta,
  fromAirport,
  toAirport,
  currency,
  priceRange,
  maxPrice,
  maxStops,
  selectedAirlines,
  departureTimeSlots,
  arrivalTimeSlots,
  maxDuration,
  maxDurationLimit,
  sortBy,
  onPriceChange,
  onStopsChange,
  onAirlinesChange,
  onDepartureTimeSlotsChange,
  onArrivalTimeSlotsChange,
  onDurationChange,
  onSortChange,
  onResetFilters,
}) => {
  const [showAllAirlines, setShowAllAirlines] = useState(false);

  const displayedAirlines = showAllAirlines
    ? filterMeta.airlines
    : filterMeta.airlines.slice(0, 5);

  const durationValue = maxDuration ?? maxDurationLimit;

  const toggleDepartureSlot = (idx: number) => {
    const newSlots = [...departureTimeSlots];
    newSlots[idx] = !newSlots[idx];
    // Don't allow all slots to be deselected
    if (newSlots.every((s) => !s)) return;
    onDepartureTimeSlotsChange(newSlots);
  };

  const toggleArrivalSlot = (idx: number) => {
    const newSlots = [...arrivalTimeSlots];
    newSlots[idx] = !newSlots[idx];
    if (newSlots.every((s) => !s)) return;
    onArrivalTimeSlotsChange(newSlots);
  };

  return (
    <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Filter size={18} />
          <h2 className="text-base font-bold text-gray-900">Filters</h2>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Reset all
        </button>
      </div>

      {/* Sort Options */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Sort by</h3>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value, 'asc')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="score">Best Value (Score)</option>
          <option value="price">Lowest Price</option>
          <option value="duration">Shortest Duration</option>
          <option value="stops">Fewest Stops</option>
        </select>
      </div>

      {/* Stops Filter */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Stops</h3>
        <div className="space-y-1.5">
          {/* Any */}
          {filterMeta.stopsCounts['any'] && (
            <label className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-50">
              <input
                type="radio"
                name="stops"
                checked={maxStops === undefined}
                onChange={() => onStopsChange(undefined)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm text-gray-800">Any</span>
                <span className="text-xs text-gray-500">
                  {filterMeta.stopsCounts['any'].count}
                </span>
              </div>
            </label>
          )}
          {/* Dynamic stop options */}
          {[0, 1, 2, 3].map((s) => {
            const data = filterMeta.stopsCounts[String(s)];
            if (!data) return null;
            const label = s === 0 ? 'Direct only' : `${s} stop${s > 1 ? 's' : ''} max`;
            return (
              <label key={s} className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-50">
                <input
                  type="radio"
                  name="stops"
                  checked={maxStops === s}
                  onChange={() => onStopsChange(s)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-800">{label}</span>
                    <span className="text-xs text-gray-500">{data.count}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    From {formatPrice(data.minPrice, currency)}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Airlines Filter */}
      {filterMeta.airlines.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Airlines</h3>
            <button
              onClick={() => {
                if (selectedAirlines.length === filterMeta.airlines.length) {
                  onAirlinesChange([]);
                } else {
                  onAirlinesChange(filterMeta.airlines.map((a) => a.code));
                }
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {selectedAirlines.length === filterMeta.airlines.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <div className="space-y-1">
            {displayedAirlines.map((airline) => (
              <label
                key={airline.code}
                className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-50"
              >
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
                  className="w-4 h-4 rounded text-blue-600"
                />
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="text-sm text-gray-800 truncate">{airline.name}</span>
                  <span className="text-xs text-gray-400 ml-1 shrink-0">{airline.count}</span>
                </div>
              </label>
            ))}
          </div>
          {filterMeta.airlines.length > 5 && (
            <button
              onClick={() => setShowAllAirlines(!showAllAirlines)}
              className="text-xs text-blue-600 hover:text-blue-800 mt-2 px-2"
            >
              {showAllAirlines
                ? 'Show less'
                : `Show all ${filterMeta.airlines.length} airlines`}
            </button>
          )}
        </div>
      )}

      {/* Flight Times */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Flight times</h3>

        {/* Departure slots */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1.5">
            Departs {fromAirport}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {TIME_SLOT_LABELS.map((label, idx) => (
              <button
                key={`dep-${idx}`}
                onClick={() => toggleDepartureSlot(idx)}
                disabled={filterMeta.departureSlots[idx] === 0}
                className={`text-center py-1.5 px-1 rounded border text-xs transition-colors ${
                  !departureTimeSlots[idx] || filterMeta.departureSlots[idx] === 0
                    ? 'bg-gray-50 border-gray-200 text-gray-300'
                    : 'bg-blue-50 border-blue-300 text-blue-700'
                } ${filterMeta.departureSlots[idx] === 0 ? 'cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}`}
              >
                <div className="font-medium">{label}</div>
                <div className="text-[10px] mt-0.5">{filterMeta.departureSlots[idx]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Arrival slots */}
        <div>
          <div className="text-xs text-gray-500 mb-1.5">
            Arrives {toAirport}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {TIME_SLOT_LABELS.map((label, idx) => (
              <button
                key={`arr-${idx}`}
                onClick={() => toggleArrivalSlot(idx)}
                disabled={filterMeta.arrivalSlots[idx] === 0}
                className={`text-center py-1.5 px-1 rounded border text-xs transition-colors ${
                  !arrivalTimeSlots[idx] || filterMeta.arrivalSlots[idx] === 0
                    ? 'bg-gray-50 border-gray-200 text-gray-300'
                    : 'bg-blue-50 border-blue-300 text-blue-700'
                } ${filterMeta.arrivalSlots[idx] === 0 ? 'cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}`}
              >
                <div className="font-medium">{label}</div>
                <div className="text-[10px] mt-0.5">{filterMeta.arrivalSlots[idx]}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Duration Filter */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Duration</h3>
        <div className="text-xs text-gray-500 mb-2">
          Maximum travel time: <span className="font-medium text-gray-800">{formatDuration(durationValue)}</span>
        </div>
        <input
          type="range"
          min={60}
          max={maxDurationLimit}
          step={30}
          value={durationValue}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            onDurationChange(val >= maxDurationLimit ? undefined : val);
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>1h</span>
          <span>{formatDuration(maxDurationLimit)}</span>
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Price</h3>
        <div className="text-xs text-gray-500 mb-2">
          Max: <span className="font-medium text-gray-800">{formatPrice(maxPrice, currency)}</span>
        </div>
        <input
          type="range"
          min={priceRange.min}
          max={priceRange.max}
          value={maxPrice}
          onChange={(e) => onPriceChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>{formatPrice(priceRange.min, currency)}</span>
          <span>{formatPrice(priceRange.max, currency)}</span>
        </div>
      </div>
    </div>
  );
};
