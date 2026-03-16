import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';

interface Photo {
  id: string;
  imageUrl: string;
  altText: string;
  source: string | null;
}

interface NearbyAttraction {
  id: string;
  name: string;
  slug: string;
  city: string;
  photos: Photo[];
}

interface AttractionPage {
  id: string;
  name: string;
  slug: string;
  country: string;
  countryCode: string;
  city: string;
  seoTitle: string | null;
  metaDescription: string | null;
  contentHtml: string | null;
  bestTimeToVisit: string | null;
  entryFee: string | null;
  photos: Photo[];
  nearbyAttractions: NearbyAttraction[];
  nearestAirportCode: string | null;
  latitude: number | null;
  longitude: number | null;
  updatedAt: string;
}

const ATTRACTIONS_API = process.env.BACKEND_URL;

function removeInlineAffiliateWidgets(html: string): string {
  return html.replace(/<div class="affiliate-widget"[^>]*>[\s\S]*?<\/div>/g, '');
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const res = await fetch(`${ATTRACTIONS_API}/api/attractions/pages`);
    const attractions: { slug: string }[] = await res.json();
    return {
      paths: attractions.map((a) => ({ params: { slug: a.slug } })),
      fallback: 'blocking',
    };
  } catch {
    return { paths: [], fallback: 'blocking' };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const res = await fetch(`${ATTRACTIONS_API}/api/attractions/page/${slug}`);
  if (!res.ok || res.status === 404) return { notFound: true };
  const attraction: AttractionPage = await res.json();
  return { props: { attraction }, revalidate: false };
};

