import axios, { AxiosInstance } from 'axios';

/**
 * API client for communicating with the backend
 */
export interface FlightSegmentDetail {
  departureAirport: string;
  departureTerminal?: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalTerminal?: string;
  arrivalTime: string;
  carrierCode: string;
  carrierName?: string;
  flightNumber: string;
  aircraft?: string;
  duration: number;
  cabin?: string;
}

export interface FlightItinerary {
  direction: 'outbound' | 'inbound';
  duration: number;
  segments: FlightSegmentDetail[];
  stops: number;
}

export interface NormalizedFlight {
  id: string;
  provider: string;
  airline: string;
  airlineCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  stops: number;
  stopDetails?: any[];
  itineraries?: FlightItinerary[];
  price: number;
  currency: string;
  bookingUrl: string;
  tripType: 'one-way' | 'round-trip' | 'multi-city';
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  returnDate?: string;
  rankingScore?: number;
  scoreBreakdown?: any;
}

export interface PassengerBreakdown {
  adults: number;
  children: number;
  infants: number;
}

export interface flightSearch {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers?: number;
  passengerBreakdown?: PassengerBreakdown;
  tripType: 'one-way' | 'round-trip' | 'multi-city';
  cabin?: 'economy' | 'business' | 'first' | 'premium-economy';
  airlines?: string[];
  maxPrice?: number;
  includeProviders?: string[];
}

export interface FlightSearchResult {
  status: 'success' | 'partial' | 'error';
  query: flightSearch;
  flights: NormalizedFlight[];
  totalResults: number;
  providersQueried: any[];
  timestamp: string;
  cacheHit: boolean;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    this.client = axios.create({
      baseURL: `${baseURL}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Search for flights
   */
  async searchFlights(params: flightSearch): Promise<FlightSearchResult> {
    try {
      const response = await this.client.post('/flights/search', params);
      return response.data;
    } catch (error) {
      console.error('Flight search error:', error);
      throw error;
    }
  }

  /**
   * Get available providers
   */
  async getProviders(): Promise<string[]> {
    try {
      const response = await this.client.get('/flights/providers');
      return response.data.providers;
    } catch (error) {
      console.error('Get providers error:', error);
      throw error;
    }
  }

  /**
   * Filter flights
   */
  async filterFlights(flights: NormalizedFlight[], filters: any): Promise<NormalizedFlight[]> {
    try {
      const response = await this.client.post('/flights/filter', {
        flights,
        filters,
      });
      return response.data.flights;
    } catch (error) {
      console.error('Filter flights error:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/flights/health');
      return response.status === 200;
    } catch (error) {
      console.error('Health check error:', error);
      return false;
    }
  }
}

export const apiClient = new ApiClient();
