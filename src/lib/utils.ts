/**
 * Utility functions for the frontend
 */

/**
 * Format time from ISO string to readable format
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date from YYYY-MM-DD to readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format duration in minutes to readable format (e.g., "2h 30m")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

/**
 * Get duration in more readable format including arrival day
 */
export function getDurationWithDays(departureTime: string, arrivalTime: string): string {
  const departure = new Date(departureTime);
  const arrival = new Date(arrivalTime);

  const departureDay = departure.toLocaleDateString();
  const arrivalDay = arrival.toLocaleDateString();

  const isSameDay = departureDay === arrivalDay;

  if (isSameDay) {
    return `Same day`;
  }

  return `+1 day`;
}

/**
 * Calculate number of days between two dates
 */
export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get stops text
 */
export function getStopsText(stops: number): string {
  if (stops === 0) {
    return 'Non-stop';
  }
  return `${stops} stop${stops > 1 ? 's' : ''}`;
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
