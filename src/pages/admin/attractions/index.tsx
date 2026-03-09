import React, { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_ATTRACTIONS_API_URL || 'http://localhost:8081';

interface Attraction {
  id: string;
  name: string;
  countryCode: string;
  countryName: string;
  city: string;
  slug: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Summary {
  ALL: number;
  PENDING: number;
  GENERATING: number;
  COMPLETED: number;
  FAILED: number;
}

interface Country {
  code: string;
  name: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  GENERATING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

export default function AdminAttractionsPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [summary, setSummary] = useState<Summary>({ ALL: 0, PENDING: 0, GENERATING: 0, COMPLETED: 0, FAILED: 0 });
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ inserted: number; skipped: number; errors: number } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newAttraction, setNewAttraction] = useState({ name: '', countryCode: '', city: '' });
  const [creating, setCreating] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSummary = useCallback(async () => {
    const res = await fetch(`${API}/api/attractions/summary`);
    if (res.ok) setSummary(await res.json());
  }, []);

  const fetchCountries = useCallback(async () => {
    const res = await fetch(`${API}/api/attractions/countries`);
    if (res.ok) setCountries(await res.json());
  }, []);

  const fetchAttractions = useCallback(async (p = page, s = search, st = statusFilter, cc = countryFilter) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(p),
      pageSize: String(pageSize),
      ...(s && { search: s }),
      ...(st !== 'ALL' && { status: st }),
      ...(cc !== 'ALL' && { countryCode: cc }),
    });
    const res = await fetch(`${API}/api/attractions/list?${params}`);
    if (res.ok) {
      const data = await res.json();
      setAttractions(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  }, [page, search, statusFilter, countryFilter, pageSize]);

  useEffect(() => {
    fetchCountries();
    fetchSummary();
    fetchAttractions(page, search, statusFilter, countryFilter);
  }, []);

  // Auto-refresh every 10s when any attraction is generating
  useEffect(() => {
    const hasGenerating = summary.GENERATING > 0 || generatingIds.size > 0;
    if (hasGenerating) {
      autoRefreshRef.current = setInterval(() => {
        fetchSummary();
        fetchAttractions(page, search, statusFilter, countryFilter);
      }, 10000);
    } else {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    }
    return () => { if (autoRefreshRef.current) clearInterval(autoRefreshRef.current); };
  }, [summary.GENERATING, generatingIds.size]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchAttractions(1, val, statusFilter, countryFilter);
      fetchSummary();
    }, 400);
  };

  const handleStatusFilter = (s: string) => {
    setStatusFilter(s);
    setPage(1);
    fetchAttractions(1, search, s, countryFilter);
  };

  const handleCountryFilter = (cc: string) => {
    setCountryFilter(cc);
    setPage(1);
    fetchAttractions(1, search, statusFilter, cc);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchAttractions(p, search, statusFilter, countryFilter);
  };

  const handleGenerate = async (id: string) => {
    setGeneratingIds((prev) => new Set(prev).add(id));
    await fetch(`${API}/api/attractions/generate/${id}`, { method: 'POST' });
    setTimeout(() => {
      fetchAttractions(page, search, statusFilter, countryFilter);
      fetchSummary();
    }, 1500);
  };

  const handleRegenerate = async (id: string) => {
    setGeneratingIds((prev) => new Set(prev).add(id));
    await fetch(`${API}/api/attractions/regenerate/${id}`, {
      method: 'POST',
      headers: { 'x-api-secret': 'local-dev-secret' },
    });
    setTimeout(() => {
      fetchAttractions(page, search, statusFilter, countryFilter);
      fetchSummary();
    }, 1500);
  };

  const handleImport = async () => {
    setImporting(true);
    setImportResult(null);
    const res = await fetch(`${API}/api/attractions/import-json`, { method: 'POST' });
    if (res.ok) {
      const result = await res.json();
      setImportResult(result);
      fetchAttractions(1, search, statusFilter, countryFilter);
      fetchSummary();
      setPage(1);
    }
    setImporting(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await fetch(`${API}/api/attractions/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAttraction),
    });
    setNewAttraction({ name: '', countryCode: '', city: '' });
    setShowCreate(false);
    setCreating(false);
    fetchAttractions(1, search, statusFilter, countryFilter);
    fetchSummary();
    setPage(1);
  };

  return (
    <>
      <Head>
        <title>Attractions Admin</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Attractions Admin</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreate(!showCreate)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                + Add Attraction
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
              >
                {importing ? 'Importing…' : 'Import from JSON'}
              </button>
            </div>
          </div>

          {/* Import result */}
          {importResult && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              Import complete: <strong>{importResult.inserted}</strong> inserted, <strong>{importResult.skipped}</strong> skipped, <strong>{importResult.errors}</strong> errors
              <button onClick={() => setImportResult(null)} className="ml-3 text-green-600 hover:text-green-800">✕</button>
            </div>
          )}

          {/* Create form */}
          {showCreate && (
            <form onSubmit={handleCreate} className="mb-4 p-4 bg-white border rounded-lg shadow-sm flex gap-3 flex-wrap items-end">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input
                  required
                  value={newAttraction.name}
                  onChange={(e) => setNewAttraction({ ...newAttraction, name: e.target.value })}
                  className="border rounded px-3 py-1.5 text-sm w-48"
                  placeholder="e.g. Eiffel Tower"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                <select
                  required
                  value={newAttraction.countryCode}
                  onChange={(e) => setNewAttraction({ ...newAttraction, countryCode: e.target.value })}
                  className="border rounded px-3 py-1.5 text-sm"
                >
                  <option value="">Select country</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                <input
                  required
                  value={newAttraction.city}
                  onChange={(e) => setNewAttraction({ ...newAttraction, city: e.target.value })}
                  className="border rounded px-3 py-1.5 text-sm w-36"
                  placeholder="e.g. Paris"
                />
              </div>
              <button type="submit" disabled={creating} className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {creating ? 'Creating…' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                Cancel
              </button>
            </form>
          )}

          {/* Status summary pills */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {(['ALL', 'PENDING', 'GENERATING', 'COMPLETED', 'FAILED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                  statusFilter === s
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {s} <span className="ml-1 opacity-75">{summary[s]}</span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <input
              type="text"
              placeholder="Search by name or city…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-64"
            />
            <select
              value={countryFilter}
              onChange={(e) => handleCountryFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="ALL">All Countries</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500 self-center">{total.toLocaleString()} total</span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Country</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">City</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Updated</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">Loading…</td>
                  </tr>
                ) : attractions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">No attractions found</td>
                  </tr>
                ) : (
                  attractions.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                        {a.name}
                        {a.errorMessage && (
                          <p className="text-xs text-red-500 truncate mt-0.5" title={a.errorMessage}>
                            {a.errorMessage.substring(0, 80)}…
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{a.countryName || a.countryCode}</td>
                      <td className="px-4 py-3 text-gray-600">{a.city}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-700'}`}>
                          {a.status === 'GENERATING' && (
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse mr-1" />
                          )}
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(a.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          {a.status === 'PENDING' || a.status === 'FAILED' ? (
                            <button
                              onClick={() => handleGenerate(a.id)}
                              disabled={generatingIds.has(a.id)}
                              className="px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                              Generate
                            </button>
                          ) : a.status === 'COMPLETED' ? (
                            <button
                              onClick={() => handleRegenerate(a.id)}
                              className="px-2 py-1 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600"
                            >
                              Regenerate
                            </button>
                          ) : null}
                          <Link
                            href={`/admin/attractions/${a.id}/edit`}
                            className="px-2 py-1 bg-gray-600 text-white rounded text-xs font-medium hover:bg-gray-700"
                          >
                            Edit
                          </Link>
                          {a.status === 'COMPLETED' && (
                            <Link
                              href={`/attractions/${a.slug}`}
                              target="_blank"
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600"
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 border rounded text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 border rounded text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
