'use client';

import React, { useState } from 'react';
import { NormalizedFlight } from '@/lib/api';
import {
  formatTime,
  formatDuration,
  getStopsText,
} from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Plane, Eye } from 'lucide-react';
import FlightDetailModal from './FlightDetailModal';

interface FlightCardProps {
  flight: NormalizedFlight;
  onBook: (flight: NormalizedFlight) => void;
  passengers?: number;
}

function ItinerarySummaryRow({
  label,
  depTime,
  depAirport,
  arrTime,
  arrAirport,
  duration,
  stops,
}: {
  label: string;
  depTime: string;
  depAirport: string;
  arrTime: string;
  arrAirport: string;
  duration: number;
  stops: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-xs font-medium text-gray-400 w-16 shrink-0">{label}</div>
      <div className="text-center flex-shrink-0 w-16">
        <div className="text-sm font-bold text-gray-900">{formatTime(depTime)}</div>
        <div className="text-xs text-gray-500">{depAirport}</div>
      </div>
      <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
        <div className="text-xs text-gray-400">{formatDuration(duration)}</div>
        <div className="flex items-center gap-1 w-full px-1">
          <div className="flex-1 h-px bg-gray-300"></div>
          <Plane size={12} className="text-gray-400 shrink-0" />
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
        <div className="text-xs text-gray-400">{getStopsText(stops)}</div>
      </div>
      <div className="text-center flex-shrink-0 w-16">
        <div className="text-sm font-bold text-gray-900">{formatTime(arrTime)}</div>
        <div className="text-xs text-gray-500">{arrAirport}</div>
      </div>
    </div>
  );
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, onBook, passengers = 1 }) => {
  const [showModal, setShowModal] = useState(false);
  const { formatConverted } = useCurrency();

  const price = formatConverted(flight.price, flight.currency);
  const outbound = flight.itineraries?.find((i) => i.direction === 'outbound');
  const inbound = flight.itineraries?.find((i) => i.direction === 'inbound');

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 mb-3 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Airline info */}
          <div className="md:w-32 shrink-0">
            <div className="font-semibold text-gray-800 text-sm">{flight.airline}</div>
            <div className="text-xs text-gray-500">{flight.airlineCode}</div>
            <div className="inline-block bg-gray-100 rounded-full px-2 py-0.5 text-xs text-gray-600 mt-1 capitalize">
              {flight.provider}
            </div>
          </div>

          {/* Itinerary summaries */}
          <div className="flex-1 space-y-3">
            {outbound ? (
              <ItinerarySummaryRow
                label="Outbound"
                depTime={outbound.segments[0].departureTime}
                depAirport={outbound.segments[0].departureAirport}
                arrTime={outbound.segments[outbound.segments.length - 1].arrivalTime}
                arrAirport={outbound.segments[outbound.segments.length - 1].arrivalAirport}
                duration={outbound.duration}
                stops={outbound.stops}
              />
            ) : (
              <ItinerarySummaryRow
                label="Outbound"
                depTime={flight.departureTime}
                depAirport={flight.departureAirport}
                arrTime={flight.arrivalTime}
                arrAirport={flight.arrivalAirport}
                duration={flight.duration}
                stops={flight.stops}
              />
            )}

            {inbound && (
              <ItinerarySummaryRow
                label="Return"
                depTime={inbound.segments[0].departureTime}
                depAirport={inbound.segments[0].departureAirport}
                arrTime={inbound.segments[inbound.segments.length - 1].arrivalTime}
                arrAirport={inbound.segments[inbound.segments.length - 1].arrivalAirport}
                duration={inbound.duration}
                stops={inbound.stops}
              />
            )}
          </div>

          {/* Price and View Details */}
          <div className="flex flex-col items-end justify-center gap-2 md:w-36 shrink-0">
            <div className="text-2xl font-bold text-green-600">{price}</div>
            {flight.scoreBreakdown && (
              <div className="text-xs bg-blue-50 rounded px-2 py-0.5">
                <span className="font-semibold text-blue-600">
                  Score: {flight.scoreBreakdown.totalScore}
                </span>
              </div>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
            >
              <Eye size={16} />
              View Details
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <FlightDetailModal
          flight={flight}
          onClose={() => setShowModal(false)}
          onBook={onBook}
          passengers={passengers}
        />
      )}
    </>
  );
};
