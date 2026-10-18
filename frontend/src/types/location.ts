/**
 * FUSION Location & Geocoding Types
 */

export interface GeoPosition {
  lat: number;
  lng: number;
}

export type GpsStatus =
  | 'idle'
  | 'requesting'
  | 'success'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'error';

export interface ParsedAddress {
  house_number?: string;
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  display_name: string;
}

export type GeocodingStatus = 'idle' | 'loading' | 'success' | 'error';

export interface LocationError {
  code: number;
  message: string;
  type: 'permission_denied' | 'position_unavailable' | 'timeout' | 'unknown' | 'unavailable';
}

/** Formats a ParsedAddress into a single readable string. */
export function formatParsedAddress(addr: ParsedAddress): string {
  const parts: string[] = [];
  if (addr.house_number && addr.road) {
    parts.push(`${addr.house_number} ${addr.road}`);
  } else if (addr.road) {
    parts.push(addr.road);
  }
  if (addr.suburb || addr.neighbourhood) {
    parts.push(addr.suburb || addr.neighbourhood || '');
  }
  if (addr.city) parts.push(addr.city);
  if (addr.state) parts.push(addr.state);
  if (addr.postcode) parts.push(addr.postcode);
  return parts.filter(Boolean).join(', ') || addr.display_name;
}
