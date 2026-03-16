'use client';

import React, { useEffect } from 'react';
import { NormalizedFlight, FlightItinerary, FlightSegmentDetail } from '@/lib/api';
import {
  formatDateTime,
  formatDuration,
  getStopsText,
  getLayoverMinutes,
} from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { X, Plane, Clock, ExternalLink } from 'lucide-react';

interface PassengerBreakdown { adults: number; children: number; infants: number; }

interface FlightDetailModalProps {
  flight: NormalizedFlight;
  onClose: () => void;
  onBook: (flight: NormalizedFlight) => void;
  passengers?: number;
  passengerBreakdown?: PassengerBreakdown;
}

function SegmentView({ segment }: { segment: FlightSegmentDetail }) {
  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-blue-200"></div>

      {/* Departure */}
      <div className="relative flex items-start gap-3 pb-4">
        <div className="absolute left-[-20px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow"></div>
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {formatDateTime(segment.departureTime)}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">{segment.departureAirport}</span>
            {segment.departureTerminal && (
              <span className="text-gray-500"> · Terminal {segment.departureTerminal}</span>
            )}
          </div>
        </div>
      </div>

      {/* Flight info */}
      <div className="relative flex items-center gap-3 pb-4 pl-0">
        <div className="absolute left-[-20px] top-1.5 w-2.5 h-2.5 flex items-center justify-center">
          <Plane size={10} className="text-blue-400" />
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
          <span className="font-medium text-gray-800">
            {segment.carrierName || segment.carrierCode}
          </span>
          <span>{segment.flightNumber}{segment.cabin ? ` · ${segment.cabin}` : ''}</span>
          {segment.aircraft && <span>Aircraft: {segment.aircraft}</span>}
          <span className="flex items-center gap-1">
            <Clock size={10} />
            Flight time {formatDuration(segment.duration)}
          </span>
        </div>
      </div>

      {/* Arrival */}
      <div className="relative flex items-start gap-3">
        <div className="absolute left-[-20px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow"></div>
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {formatDateTime(segment.arrivalTime)}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">{segment.arrivalAirport}</span>
            {segment.arrivalTerminal && (
              <span className="text-gray-500"> · Terminal {segment.arrivalTerminal}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LayoverView({
  arrivalTime,
  departureTime,
  airport,
}: {
  arrivalTime: string;
  departureTime: string;
  airport: string;
}) {
  const layoverMins = getLayoverMinutes(arrivalTime, departureTime);
  return (
    <div className="flex items-center gap-2 pl-8 py-3">
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs text-amber-700">
        <Clock size={12} />
        <span>
          {formatDuration(layoverMins)} layover in {airport}
        </span>
      </div>
    </div>
  );
}

function ItineraryView({ itinerary }: { itinerary: FlightItinerary }) {
  const firstSeg = itinerary.segments[0];
  const lastSeg = itinerary.segments[itinerary.segments.length - 1];
  const destination = lastSeg.arrivalAirport;
  const stopsText = itinerary.stops === 0 ? 'Direct' : getStopsText(itinerary.stops);

  return (
    <div className="mb-6">
      {/* Itinerary header */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">
          Flight to {destination}
        </h3>
        <div className="text-sm text-gray-500">
          {stopsText} · {formatDuration(itinerary.duration)}
        </div>
      </div>

      {/* Segments */}
      {itinerary.segments.map((segment, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            <LayoverView
              arrivalTime={itinerary.segments[idx - 1].arrivalTime}
              departureTime={segment.departureTime}
              airport={segment.departureAirport}
            />
          )}
          <SegmentView segment={segment} />
        </React.Fragment>
      ))}
    </div>
  );
}

function buildBookingLinks(flight: NormalizedFlight, passengers: number, breakdown?: PassengerBreakdown) {
  const from = flight.departureAirport;
  const to = flight.arrivalAirport;
  const pax = passengers || 1;
  const adults = breakdown?.adults ?? pax;
  const children = breakdown?.children ?? 0;
  const infants = breakdown?.infants ?? 0;

  // Parse departure date
  const depDate = new Date(flight.departureTime);
  const yyyy = depDate.getFullYear();
  const mm = String(depDate.getMonth() + 1).padStart(2, '0');
  const dd = String(depDate.getDate()).padStart(2, '0');
  const yyyymmdd = `${yyyy}-${mm}-${dd}`;
  const ddmm = `${dd}${mm}`; // for Aviasales

  // Detect round-trip: 2 itineraries
  const itins = flight.itineraries || [];
  const isRT = itins.length > 1;
  const returnSeg = isRT ? itins[1].segments[0] : null;
  const retDate = returnSeg ? new Date(returnSeg.departureTime) : null;
  const retYyyymmdd = retDate
    ? `${retDate.getFullYear()}-${String(retDate.getMonth() + 1).padStart(2, '0')}-${String(retDate.getDate()).padStart(2, '0')}`
    : null;

  // Trip.com
  const tripParams = new URLSearchParams({
    dcity: from,
    acity: to,
    ddate: yyyymmdd,
    quantity: String(adults),
    triptype: isRT ? 'rt' : 'ow',
    class: 'y',
    searchboxarg: 't',
    nonstoponly: 'off',
    locale: 'en-XX',
    Allianceid: '7957069',
    SID: '299535566',
    trip_sub1: '',
    trip_sub3: 'D13993968',
  });
  if (children > 0) tripParams.set('childqty', String(children));
  if (infants > 0) tripParams.set('babyqty', String(infants));
  if (retYyyymmdd) tripParams.set('rdate', retYyyymmdd);
  const tripUrl = `https://www.trip.com/flights/showfarefirst?${tripParams.toString()}`;

  // Aviasales via tp.media — format: FROM+DDMM+TO[+DDMM_RETURN]+PAX?marker=
  const retDdmm = retDate
    ? `${String(retDate.getDate()).padStart(2, '0')}${String(retDate.getMonth() + 1).padStart(2, '0')}`
    : '';
  const aviasalesSearch = isRT && retDdmm
    ? `${from}${ddmm}${to}${retDdmm}${adults}${children}${infants}`
    : `${from}${ddmm}${to}${adults}${children}${infants}`;
  const aviasalesPath = `https://www.aviasales.com/search/${aviasalesSearch}?marker=705711`;
  const aviasalesUrl = `https://tp.media/r?campaign_id=100&marker=705711&p=4114&trs=501502&u=${encodeURIComponent(aviasalesPath)}`;

  return { tripUrl, aviasalesUrl };
}

export default function FlightDetailModal({
  flight,
  onClose,
  onBook,
  passengers = 1,
  passengerBreakdown,
}: FlightDetailModalProps) {
  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const { formatConverted } = useCurrency();
  const { tripUrl, aviasalesUrl } = buildBookingLinks(flight, passengers, passengerBreakdown);

  const price = formatConverted(flight.price, flight.currency);
  const itineraries = flight.itineraries || [];

  // Fallback: build a simple itinerary from flat fields if no itineraries
  const displayItineraries =
    itineraries.length > 0
      ? itineraries
      : [
          {
            direction: 'outbound' as const,
            duration: flight.duration,
            stops: flight.stops,
            segments: [
              {
                departureAirport: flight.departureAirport,
                departureTime: flight.departureTime,
                arrivalAirport: flight.arrivalAirport,
                arrivalTime: flight.arrivalTime,
                carrierCode: flight.airlineCode,
                carrierName: flight.airline,
                flightNumber: flight.airlineCode,
                duration: flight.duration,
              },
            ],
          },
        ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Your flight to {flight.arrivalAirport}
            </h2>
            <div className="text-sm text-gray-500">{flight.airline}</div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {displayItineraries.map((itin, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <div className="border-t border-gray-200 my-4"></div>
              )}
              <ItineraryView itinerary={itin} />
            </React.Fragment>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Total price for all travellers</div>
            <div className="text-2xl font-bold text-gray-900">{price}</div>
          </div>
          <div className="flex gap-3">
            <a
              href={tripUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition text-sm"
            >
              Trip.com
              <ExternalLink size={15} />
            </a>
            <a
              href={aviasalesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition text-sm"
            >
              Aviasales
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