export default function AttractionDetailPage({ attraction }: { attraction: AttractionPage }) {
  const processedHtml = attraction.contentHtml
    ? removeInlineAffiliateWidgets(attraction.contentHtml)
    : '';

  const cityEncoded = encodeURIComponent(attraction.city);
  const countryEncoded = encodeURIComponent(attraction.country);

  const [skyscannerHref, setSkyscannerHref] = useState(
    `https://www.skyscanner.com/transport/flights/anywhere/${attraction.nearestAirportCode?.toLowerCase() ?? cityEncoded}/?adultsv2=1`
  );

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const photos = attraction.photos;
  const touchStartX = React.useRef<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevPhoto = useCallback(() => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const nextPhoto = useCallback(() => setLightboxIndex((i) => (i !== null && i < photos.length - 1 ? i + 1 : i)), [photos.length]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) dx < 0 ? nextPhoto() : prevPhoto();
    touchStartX.current = null;
  }, [prevPhoto, nextPhoto]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    };
    if (lightboxIndex !== null) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, closeLightbox, prevPhoto, nextPhoto]);

  useEffect(() => {
    if (!attraction.nearestAirportCode) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/airports/nearest?lat=${latitude}&lng=${longitude}`);
          if (!res.ok) return;
          const origin = await res.json();
          if (origin?.code) {
            setSkyscannerHref(
              `https://www.skyscanner.com/transport/flights/${origin.code.toLowerCase()}/${attraction.nearestAirportCode!.toLowerCase()}/?adultsv2=1`
            );
          }
        } catch { /* keep default */ }
      },
      () => { /* permission denied */ }
    );
  }, [attraction.nearestAirportCode]);

  return (
    <>
      <Head>
        <title>{attraction.seoTitle || attraction.name} | TravellyHub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {attraction.metaDescription && <meta name="description" content={attraction.metaDescription} />}
        <meta property="og:title" content={attraction.seoTitle || attraction.name} />
        {attraction.metaDescription && <meta property="og:description" content={attraction.metaDescription} />}
        {photos[0] && <meta property="og:image" content={photos[0].imageUrl} />}
      </Head>

      <main className="min-h-screen bg-gray-50" style={{ overflowX: 'hidden' }}>
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <nav className="text-sm text-gray-500" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/attractions" className="hover:text-blue-600">Attractions</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{attraction.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Image */}
        {photos.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 mt-6">
            <div className="hero-image" onClick={() => setLightboxIndex(0)} style={{ cursor: 'pointer' }}>
              <img src={photos[0].imageUrl} alt={photos[0].altText} />
            </div>
          </div>
        )}

        {/* 3-Column Layout */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-sm text-blue-600 font-semibold uppercase tracking-wide mb-4">
            {attraction.city}, {attraction.country}
          </div>

          <div className="layout-grid">
            {/* LEFT SIDEBAR */}
            <aside className="sidebar-left">
              <div className="widget-card">
                <div className="widget-icon">✈️</div>
                <h3 className="widget-title">Search Flights</h3>
                <p className="widget-desc">Find cheap flights to {attraction.city}</p>
                <a href={skyscannerHref} target="_blank" rel="noopener noreferrer" className="widget-btn widget-btn-blue">
                  Search on Skyscanner
                </a>
              </div>

              <div className="widget-card">
                <div className="widget-icon">🏨</div>
                <h3 className="widget-title">Find Hotels</h3>
                <p className="widget-desc">Best stays in {attraction.city}</p>
                <a
                  href={
                    attraction.latitude && attraction.longitude
                      ? `https://www.booking.com/searchresults.html?ss=${cityEncoded}&latitude=${attraction.latitude}&longitude=${attraction.longitude}`
                      : `https://www.booking.com/searchresults.html?ss=${cityEncoded}%2C+${countryEncoded}`
                  }
                  target="_blank" rel="noopener noreferrer" className="widget-btn widget-btn-navy"
                >
                  Search on Booking.com
                </a>
              </div>

              {attraction.bestTimeToVisit && (
                <div className="widget-card">
                  <h3 className="widget-title-sm">Best Time to Visit</h3>
                  <p className="widget-desc-last">{attraction.bestTimeToVisit}</p>
                </div>
              )}
              {attraction.entryFee && (
                <div className="widget-card">
                  <h3 className="widget-title-sm">Entry Fee</h3>
                  <p className="widget-desc-last">{attraction.entryFee}</p>
                </div>
              )}
            </aside>

            {/* MAIN CONTENT */}
            <div className="main-content">
              <article
                className="attraction-content bg-white rounded-xl shadow-md p-6 md:p-10"
                dangerouslySetInnerHTML={{ __html: processedHtml }}
              />

              {photos.length > 1 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Photos</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {photos.map((photo, idx) => (
                      <button
                        key={photo.id}
                        onClick={() => setLightboxIndex(idx)}
                        className="photo-thumb"
                        aria-label={`View ${photo.altText}`}
                      >
                        <img src={photo.imageUrl} alt={photo.altText} className="w-full h-36 object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-10 pt-6 border-t">
                <Link href="/attractions" className="text-blue-600 hover:text-blue-800 font-medium">
                  &larr; View all attractions
                </Link>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="sidebar-right">
              <div className="widget-card">
                <h3 className="widget-title">Nearby Attractions</h3>
                {(!attraction.nearbyAttractions || attraction.nearbyAttractions.length === 0) ? (
                  <p className="widget-desc">No nearby attractions yet.</p>
                ) : (
                  <div className="nearby-list">
                    {attraction.nearbyAttractions.map((nearby) => (
                      <Link key={nearby.id} href={`/attractions/${nearby.slug}`} className="nearby-item">
                        <div className="nearby-img">
                          {nearby.photos[0]
                            ? <img src={nearby.photos[0].imageUrl} alt={nearby.name} />
                            : <div className="nearby-img-placeholder" />}
                        </div>
                        <div className="nearby-info">
                          <span className="nearby-name">{nearby.name}</span>
                          <span className="nearby-city">{nearby.city}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="widget-card">
                <div className="widget-icon">🎯</div>
                <h3 className="widget-title">Tours & Activities</h3>
                <p className="widget-desc">Explore things to do in {attraction.city}</p>
                <a
                  href={`https://www.getyourguide.com/s?partner_id=ZBPYYHU&q=${cityEncoded}`}
                  target="_blank" rel="noopener noreferrer" className="widget-btn widget-btn-orange"
                >
                  Browse Tours
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">✕</button>

          {lightboxIndex > 0 && (
            <button className="lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); prevPhoto(); }} aria-label="Previous">‹</button>
          )}

          <div className="lightbox-img-wrap" onClick={(e) => e.stopPropagation()}>
            <img src={photos[lightboxIndex].imageUrl} alt={photos[lightboxIndex].altText} className="lightbox-img" />
            {photos[lightboxIndex].altText && (
              <p className="lightbox-caption">{photos[lightboxIndex].altText}</p>
            )}
          </div>

          {lightboxIndex < photos.length - 1 && (
            <button className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); nextPhoto(); }} aria-label="Next">›</button>
          )}

          <div className="lightbox-counter">{lightboxIndex + 1} / {photos.length}</div>
        </div>
      )}

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { overflow-x: hidden; }

        .hero-image { height: 320px; border-radius: 12px; overflow: hidden; }
        .hero-image img { width: 100%; height: 100%; object-fit: cover; }
        @media (max-width: 768px) { .hero-image { height: 200px; } }

        .layout-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 1024px) {
          .layout-grid { grid-template-columns: 240px 1fr 260px; }
          .sidebar-left { order: 1; }
          .main-content { order: 2; }
          .sidebar-right { order: 3; }
          .sidebar-left, .sidebar-right { position: sticky; top: 24px; align-self: start; }
        }
        @media (max-width: 1023px) {
          .sidebar-left { order: 2; }
          .main-content { order: 1; }
          .sidebar-right { order: 3; }
        }

        .widget-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 16px; margin-bottom: 16px; border: 1px solid #f0f0f0; }
        .widget-icon { font-size: 24px; margin-bottom: 8px; }
        .widget-title { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 6px; }
        .widget-title-sm { font-size: 11px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .widget-desc { font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 12px; }
        .widget-desc-last { font-size: 13px; color: #444; line-height: 1.5; margin-bottom: 0; }
        .widget-btn { display: block; text-align: center; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #fff !important; text-decoration: none !important; transition: opacity 0.2s; }
        .widget-btn:hover { opacity: 0.9; }
        .widget-btn-blue { background: #0770e3; }
        .widget-btn-navy { background: #003580; }
        .widget-btn-orange { background: #e67e22; }

        .nearby-list { display: flex; flex-direction: column; gap: 8px; }
        .nearby-item { display: flex; align-items: center; gap: 10px; padding: 6px; border-radius: 8px; text-decoration: none !important; transition: background 0.2s; }
        .nearby-item:hover { background: #f5f7fa; }
        .nearby-img { width: 48px; height: 48px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #eee; }
        .nearby-img img { width: 100%; height: 100%; object-fit: cover; }
        .nearby-img-placeholder { width: 100%; height: 100%; background: #ddd; }
        .nearby-info { display: flex; flex-direction: column; min-width: 0; }
        .nearby-name { font-size: 13px; font-weight: 600; color: #1a1a2e; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .nearby-city { font-size: 11px; color: #999; }

        .photo-thumb { display: block; border-radius: 10px; overflow: hidden; cursor: pointer; padding: 0; border: none; background: none; transition: transform 0.15s, box-shadow 0.15s; }
        .photo-thumb:hover { transform: scale(1.02); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
        .photo-thumb img { display: block; width: 100%; height: 144px; object-fit: cover; }

        .attraction-content { overflow-x: hidden; word-break: break-word; }
        .attraction-content h1 { font-size: clamp(1.4rem, 5vw, 2rem); font-weight: 800; color: #1a1a2e; margin-bottom: 1rem; line-height: 1.2; }
        .attraction-content h2 { font-size: clamp(1.1rem, 4vw, 1.5rem); font-weight: 700; color: #1a1a2e; margin-top: 2rem; margin-bottom: 0.75rem; }
        .attraction-content h3 { font-size: 1.2rem; font-weight: 600; color: #333; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .attraction-content p { color: #444; line-height: 1.8; margin-bottom: 1rem; }
        .attraction-content ul, .attraction-content ol { margin: 0.75rem 0; padding-left: 1.5rem; }
        .attraction-content li { color: #444; line-height: 1.7; margin-bottom: 0.4rem; }
        .attraction-content section { margin-bottom: 1.5rem; }
        .attraction-content a { color: #4a90d9; text-decoration: underline; }
        .attraction-content img { max-width: 100%; height: auto; }
        .attraction-content table { max-width: 100%; overflow-x: auto; display: block; }
        .attraction-content pre, .attraction-content code { max-width: 100%; overflow-x: auto; }
        .attraction-content .faq-section { background: #f8f9fa; border-radius: 12px; padding: 1.5rem; margin-top: 2rem; }
        .attraction-content .faq-item { border-bottom: 1px solid #e5e7eb; padding: 1rem 0; }
        .attraction-content .faq-item:last-child { border-bottom: none; }

        /* Lightbox */
        .lightbox-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 1000;
          display: flex; align-items: center; justify-content: center;
        }
        .lightbox-img-wrap { max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; align-items: center; }
        .lightbox-img { max-width: 90vw; max-height: 80vh; object-fit: contain; border-radius: 8px; }
        .lightbox-caption { color: #ccc; font-size: 13px; margin-top: 10px; text-align: center; }
        .lightbox-close {
          position: fixed; top: 16px; right: 20px; background: none; border: none;
          color: #fff; font-size: 28px; cursor: pointer; z-index: 1001; line-height: 1;
          padding: 4px 8px; border-radius: 4px;
        }
        .lightbox-close:hover { background: rgba(255,255,255,0.1); }
        .lightbox-nav {
          position: fixed; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.15); border: none; color: #fff;
          font-size: 48px; cursor: pointer; z-index: 1001; padding: 8px 16px;
          border-radius: 4px; line-height: 1;
        }
        .lightbox-nav:hover { background: rgba(255,255,255,0.25); }
        .lightbox-prev { left: 12px; }
        .lightbox-next { right: 12px; }
        .lightbox-counter { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); color: #ccc; font-size: 13px; }
        @media (max-width: 640px) {
          .lightbox-nav { font-size: 32px; padding: 6px 12px; }
          .lightbox-prev { left: 4px; }
          .lightbox-next { right: 4px; }
        }
      `}</style>
    </>
  );
}
