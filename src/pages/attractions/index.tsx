import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';

interface AttractionSummary {
  id: string;
  name: string;
  slug: string;
  countryCode: string;
  country: string;
  city: string;
  seoTitle: string | null;
  metaDescription: string | null;
  photos: { imageUrl: string; altText: string }[];
  updatedAt: string;
}

const ATTRACTIONS_API = process.env.NEXT_PUBLIC_ATTRACTIONS_API_URL || 'http://localhost:3002';

export default function AttractionsPage() {
  const [attractions, setAttractions] = useState<AttractionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    axios
      .get(`${ATTRACTIONS_API}/api/attractions/pages`)
      .then((res) => setAttractions(res.data))
      .catch((err) => console.error('Failed to load attractions:', err))
      .finally(() => setLoading(false));
  }, []);

  // Get unique countries with counts
  const countries = useMemo(() => {
    const countryMap = new Map<string, { code: string; name: string; count: number }>();
    attractions.forEach((a) => {
      const existing = countryMap.get(a.countryCode);
      if (existing) {
        existing.count++;
      } else {
        countryMap.set(a.countryCode, { code: a.countryCode, name: a.country, count: 1 });
      }
    });
    return Array.from(countryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [attractions]);

  // Filter attractions
  const filtered = useMemo(() => {
    let result = attractions;

    if (selectedCountry !== 'all') {
      result = result.filter((a) => a.countryCode === selectedCountry);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.country.toLowerCase().includes(q),
      );
    }

    return result;
  }, [attractions, selectedCountry, searchQuery]);

  // Group by country for display
  const groupedByCountry = useMemo(() => {
    if (selectedCountry !== 'all') return null; // No grouping when filtered
    const groups = new Map<string, { country: string; items: AttractionSummary[] }>();
    filtered.forEach((a) => {
      const existing = groups.get(a.countryCode);
      if (existing) {
        existing.items.push(a);
      } else {
        groups.set(a.countryCode, { country: a.country, items: [a] });
      }
    });
    return Array.from(groups.values()).sort((a, b) => a.country.localeCompare(b.country));
  }, [filtered, selectedCountry]);

  return (
    <>
      <Head>
        <title>Travel Attractions | Travellyhub</title>
        <meta
          name="description"
          content="Discover amazing travel attractions around the world. Detailed guides with history, tips, and things to do."
        />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-blue-600 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <Link href="/" className="text-blue-200 hover:text-white text-sm mb-4 inline-block">
              &larr; Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-2">Travel Attractions</h1>
            <p className="text-blue-100 text-lg">Discover amazing places around the world</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            {/* Search */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search attractions, cities, or countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-96 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* Country Chips */}
            {countries.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCountry('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCountry === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All ({attractions.length})
                </button>
                {countries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setSelectedCountry(c.code)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCountry === c.code
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {c.name} ({c.count})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading attractions...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                {searchQuery ? 'No attractions match your search.' : 'No attractions available yet.'}
              </p>
              {(searchQuery || selectedCountry !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCountry('all');
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : groupedByCountry && !searchQuery ? (
            /* Grouped by country view */
            groupedByCountry.map((group) => (
              <div key={group.country} className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  {group.country}
                  <span className="text-sm font-normal text-gray-400">
                    ({group.items.length} {group.items.length === 1 ? 'attraction' : 'attractions'})
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.items.map((attraction) => (
                    <AttractionCard key={attraction.id} attraction={attraction} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            /* Flat grid view (when filtered or searching) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((attraction) => (
                <AttractionCard key={attraction.id} attraction={attraction} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function AttractionCard({ attraction }: { attraction: AttractionSummary }) {
  return (
    <Link
      href={`/attractions/${attraction.slug}`}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
    >
      {/* Image */}
      <div className="h-48 bg-gray-200 overflow-hidden">
        {attraction.photos[0] ? (
          <img
            src={attraction.photos[0].imageUrl}
            alt={attraction.photos[0].altText}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">
          {attraction.city}, {attraction.country}
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {attraction.name}
        </h2>
        {attraction.metaDescription && (
          <p className="text-sm text-gray-600 line-clamp-2">{attraction.metaDescription}</p>
        )}
      </div>
    </Link>
  );
}
