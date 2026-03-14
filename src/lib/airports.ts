export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  keywords: string;
}

export async function searchAirports(query: string): Promise<Airport[]> {
  if (!query || query.trim().length < 1) return [];
  try {
    const res = await fetch(`/api/airports/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getAirportByCode(code: string): Promise<Airport | undefined> {
  if (!code) return undefined;
  try {
    const res = await fetch(`/api/airports/code/${encodeURIComponent(code.toUpperCase())}`);
    if (!res.ok) return undefined;
    const data = await res.json();
    return data ?? undefined;
  } catch {
    return undefined;
  }
}

export function formatAirport(airport: Airport): string {
  return `${airport.code} - ${airport.city}`;
}

export function getAirportDisplayName(airport: Airport): string {
  return `${airport.name} (${airport.code})`;
}

export function getAirportDetails(airport: Airport): string {
  return `${airport.name} (${airport.code}), ${airport.city}, ${airport.country}`;
}
