import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const API = '';

interface Photo {
  id: string;
  imageUrl: string;
  altText: string;
  source: string | null;
  sortOrder: number;
}

interface Attraction {
  id: string;
  name: string;
  slug: string;
  countryCode: string;
  country: string;
  city: string;
  status: string;
  seoTitle: string | null;
  metaDescription: string | null;
  contentHtml: string | null;
  bestTimeToVisit: string | null;
  entryFee: string | null;
  errorMessage: string | null;
  photos: Photo[];
}

export default function EditAttractionPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoAlt, setNewPhotoAlt] = useState('');
  const [addingPhoto, setAddingPhoto] = useState(false);

  const [form, setForm] = useState({
    name: '',
    seoTitle: '',
    metaDescription: '',
    contentHtml: '',
    bestTimeToVisit: '',
    entryFee: '',
  });

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/api/attractions/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAttraction(data);
        setForm({
          name: data.name || '',
          seoTitle: data.seoTitle || '',
          metaDescription: data.metaDescription || '',
          contentHtml: data.contentHtml || '',
          bestTimeToVisit: data.bestTimeToVisit || '',
          entryFee: data.entryFee || '',
        });
        setLoading(false);
      });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch(`${API}/api/attractions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRegenerate = async () => {
    setGenerating(true);
    await fetch(`${API}/api/attractions/regenerate/${id}`, {
      method: 'POST',
      headers: { 'x-api-secret': 'local-dev-secret' },
    });
    // Poll for completion
    const poll = setInterval(async () => {
      const res = await fetch(`${API}/api/attractions/status/${id}`);
      const status = await res.json();
      if (status.status === 'completed' || status.status === 'failed') {
        clearInterval(poll);
        setGenerating(false);
        // Reload attraction data
        const r = await fetch(`${API}/api/attractions/${id}`);
        const data = await r.json();
        setAttraction(data);
        setForm({
          name: data.name || '',
          seoTitle: data.seoTitle || '',
          metaDescription: data.metaDescription || '',
          contentHtml: data.contentHtml || '',
          bestTimeToVisit: data.bestTimeToVisit || '',
          entryFee: data.entryFee || '',
        });
      }
    }, 3000);
  };

  const handleDeletePhoto = async (photoId: string) => {
    await fetch(`${API}/api/attractions/photos/${photoId}`, { method: 'DELETE' });
    setAttraction((prev) => prev ? { ...prev, photos: prev.photos.filter((p) => p.id !== photoId) } : prev);
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingPhoto(true);
    await fetch(`${API}/api/attractions/${id}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: newPhotoUrl, altText: newPhotoAlt }),
    });
    setNewPhotoUrl('');
    setNewPhotoAlt('');
    setAddingPhoto(false);
    // Reload photos
    const r = await fetch(`${API}/api/attractions/${id}`);
    const data = await r.json();
    setAttraction(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Attraction not found</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit: {attraction.name}</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/admin/attractions" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Back to list
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-xl font-bold text-gray-900 truncate">{attraction.name}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              attraction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
              attraction.status === 'FAILED' ? 'bg-red-100 text-red-800' :
              attraction.status === 'GENERATING' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {attraction.status}
            </span>
          </div>

          {/* Regenerate button */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={handleRegenerate}
              disabled={generating || attraction.status === 'GENERATING'}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-60"
            >
              {generating ? 'Generating…' : 'Regenerate Content'}
            </button>
            {attraction.status === 'COMPLETED' && (
              <Link
                href={`/attractions/${attraction.slug}`}
                target="_blank"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
              >
                View Public Page ↗
              </Link>
            )}
          </div>

          {generating && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Generating content… this may take 15–30 seconds
            </div>
          )}

          {/* Edit form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
              <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Basic Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                  <input
                    readOnly
                    value={`${attraction.city}, ${attraction.country}`}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">SEO Title</label>
                <input
                  value={form.seoTitle}
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Under 70 characters"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="50–160 characters"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Best Time to Visit</label>
                  <input
                    value={form.bestTimeToVisit}
                    onChange={(e) => setForm({ ...form, bestTimeToVisit: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Entry Fee</label>
                  <input
                    value={form.entryFee}
                    onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-6">
              <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Content HTML</label>
              <textarea
                value={form.contentHtml}
                onChange={(e) => setForm({ ...form, contentHtml: e.target.value })}
                rows={20}
                className="w-full border rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              {saved && <span className="text-sm text-green-600 self-center">✓ Saved</span>}
            </div>
          </form>

          {/* Photos */}
          <div className="mt-6 bg-white rounded-xl border shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-4">Photos</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {attraction.photos.map((photo) => (
                <div key={photo.id} className="relative rounded-lg overflow-hidden border group">
                  <img src={photo.imageUrl} alt={photo.altText} className="w-full h-28 object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 p-1 truncate">{photo.altText}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddPhoto} className="flex gap-2 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  required
                  className="border rounded px-3 py-1.5 text-sm w-72"
                  placeholder="https://…"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alt Text</label>
                <input
                  value={newPhotoAlt}
                  onChange={(e) => setNewPhotoAlt(e.target.value)}
                  required
                  className="border rounded px-3 py-1.5 text-sm w-48"
                />
              </div>
              <button
                type="submit"
                disabled={addingPhoto}
                className="px-3 py-1.5 bg-gray-700 text-white rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
              >
                {addingPhoto ? 'Adding…' : 'Add Photo'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
