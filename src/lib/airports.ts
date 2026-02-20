/**
 * Airport database loaded from CSV at app startup
 */
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  keywords: string;
}

let cachedAirports: Airport[] | null = null;

/**
 * Load airports from CSV file (cached after first load)
 */
export async function loadAirports(): Promise<Airport[]> {
  if (cachedAirports) return cachedAirports;

  try {
    const response = await fetch('/airports.csv');
    const csv = await response.text();
    const lines = csv.split('\n').slice(1); // Skip header
    
    const airports: Airport[] = [];
    const seen = new Set<string>();
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      try {
        // Parse CSV line properly (handles empty fields and quoted values)
        const fields: string[] = [];
        let i = 0;
        const len = line.length;
        while (i <= len) {
          if (i === len) { fields.push(''); break; }
          if (line[i] === '"') {
            const end = line.indexOf('"', i + 1);
            if (end === -1) { fields.push(line.slice(i + 1)); break; }
            fields.push(line.slice(i + 1, end));
            i = end + 2; // skip closing quote and comma
          } else {
            const next = line.indexOf(',', i);
            if (next === -1) { fields.push(line.slice(i)); break; }
            fields.push(line.slice(i, next));
            i = next + 1;
          }
        }
        
        const iataCode = fields[13]?.trim(); // iata_code column
        const name = fields[3]?.trim(); // name column
        const municipality = fields[10]?.trim(); // municipality
        const country = fields[8]?.trim(); // iso_country
        const keywords = fields[18]?.trim() || ''; // keywords column

        // Only include valid airports with IATA codes
        if (iataCode && iataCode.length === 3 && !seen.has(iataCode)) {
          airports.push({
            code: iataCode.toUpperCase(),
            name: name || iataCode,
            city: municipality || '',
            country: country || '',
            keywords,
          });
          seen.add(iataCode);
        }
      } catch (e) {
        // Skip malformed lines
        continue;
      }
    }
    
    // Sort by code for consistent ordering
    airports.sort((a, b) => a.code.localeCompare(b.code));
    
    cachedAirports = airports;
    return airports;
  } catch (error) {
    console.error('Failed to load airports:', error);
    return [];
  }
}

/**
 * Search airports by code, city, or name
 */
export async function searchAirports(query: string): Promise<Airport[]> {
  const airports = await loadAirports();
  if (!query || query.length < 1) return [];

  const q = query.toUpperCase();
  // Match keyword as a standalone word boundary (e.g. "LON" in "LON, Londres" but not "Longview")
  const kwWordRegex = new RegExp('(^|[\\s,])' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[\\s,])', 'i');

  // Score matches by relevance
  const scored: { airport: Airport; score: number }[] = [];
  for (const airport of airports) {
    const code = airport.code;
    const city = airport.city.toUpperCase();
    const name = airport.name.toUpperCase();
    const kw = airport.keywords;

    let score = 0;
    if (code === q) score = 100;                          // Exact code match
    else if (code.startsWith(q)) score = 90;              // Code starts with query
    else if (kwWordRegex.test(kw)) score = 85;            // Keyword exact word match (LON)
    else if (city === q) score = 82;                      // Exact city match
    else if (city.startsWith(q)) score = 75;              // City starts with query
    else if (name.toUpperCase().startsWith(q)) score = 70;// Name starts with query
    else if (kw.toUpperCase().includes(q)) score = 60;    // Keyword partial match
    else if (city.includes(q)) score = 50;                // City contains query
    else if (name.toUpperCase().includes(q)) score = 40;  // Name contains query
    else if (code.includes(q)) score = 20;                // Code contains query
    else continue;

    scored.push({ airport, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((s) => s.airport);
}

/**
 * Get airport by code
 */
export async function getAirportByCode(code: string): Promise<Airport | undefined> {
  const airports = await loadAirports();
  return airports.find((a) => a.code === code.toUpperCase());
}

/**
 * Format airport for display: "NYC - New York"
 */
export function formatAirport(airport: Airport): string {
  return `${airport.code} - ${airport.city}`;
}

/**
 * Get full airport details for display
 */
export function getAirportDisplayName(airport: Airport): string {
  return `${airport.name} (${airport.code})`;
}

/**
 * Get airport details string (used for tooltips)
 */
export function getAirportDetails(airport: Airport): string {
  return `${airport.name} (${airport.code}), ${airport.city}, ${airport.country}`;
}
