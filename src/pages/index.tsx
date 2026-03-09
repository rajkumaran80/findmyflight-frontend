import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find My Flight
          </h1>
          <p className="text-xl text-gray-600">
            Compare flights across multiple providers and save money
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <p className="text-gray-600">Flight combinations daily</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">5+</div>
              <p className="text-gray-600">Major flight providers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">Best</div>
              <p className="text-gray-600">Aggregated pricing</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="font-bold text-lg mb-2">Fast Search</h3>
            <p className="text-gray-600">
              Search across multiple airlines and booking sites simultaneously
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">💡</div>
            <h3 className="font-bold text-lg mb-2">Smart Ranking</h3>
            <p className="text-gray-600">
              AI-powered ranking based on price, duration, and convenience
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-bold text-lg mb-2">Save Money</h3>
            <p className="text-gray-600">
              Compare prices and find the best deals on your flights
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-12">
          <Link
            href="/search"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition"
          >
            Start Searching
          </Link>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <Link href="/attractions" className="flex items-center gap-4 bg-white rounded-lg shadow p-5 hover:shadow-md transition group">
            <div className="text-3xl">🗺️</div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">Explore Attractions</h3>
              <p className="text-sm text-gray-500">Browse travel destinations and top attractions worldwide</p>
            </div>
          </Link>
          <Link href="/admin/attractions" className="flex items-center gap-4 bg-white rounded-lg shadow p-5 hover:shadow-md transition group">
            <div className="text-3xl">⚙️</div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">Admin — Attractions</h3>
              <p className="text-sm text-gray-500">Manage and generate attraction content</p>
            </div>
          </Link>
        </div>

        {/* Features List */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Compare flights from Amadeus, Kiwi.com, Skyscanner, and more
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Filter by price, duration, stops, and airline
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              One-way, round-trip, and multi-city flight searches
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Direct booking links with affiliate commissions
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Real-time cache for faster results
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Worldwide airport support
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
