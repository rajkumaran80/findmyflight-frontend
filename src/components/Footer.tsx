import Link from 'next/link';
import { Plane } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Plane size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Travelly<span className="text-orange-400">hub</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Your one-stop hub for finding and comparing flights worldwide. We search hundreds of airlines so you don't have to.
            </p>
            <p className="text-xs mt-4 text-gray-600">
              * Prices are estimates and may vary. We earn a commission when you book through our affiliate links.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="hover:text-white transition-colors">Search Flights</Link></li>
              <li><Link href="/attractions" className="hover:text-white transition-colors">Destinations</Link></li>
              <li><Link href="/search?tripType=round-trip" className="hover:text-white transition-colors">Round Trips</Link></li>
              <li><Link href="/search?tripType=one-way" className="hover:text-white transition-colors">One-Way Flights</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Info</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-500">About Us</span></li>
              <li><span className="text-gray-500">Privacy Policy</span></li>
              <li><span className="text-gray-500">Terms of Use</span></li>
              <li><span className="text-gray-500">Contact</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} Travellyhub. All rights reserved.</span>
          <span>travellyhub.com</span>
        </div>
      </div>
    </footer>
  );
}
