import React from 'react';
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

  if (!res.ok || res.status === 404) {
    return { notFound: true };
  }

  const attraction: AttractionPage = await res.json();

  return {
    props: { attraction },
    revalidate: false, // only revalidate on-demand via /api/revalidate
  };
};

export default function AttractionDetailPage({ attraction }: { attraction: AttractionPage }) {
  const processedHtml = attraction.contentHtml
    ? removeInlineAffiliateWidgets(attraction.contentHtml)
    : '';

  const cityEncoded = encodeURIComponent(attraction.city);
  const countryEncoded = encodeURIComponent(attraction.country);

  return (
    <>
      <Head>
        <title>{attraction.seoTitle || attraction.name} | Travellyhub</title>
        {attraction.metaDescription && (
          <meta name="description" content={attraction.metaDescription} />
        )}
        <meta property="og:title" content={attraction.seoTitle || attraction.name} />
        {attraction.metaDescription && (
          <meta property="og:description" content={attraction.metaDescription} />
        )}
        {attraction.photos[0] && (
          <meta property="og:image" content={attraction.photos[0].imageUrl} />
        )}
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <nav className="text-sm text-gray-500">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/attractions" className="hover:text-blue-600">Attractions</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{attraction.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Image */}
        {attraction.photos.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 mt-6">
            <div className="hero-image">
              <img
                src={attraction.photos[0].imageUrl}
                alt={attraction.photos[0].altText}
              />
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
                <a
                  href={`https://www.skyscanner.com/transport/flights/anywhere/${cityEncoded}/?adultsv2=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="widget-btn widget-btn-blue"
                >
                  Search on Skyscanner
                </a>
              </div>

              <div className="widget-card">
                <div className="widget-icon">🏨</div>
                <h3 className="widget-title">Find Hotels</h3>
                <p className="widget-desc">Best stays in {attraction.city}</p>
                <a
                  href={`https://www.booking.com/searchresults.html?ss=${cityEncoded}%2C+${countryEncoded}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="widget-btn widget-btn-navy"
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

              {attraction.photos.length > 1 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Photos</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {attraction.photos.map((photo) => (
                      <div key={photo.id} className="rounded-lg overflow-hidden shadow-sm">
                        <img
                          src={photo.imageUrl}
                          alt={photo.altText}
                          className="w-full h-40 object-cover"
                        />
                      </div>
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
                      <Link
                        key={nearby.id}
                        href={`/attractions/${nearby.slug}`}
                        className="nearby-item"
                      >
                        <div className="nearby-img">
                          {nearby.photos[0] ? (
                            <img src={nearby.photos[0].imageUrl} alt={nearby.name} />
                          ) : (
                            <div className="nearby-img-placeholder" />
                          )}
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
                  href={`https://www.getyourguide.com/s/?q=${cityEncoded}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="widget-btn widget-btn-orange"
                >
                  Browse Tours
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .hero-image { height: 320px; border-radius: 12px; overflow: hidden; }
        .hero-image img { width: 100%; height: 100%; object-fit: cover; }
        @media (max-width: 768px) { .hero-image { height: 200px; } }

        .layout-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 1024px) {
          .layout-grid { grid-template-columns: 240px 1fr 260px; }
          .sidebar-left { order: 1; }
          .main-content { order: 2; }
          .sidebar-right { order: 3; }
        }
        @media (max-width: 1023px) {
          .sidebar-left { order: 2; }
          .main-content { order: 1; }
          .sidebar-right { order: 3; }
        }
        @media (min-width: 1024px) {
          .sidebar-left, .sidebar-right { position: sticky; top: 24px; align-self: start; }
        }

        .widget-card {
          background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          padding: 16px; margin-bottom: 16px; border: 1px solid #f0f0f0;
        }
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
        .nearby-info { display: flex; flex-direction: column; }
        .nearby-name { font-size: 13px; font-weight: 600; color: #1a1a2e; line-height: 1.3; }
        .nearby-city { font-size: 11px; color: #999; }

        .attraction-content h1 { font-size: 2rem; font-weight: 800; color: #1a1a2e; margin-bottom: 1rem; line-height: 1.2; }
        .attraction-content h2 { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin-top: 2rem; margin-bottom: 0.75rem; }
        .attraction-content h3 { font-size: 1.2rem; font-weight: 600; color: #333; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .attraction-content p { color: #444; line-height: 1.8; margin-bottom: 1rem; }
        .attraction-content ul, .attraction-content ol { margin: 0.75rem 0; padding-left: 1.5rem; }
        .attraction-content li { color: #444; line-height: 1.7; margin-bottom: 0.4rem; }
        .attraction-content section { margin-bottom: 1.5rem; }
        .attraction-content a { color: #4a90d9; text-decoration: underline; }
        .attraction-content .faq-section { background: #f8f9fa; border-radius: 12px; padding: 1.5rem; margin-top: 2rem; }
        .attraction-content .faq-item { border-bottom: 1px solid #e5e7eb; padding: 1rem 0; }
        .attraction-content .faq-item:last-child { border-bottom: none; }
      `}</style>
    </>
  );
}
