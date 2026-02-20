'use client';

import React from 'react';
import { NormalizedFlight } from '@/lib/api';
import {
  formatTime,
  formatPrice,
  formatDuration,
  getStopsText,
  getDurationWithDays,
} from '@/lib/utils';
import { ExternalLink, Plane } from 'lucide-react';

interface FlightCardProps {
  flight: NormalizedFlight;
  onBook: (flight: NormalizedFlight) => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, onBook }) => {
  const handleBooking = () => {
    window.open(flight.bookingUrl, '_blank');
    onBook(flight);
  };

  const departureTime = formatTime(flight.departureTime);
  const arrivalTime = formatTime(flight.arrivalTime);
  const price = formatPrice(flight.price, flight.currency);
  const duration = formatDuration(flight.duration);
  const stopsText = getStopsText(flight.stops);
  const durationWithDays = getDurationWithDays(flight.departureTime, flight.arrivalTime);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 mb-3 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Flight Details */}
        <div className="flex items-center gap-3">
          <div className="text-center flex-1">
            <div className="text-lg font-bold text-gray-900">{departureTime}</div>
            <div className="text-sm text-gray-600">{flight.departureAirport}</div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="text-xs text-gray-500">{duration}</div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="flex-1 h-px bg-gray-300"></div>
              <Plane size={16} />
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            <div className="text-xs text-gray-500">{stopsText}</div>
          </div>

          <div className="text-center flex-1">
            <div className="text-lg font-bold text-gray-900">{arrivalTime}</div>
            <div className="text-sm text-gray-600">{flight.arrivalAirport}</div>
          </div>
        </div>

        {/* Airline and Details */}
        <div className="md:col-span-1">
          <div className="font-semibold text-gray-800">{flight.airline}</div>
          <div className="text-xs text-gray-500 mt-1">{flight.airlineCode}</div>
          <div className="text-xs text-gray-500 mt-2">{durationWithDays}</div>
          {flight.scoreBreakdown && (
            <div className="mt-2 text-xs bg-blue-50 rounded px-2 py-1">
              <span className="font-semibold text-blue-600">
                Score: {flight.scoreBreakdown.totalScore}
              </span>
            </div>
          )}
        </div>

        {/* Provider Badge */}
        <div className="md:col-span-1">
          <div className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700 capitalize">
            {flight.provider}
          </div>
          {flight.stops > 0 && flight.stopDetails && (
            <div className="text-xs text-gray-500 mt-2">
              Stops:
              {flight.stopDetails.map((stop, idx) => (
                <div key={idx} className="text-gray-600">
                  {stop.airport} ({formatDuration(stop.duration)})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price and Book Button */}
        <div className="flex flex-col items-end justify-center gap-2">
          <div className="text-2xl font-bold text-green-600">{price}</div>
          <button
            onClick={handleBooking}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Book Now
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
