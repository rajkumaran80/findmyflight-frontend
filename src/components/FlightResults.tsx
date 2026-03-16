'use client';

import React from 'react';
import { NormalizedFlight, FlightSearchResult } from '@/lib/api';
import { FlightCard } from './FlightCard';
import { Loader } from 'lucide-react';

interface PassengerBreakdown { adults: number; children: number; infants: number; }

interface FlightResultsProps {
  results: FlightSearchResult | null;
  isLoading: boolean;
  error: string | null;
  onBook: (flight: NormalizedFlight) => void;
  passengers?: number;
  passengerBreakdown?: PassengerBreakdown;
}

export const FlightResults: React.FC<FlightResultsProps> = ({
  results,
  isLoading,
  error,
  onBook,
  passengers = 1,
  passengerBreakdown,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader size={48} className="text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Searching for flights across multiple providers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Search Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Enter your search criteria to find flights</p>
      </div>
    );
  }

  if (results.flights.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-yellow-800 font-semibold mb-2">No Results</h3>
        <p className="text-yellow-700">
          No flights found for your search criteria. Try adjusting your dates or airports.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Summary */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Total Results</p>
            <p className="text-2xl font-bold text-blue-600">{results.totalResults}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Providers Queried</p>
            <p className="text-2xl font-bold text-blue-600">{results.providersQueried.length}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Status</p>
            <p className="text-lg font-semibold">
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${
                  results.status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : results.status === 'partial'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {results.status.toUpperCase()}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Cache Hit</p>
            <p className="text-lg font-semibold">
              <span className={results.cacheHit ? 'text-green-600' : 'text-gray-600'}>
                {results.cacheHit ? 'Yes' : 'No'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Provider Status */}
      {results.providersQueried.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Provider Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.providersQueried.map((provider) => (
              <div
                key={provider.name}
                className={`p-3 rounded-lg text-sm ${
                  provider.status === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : provider.status === 'error'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold capitalize">{provider.name}</span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      provider.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : provider.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {provider.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {provider.resultsCount} result{provider.resultsCount !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-gray-500">
                  {provider.responseTime}ms
                </div>
                {provider.error && (
                  <div className="text-xs text-red-600 mt-1">Error: {provider.error}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flight Results */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Available Flights
          <span className="text-gray-500 text-lg ml-2">({results.flights.length})</span>
        </h2>
        <div>
          {results.flights.map((flight, idx) => (
            <FlightCard key={`${flight.id}_${idx}`} flight={flight} onBook={onBook} passengers={passengers} passengerBreakdown={passengerBreakdown} />
          ))}
        </div>
      </div>
    </div>
  );
};
