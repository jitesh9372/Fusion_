/**
 * FUSION Geocoding Service
 *
 * Uses:
 * - Browser Geolocation API for GPS
 * - Nominatim (OpenStreetMap) for reverse geocoding — free, no API key required
 *
 * NEVER exposes latitude or longitude to UI components. All functions return
 * ParsedAddress or formatted address strings only.
 */

import type { GeoPosition, ParsedAddress, LocationError } from '@/types/location';
import { formatParsedAddress } from '@/types/location';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const REVERSE_GEOCODE_TIMEOUT_MS = 8000;
const GPS_TIMEOUT_MS = 12000;

// ─── GPS / Device Location ────────────────────────────────────────────────────

export const getCurrentPosition = (): Promise<GeoPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser.',
        type: 'unknown',
      } as LocationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        const mapped: LocationError = {
          code: err.code,
          message: err.message,
          type:
            err.code === 1
              ? 'permission_denied'
              : err.code === 2
              ? 'position_unavailable'
              : err.code === 3
              ? 'timeout'
              : 'unknown',
        };
        reject(mapped);
      },
      {
        enableHighAccuracy: true,
        timeout: GPS_TIMEOUT_MS,
        maximumAge: 30000,
      }
    );
  });
};

// ─── Reverse Geocoding ────────────────────────────────────────────────────────

export const reverseGeocode = async (pos: GeoPosition): Promise<ParsedAddress> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REVERSE_GEOCODE_TIMEOUT_MS);

  try {
    const url = new URL(`${NOMINATIM_BASE}/reverse`);
    url.searchParams.set('lat', pos.lat.toString());
    url.searchParams.set('lon', pos.lng.toString());
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('zoom', '18');

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en',
        // Nominatim requires a User-Agent identifying the app
        'User-Agent': 'FUSION-Cooperative-App/1.0',
      },
    });

    if (!res.ok) throw new Error(`Geocoding request failed: ${res.status}`);

    const json = await res.json();

    if (!json || !json.address) {
      throw new Error('No address data returned');
    }

    const a = json.address;

    const parsed: ParsedAddress = {
      house_number: a.house_number || a.house_name || undefined,
      road: a.road || a.pedestrian || a.footway || a.path || undefined,
      suburb: a.suburb || a.neighbourhood || a.quarter || undefined,
      neighbourhood: a.neighbourhood || undefined,
      city:
        a.city ||
        a.town ||
        a.village ||
        a.municipality ||
        a.county ||
        undefined,
      state: a.state || a.region || undefined,
      postcode: a.postcode || undefined,
      country: a.country || undefined,
      display_name: json.display_name || '',
    };

    return parsed;
  } finally {
    clearTimeout(timeoutId);
  }
};

/** Reverse geocode and return a pre-formatted readable address string. */
export const reverseGeocodeFormatted = async (pos: GeoPosition): Promise<string> => {
  const parsed = await reverseGeocode(pos);
  return formatParsedAddress(parsed);
};

// ─── Forward Search (address text → position) ─────────────────────────────────

export interface SearchResult {
  displayName: string;
  position: GeoPosition;
  address: ParsedAddress;
}

export const searchAddress = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.length < 3) return [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REVERSE_GEOCODE_TIMEOUT_MS);

  try {
    const url = new URL(`${NOMINATIM_BASE}/search`);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '5');

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en',
        'User-Agent': 'FUSION-Cooperative-App/1.0',
      },
    });

    if (!res.ok) return [];

    const json: any[] = await res.json();

    return json.map((item) => {
      const a = item.address || {};
      const parsed: ParsedAddress = {
        house_number: a.house_number || undefined,
        road: a.road || a.pedestrian || undefined,
        suburb: a.suburb || a.neighbourhood || undefined,
        city: a.city || a.town || a.village || a.county || undefined,
        state: a.state || undefined,
        postcode: a.postcode || undefined,
        country: a.country || undefined,
        display_name: item.display_name || '',
      };
      return {
        displayName: formatParsedAddress(parsed),
        position: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) },
        address: parsed,
      };
    });
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
};
