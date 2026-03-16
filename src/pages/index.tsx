import React from 'react';
import Link from 'next/link';
import { Plane, Search, Shield, Zap, TrendingDown, Globe, Star, ChevronRight, MapPin } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const DESTINATIONS = [
  { city: 'London', country: 'United Kingdom', code: 'LON', flag: '🇬🇧', color: 'from-blue-600 to-blue-800' },
  { city: 'Paris', country: 'France', code: 'PAR', flag: '🇫🇷', color: 'from-pink-500 to-rose-700' },
  { city: 'Tokyo', country: 'Japan', code: 'TYO', flag: '🇯🇵', color: 'from-red-500 to-red-700' },
  { city: 'New York', country: 'USA', code: 'NYC', flag: '🇺🇸', color: 'from-slate-600 to-slate-800' },
  { city: 'Dubai', country: 'UAE', code: 'DXB', flag: '🇦🇪', color: 'from-amber-500 to-orange-700' },
  { city: 'Singapore', country: 'Singapore', code: 'SIN', flag: '🇸🇬', color: 'from-red-600 to-red-800' },
  { city: 'Bali', country: 'Indonesia', code: 'DPS', flag: '🇮🇩', color: 'from-emerald-500 to-teal-700' },
  { city: 'Sydney', country: 'Australia', code: 'SYD', flag: '🇦🇺', color: 'from-sky-500 to-blue-700' },
  { city: 'Bangkok', country: 'Thailand', code: 'BKK', flag: '🇹🇭', color: 'from-purple-500 to-purple-800' },
  { city: 'Colombo', country: 'Sri Lanka', code: 'CMB', flag: '🇱🇰', color: 'from-green-600 to-green-800' },
];

const FEATURES = [
  {
    icon: <Zap size={24} className="text-yellow-500" />,
    title: 'Instant Results',
    desc: 'Search across multiple airlines simultaneously and get results in seconds.',
  },
  {
    icon: <TrendingDown size={24} className="text-green-500" />,
    title: 'Best Price Guarantee',
    desc: 'We compare hundreds of providers to find you the lowest available fares.',
  },
  {
    icon: <Shield size={24} className="text-blue-500" />,
    title: 'Secure Booking',
    desc: 'Book directly with airlines and trusted travel agencies. No hidden fees.',
  },
  {
    icon: <Globe size={24} className="text-purple-500" />,
    title: 'Worldwide Coverage',
    desc: 'Search flights to 5,000+ destinations across all continents.',
  },
];

const STEPS = [
  { num: '01', title: 'Search', desc: 'Enter your origin, destination, dates and passengers.' },
  { num: '02', title: 'Compare', desc: 'We instantly compare flights from dozens of providers.' },
  { num: '03', title: 'Book', desc: 'Click through to book directly at the best price found.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-900 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/5 rounded-full" />
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-500/20 rounded-full" />
          <div className="absolute -bottom-16 right-1/3 w-96 h-96 bg-indigo-600/20 rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-blue-100 text-sm px-4 py-1.5 rounded-full mb-8 border border-white/10">
            <Star size={13} className="text-yellow-300" />
            Compare 100+ airlines in one search
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
            Your Journey<br />
            <span className="text-sky-300">Starts Here</span>
          </h1>

          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Search, compare, and book flights from hundreds of airlines worldwide.
            Find the best deals for your next adventure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/search"
              className="flex items-center gap-3 bg-orange-500 hover:bg-orange-400 text-white font-bold px-10 py-4 rounded-full text-lg transition-all shadow-xl shadow-orange-600/30 hover:-translate-y-0.5"
            >
              <Search size={20} />
              Search Flights
            </Link>
            <Link
              href="/attractions"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-full text-base border border-white/20 transition-all"
            >
              <MapPin size={17} />
              Explore Destinations
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16 text-center">
            {[
              { value: '100+', label: 'Airlines' },
              { value: '5,000+', label: 'Destinations' },
              { value: '30', label: 'Currencies' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-white">{s.value}</div>
                <div className="text-sm text-blue-200 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 0C1200 40 900 60 720 40C540 20 240 0 0 30L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-500 text-lg">Three simple steps to your next flight</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative text-center">
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-blue-200" />
              )}
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 relative z-10">
                <span className="text-2xl font-extrabold text-blue-600">{step.num}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Popular Destinations</h2>
              <p className="text-gray-500">Explore the world's most-loved travel spots</p>
            </div>
            <Link href="/search" className="hidden md:flex items-center gap-1 text-blue-600 font-semibold text-sm hover:gap-2 transition-all">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.code}
                href={`/search`}
                className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className={`bg-gradient-to-br ${d.color} p-6 h-36 flex flex-col justify-between`}>
                  <span className="text-4xl">{d.flag}</span>
                  <div>
                    <div className="text-white font-bold text-base leading-tight">{d.city}</div>
                    <div className="text-white/70 text-xs">{d.code}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Why Travellyhub?</h2>
          <p className="text-gray-500 text-lg">Everything you need to find the perfect flight</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 mx-4 md:mx-8 rounded-3xl mb-16">
        <div className="text-center px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to Explore the World?
          </h2>
          <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
            Find your next flight at the best price. Hundreds of airlines compared instantly.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 font-bold px-10 py-4 rounded-full text-lg transition-all shadow-lg"
          >
            <Plane size={20} />
            Find Flights Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
