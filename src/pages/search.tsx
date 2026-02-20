'use client';

import React, { useState, useMemo } from 'react';
import { SearchForm } from '@/components/SearchForm';
import { FlightResults } from '@/components/FlightResults';
import { FilterSidebar } from '@/components/FilterSidebar';
import { apiClient, FlightSearchResult, NormalizedFlight } from '@/lib/api';

export default function SearchPage() {
  const [results, setResults] = useState<FlightSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [maxStops, setMaxStops] = useState<number | undefined>(10);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('asc');

  // Handle search
  const handleSearch = async (searchParams: any) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // Build the search request with only fields the backend DTO accepts
      const request: any = {
        from: searchParams.from,
        to: searchParams.to,
        departDate: searchParams.departDate,
        tripType: searchParams.tripType || 'one-way',
        passengers: searchParams.passengers || 1,
      };

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

    // Apply sorting
    flights = flights.sort((a, b) => {
      let aVal: any;
      let bVal: any;

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
  }, [results, maxPrice, maxStops, selectedAirlines, sortBy, sortOrder]);

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
              <FilterSidebar
                priceRange={priceRange}
                onPriceChange={setMaxPrice}
                onStopsChange={setMaxStops}
                onAirlinesChange={setSelectedAirlines}
                onSortChange={(by, order) => {
                  setSortBy(by);
                  setSortOrder(order);
                }}
                selectedAirlines={selectedAirlines}
                maxPrice={maxPrice}
                maxStops={maxStops}
              />
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
