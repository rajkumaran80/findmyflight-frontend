'use client';

import React, { useState, useMemo } from 'react';
import { SearchForm } from '@/components/SearchForm';
import { FlightResults } from '@/components/FlightResults';
import { FilterSidebar } from '@/components/FilterSidebar';
import { apiClient, FlightSearchResult, NormalizedFlight } from '@/lib/api';

export interface FilterMeta {
  stopsCounts: Record<string, { count: number; minPrice: number }>;
  airlines: { code: string; name: string; count: number }[];
  departureSlots: number[];
  arrivalSlots: number[];
  maxDuration: number;
}

export default function SearchPage() {
  const [results, setResults] = useState<FlightSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [maxStops, setMaxStops] = useState<number | undefined>(undefined);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('asc');
  const [departureTimeSlots, setDepartureTimeSlots] = useState<boolean[]>([true, true, true, true]);
  const [arrivalTimeSlots, setArrivalTimeSlots] = useState<boolean[]>([true, true, true, true]);
  const [maxDuration, setMaxDuration] = useState<number | undefined>(undefined);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  // Handle search
  const handleSearch = async (searchParams: any) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    // Reset filters
    setMaxStops(undefined);
    setSelectedAirlines([]);
    setDepartureTimeSlots([true, true, true, true]);
    setArrivalTimeSlots([true, true, true, true]);
    setMaxDuration(undefined);
    setSortBy('score');
    setSortOrder('asc');

    // Store from/to for filter labels
    setSearchFrom(searchParams.from || '');
    setSearchTo(searchParams.to || '');

    try {
      // Build the search request with only fields the backend DTO accepts
      const breakdown = searchParams.passengerBreakdown;
      const totalPassengers = breakdown
        ? breakdown.adults + breakdown.children + breakdown.infants
        : searchParams.passengers || 1;

      const request: any = {
        from: searchParams.from,
        to: searchParams.to,
        departDate: searchParams.departDate,
        tripType: searchParams.tripType || 'one-way',
        passengers: totalPassengers,
      };

      if (breakdown) {
        request.adults = breakdown.adults;
        request.children = breakdown.children;
        request.infants = breakdown.infants;
      }

      if (searchParams.returnDate) {
        request.returnDate = searchParams.returnDate;
      }

      if (searchParams.cabin) {
        request.cabin = searchParams.cabin;
      }

      const result = await apiClient.searchFlights(request);

      setResults(result);

      // Set default max price based on results
      if (result.flights.length > 0) {
        const prices = result.flights.map((f) => f.price);
        const maxResultPrice = Math.max(...prices);
        setMaxPrice(maxResultPrice);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search flights';
      setError(errorMessage);
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute filter metadata from results
  const filterMeta = useMemo<FilterMeta | null>(() => {
    if (!results || results.flights.length === 0) return null;
    const flights = results.flights;

    // Stops: count and min price for each stop category
    const allPrices = flights.map((f) => f.price);
    const stopsCounts: Record<string, { count: number; minPrice: number }> = {
      any: { count: flights.length, minPrice: Math.min(...allPrices) },
    };
    const maxStopsInResults = Math.max(...flights.map((f) => f.stops));
    for (let s = 0; s <= Math.min(maxStopsInResults, 3); s++) {
      const matching = flights.filter((f) => f.stops <= s);
      if (matching.length > 0) {
        stopsCounts[s] = {
          count: matching.length,
          minPrice: Math.min(...matching.map((f) => f.price)),
        };
      }
    }

    // Airlines: unique airlines from results with counts, sorted by count desc
    const airlineMap = new Map<string, { code: string; name: string; count: number }>();
    flights.forEach((f) => {
      const existing = airlineMap.get(f.airlineCode);
      if (existing) {
        existing.count++;
      } else {
        airlineMap.set(f.airlineCode, { code: f.airlineCode, name: f.airline, count: 1 });
      }
    });
    const airlines = Array.from(airlineMap.values()).sort((a, b) => b.count - a.count);

    // Flight time slots: 00-06, 06-12, 12-18, 18-24
    const departureSlots = [0, 0, 0, 0];
    const arrivalSlots = [0, 0, 0, 0];
    flights.forEach((f) => {
      const depHour = new Date(f.departureTime).getHours();
      const arrHour = new Date(f.arrivalTime).getHours();
      departureSlots[Math.floor(depHour / 6)]++;
      arrivalSlots[Math.floor(arrHour / 6)]++;
    });

    // Max duration
    const maxDur = Math.max(...flights.map((f) => f.duration));

    return { stopsCounts, airlines, departureSlots, arrivalSlots, maxDuration: maxDur };
  }, [results]);

  // Apply filters to results
  const filteredResults = useMemo(() => {
    if (!results) return null;

    let flights = [...results.flights];

    // Apply price filter
    if (maxPrice) {
      flights = flights.filter((f) => f.price <= maxPrice);
    }

    // Apply stops filter
    if (maxStops !== undefined) {
      flights = flights.filter((f) => f.stops <= maxStops);
    }

    // Apply airlines filter
    if (selectedAirlines.length > 0) {
      flights = flights.filter((f) => selectedAirlines.includes(f.airlineCode));
    }

    // Apply departure time slot filter
    if (departureTimeSlots.some((s) => !s)) {
      flights = flights.filter((f) => {
        const hour = new Date(f.departureTime).getHours();
        const slot = Math.floor(hour / 6);
        return departureTimeSlots[slot];
      });
    }

    // Apply arrival time slot filter
    if (arrivalTimeSlots.some((s) => !s)) {
      flights = flights.filter((f) => {
        const hour = new Date(f.arrivalTime).getHours();
        const slot = Math.floor(hour / 6);
        return arrivalTimeSlots[slot];
      });
    }

    // Apply duration filter
    if (maxDuration !== undefined) {
      flights = flights.filter((f) => f.duration <= maxDuration);
    }

    // Apply sorting
    flights = flights.sort((a, b) => {
      let aVal: number;
      let bVal: number;

      switch (sortBy) {
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'duration':
          aVal = a.duration;
          bVal = b.duration;
          break;
        case 'stops':
          aVal = a.stops;
          bVal = b.stops;
          break;
        default:
          aVal = a.rankingScore || 0;
          bVal = b.rankingScore || 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return {
      ...results,
      flights,
      totalResults: flights.length,
    };
  }, [results, maxPrice, maxStops, selectedAirlines, departureTimeSlots, arrivalTimeSlots, maxDuration, sortBy, sortOrder]);

  const handleResetFilters = () => {
    setMaxStops(undefined);
    setSelectedAirlines([]);
    setDepartureTimeSlots([true, true, true, true]);
    setArrivalTimeSlots([true, true, true, true]);
    setMaxDuration(undefined);
    setSortBy('score');
    setSortOrder('asc');
    if (results && results.flights.length > 0) {
      setMaxPrice(Math.max(...results.flights.map((f) => f.price)));
    }
  };

  const handleBook = (flight: NormalizedFlight) => {
    // Track booking attempt (can be connected to analytics)
    console.log('Booking flight:', flight.id);
  };

  // Calculate price range from results
  const priceRange = useMemo(() => {
    if (!results || results.flights.length === 0) {
      return { min: 0, max: 5000 };
    }

    const prices = results.flights.map((f) => f.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [results]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find My Flight</h1>
          <p className="text-gray-600">
            Compare and book flights from multiple airlines
          </p>
        </div>

        {/* Search Form */}
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {/* Results Section */}
        {results && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar Filters */}
            <div className="hidden md:block md:col-span-1">
              {filterMeta && (
                <FilterSidebar
                  filterMeta={filterMeta}
                  fromAirport={searchFrom}
                  toAirport={searchTo}
                  currency={results?.flights[0]?.currency || 'USD'}
                  priceRange={priceRange}
                  maxPrice={maxPrice}
                  maxStops={maxStops}
                  selectedAirlines={selectedAirlines}
                  departureTimeSlots={departureTimeSlots}
                  arrivalTimeSlots={arrivalTimeSlots}
                  maxDuration={maxDuration}
                  maxDurationLimit={filterMeta.maxDuration}
                  sortBy={sortBy}
                  onPriceChange={setMaxPrice}
                  onStopsChange={setMaxStops}
                  onAirlinesChange={setSelectedAirlines}
                  onDepartureTimeSlotsChange={setDepartureTimeSlots}
                  onArrivalTimeSlotsChange={setArrivalTimeSlots}
                  onDurationChange={setMaxDuration}
                  onSortChange={(by, order) => {
                    setSortBy(by);
                    setSortOrder(order);
                  }}
                  onResetFilters={handleResetFilters}
                />
              )}
            </div>

            {/* Main Results */}
            <div className="md:col-span-3">
              <FlightResults
                results={filteredResults}
                isLoading={isLoading}
                error={error}
                onBook={handleBook}
              />
            </div>
          </div>
        )}

        {/* Initial State */}
        {!results && !isLoading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Enter your search criteria above to find flights
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
