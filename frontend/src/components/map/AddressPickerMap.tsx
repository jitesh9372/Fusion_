/**
 * AddressPickerMap — Customer Interactive Location Picker
 *
 * Grounded in FUSION artisan palette:
 * Canvas #FFFFFF / #EEF1EE, Ink #1B2420, Primary #14524C, Accent #D68C31, Success #4A6741, Hairline Border #D8D3C7.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Loader2,
  Check,
  AlertCircle,
  Search,
  Home,
  Building2,
  X,
  Edit3,
} from 'lucide-react';
import FusionMap from './FusionMap';
import {
  getCurrentPosition,
  reverseGeocode,
  searchAddress,
  type SearchResult,
} from '@/services/geocodingService';
import { formatParsedAddress } from '@/types/location';
import type { GeoPosition, ParsedAddress, GpsStatus, GeocodingStatus } from '@/types/location';

// Default fallback position (center of India)
const DEFAULT_POSITION: GeoPosition = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_ZOOM = 5;

export interface AddressPickerMapProps {
  /** Initial address string (to pre-fill) */
  initialAddress?: string;
  /** Called when user confirms their address */
  onAddressConfirmed: (address: string, position: GeoPosition, parsed: ParsedAddress) => void;
  /** Called when user dismisses/cancels */
  onCancel?: () => void;
  /** Compact mode hides the extra address editor panel */
  compact?: boolean;
}

const AddressPickerMap: React.FC<AddressPickerMapProps> = ({
  initialAddress = '',
  onAddressConfirmed,
  onCancel,
  compact = false,
}) => {
  const [position, setPosition] = useState<GeoPosition>(DEFAULT_POSITION);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const [geocodingStatus, setGeocodingStatus] = useState<GeocodingStatus>('idle');
  const [parsedAddress, setParsedAddress] = useState<ParsedAddress | null>(null);
  const [gpsError, setGpsError] = useState<string>('');
  const [geocodingError, setGeocodingError] = useState<string>('');

  // Editable address fields
  const [editHouse, setEditHouse] = useState('');
  const [editRoad, setEditRoad] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPin, setEditPin] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Address search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Confirmation state
  const [confirmed, setConfirmed] = useState(false);

  // ─── Geocode on position change ─────────────────────────────────────────────
  const geocodePosition = useCallback(async (pos: GeoPosition) => {
    setGeocodingStatus('loading');
    setGeocodingError('');
    try {
      const addr = await reverseGeocode(pos);
      setParsedAddress(addr);
      setEditHouse(addr.house_number || '');
      setEditRoad(addr.road || '');
      setEditArea(addr.suburb || addr.neighbourhood || '');
      setEditCity(addr.city || '');
      setEditState(addr.state || '');
      setEditPin(addr.postcode || '');
      setGeocodingStatus('success');
    } catch (err: any) {
      setGeocodingError('Could not fetch address. Try dragging the marker.');
      setGeocodingStatus('error');
    }
  }, []);

  // ─── GPS location ───────────────────────────────────────────────────────────
  const handleUseMyLocation = useCallback(async () => {
    setGpsStatus('requesting');
    setGpsError('');
    setConfirmed(false);
    try {
      const pos = await getCurrentPosition();
      setPosition(pos);
      setZoom(17);
      setGpsStatus('success');
      await geocodePosition(pos);
    } catch (err: any) {
      setGpsStatus(err.type || 'error');
      switch (err.type) {
        case 'permission_denied':
          setGpsError('Location access was denied. Please allow location in browser settings.');
          break;
        case 'position_unavailable':
          setGpsError('Your location could not be determined. Please drag the marker manually.');
          break;
        case 'timeout':
          setGpsError('Location request timed out. Please try again or drag the marker.');
          break;
        default:
          setGpsError('Location unavailable. Drag the map marker to your address.');
      }
    }
  }, [geocodePosition]);

  // ─── Marker drag ────────────────────────────────────────────────────────────
  const handleMarkerDragEnd = useCallback(
    async (pos: GeoPosition) => {
      setPosition(pos);
      setConfirmed(false);
      await geocodePosition(pos);
    },
    [geocodePosition]
  );

  // ─── Map click ──────────────────────────────────────────────────────────────
  const handleMapClick = useCallback(
    async (pos: GeoPosition) => {
      setPosition(pos);
      setConfirmed(false);
      await geocodePosition(pos);
    },
    [geocodePosition]
  );

  // ─── Address search ─────────────────────────────────────────────────────────
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchTimeout.current);
    if (val.length < 3) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      const results = await searchAddress(val);
      setSearchResults(results);
      setSearchLoading(false);
    }, 400);
  };

  const handleSelectSearchResult = async (result: SearchResult) => {
    setSearchQuery(result.displayName);
    setSearchResults([]);
    setPosition(result.position);
    setZoom(17);
    setParsedAddress(result.address);
    setEditHouse(result.address.house_number || '');
    setEditRoad(result.address.road || '');
    setEditArea(result.address.suburb || result.address.neighbourhood || '');
    setEditCity(result.address.city || '');
    setEditState(result.address.state || '');
    setEditPin(result.address.postcode || '');
    setGeocodingStatus('success');
    setConfirmed(false);
  };

  // ─── Build address from edited fields ──────────────────────────────────────
  const buildAddressString = (): string => {
    if (isEditing) {
      const parts = [
        editHouse ? `${editHouse}${editRoad ? ' ' + editRoad : ''}` : editRoad,
        editArea,
        editCity,
        editState,
        editPin,
      ].filter(Boolean);
      return parts.join(', ');
    }
    if (parsedAddress) {
      return formatParsedAddress(parsedAddress);
    }
    return initialAddress;
  };

  // ─── Confirm address ────────────────────────────────────────────────────────
  const handleConfirm = () => {
    const addr = buildAddressString();
    if (!addr) return;
    const finalParsed: ParsedAddress = parsedAddress ?? { display_name: addr };
    onAddressConfirmed(addr, position, finalParsed);
    setConfirmed(true);
  };

  // ─── Pre-fill from initial address ─────────────────────────────────────────
  useEffect(() => {
    if (initialAddress && !parsedAddress) {
      const parts = initialAddress.split(',').map((s) => s.trim());
      if (parts.length >= 2) {
        setEditRoad(parts[0] || '');
        setEditArea(parts[1] || '');
        setEditCity(parts[2] || '');
        setEditState(parts[3] || '');
        setEditPin(parts[4] || '');
      }
    }
  }, [initialAddress]);

  const displayAddress = buildAddressString();
  const hasAddress = geocodingStatus === 'success' || editRoad || editCity;

  return (
    <div className="flex flex-col gap-3 text-[#1B2420]">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#D8D3C7] focus-within:border-[#14524C] transition-colors">
          <Search className="w-4 h-4 text-[#14524C] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search address, landmark, area…"
            className="flex-1 bg-transparent text-xs sm:text-sm text-[#1B2420] placeholder-[#3A423E]/60 outline-none"
          />
          {searchLoading && <Loader2 className="w-4 h-4 text-[#14524C] animate-spin shrink-0" />}
          {searchQuery && !searchLoading && (
            <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}>
              <X className="w-3.5 h-3.5 text-[#3A423E] hover:text-[#1B2420]" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl bg-[#FFFFFF] border border-[#D8D3C7] overflow-hidden shadow-none"
            >
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectSearchResult(r)}
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-[#EEF1EE] transition-colors border-b border-[#D8D3C7] last:border-0"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#14524C] mt-0.5 shrink-0" />
                  <span className="text-xs text-[#1B2420] leading-snug">{r.displayName}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* GPS Button */}
      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={gpsStatus === 'requesting'}
        className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors border ${
          gpsStatus === 'success'
            ? 'bg-[#4A6741]/10 border-[#4A6741]/30 text-[#4A6741]'
            : gpsStatus === 'requesting'
            ? 'bg-[#14524C]/10 border-[#14524C]/30 text-[#14524C] cursor-wait'
            : 'bg-[#FFFFFF] border-[#D8D3C7] text-[#3A423E] hover:bg-[#EEF1EE] hover:text-[#14524C] hover:border-[#14524C]'
        }`}
      >
        {gpsStatus === 'requesting' ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#14524C]" />
        ) : gpsStatus === 'success' ? (
          <Check className="w-4 h-4 text-[#4A6741]" />
        ) : (
          <Navigation className="w-4 h-4 text-[#14524C]" />
        )}
        {gpsStatus === 'requesting'
          ? 'Detecting Location…'
          : gpsStatus === 'success'
          ? 'Location Detected'
          : 'Use My Current Location'}
      </button>

      {/* GPS Error */}
      <AnimatePresence>
        {gpsError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 px-3 py-2 rounded-xl bg-[#9C4A34]/10 border border-[#9C4A34]/30"
          >
            <AlertCircle className="w-3.5 h-3.5 text-[#9C4A34] mt-0.5 shrink-0" />
            <p className="text-xs text-[#9C4A34]">{gpsError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-[#D8D3C7]">
        <FusionMap
          position={position}
          zoom={zoom}
          height={280}
          showMarker={true}
          draggable={true}
          onMarkerDragEnd={handleMarkerDragEnd}
          onMapClick={handleMapClick}
          markerType="fusion"
        />
        {/* Hint overlay */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#D8D3C7]">
            <MapPin className="w-3 h-3 text-[#14524C]" />
            <span className="text-[10px] text-[#3A423E] font-semibold">Drag pin or click map to adjust</span>
          </div>
        </div>
      </div>

      {/* Geocoding loading */}
      {geocodingStatus === 'loading' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#D8D3C7]">
          <Loader2 className="w-3.5 h-3.5 text-[#14524C] animate-spin" />
          <span className="text-xs text-[#3A423E]">Fetching address…</span>
        </div>
      )}

      {/* Geocoding error */}
      {geocodingError && geocodingStatus === 'error' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#9C4A34]/10 border border-[#9C4A34]/30">
          <AlertCircle className="w-3.5 h-3.5 text-[#9C4A34]" />
          <span className="text-xs text-[#9C4A34]">{geocodingError}</span>
        </div>
      )}

      {/* Address Card */}
      <AnimatePresence mode="wait">
        {(geocodingStatus === 'success' || editRoad || editCity) && (
          <motion.div
            key="address-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl bg-[#FFFFFF] border border-[#D8D3C7] overflow-hidden"
          >
            {/* Address Preview Header */}
            <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-[#D8D3C7]">
              <div className="flex items-start gap-2.5 min-w-0">
                <MapPin className="w-4 h-4 text-[#14524C] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-[#3A423E] font-bold uppercase tracking-wider mb-0.5">
                    Selected Address
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-[#1B2420] leading-snug">
                    {displayAddress || 'Drag marker to select location'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing((v) => !v)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-[#3A423E] hover:text-[#14524C] hover:bg-[#EEF1EE] border border-[#D8D3C7] transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditing ? 'Close' : 'Edit'}</span>
              </button>
            </div>

            {/* Editable Fields */}
            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2 p-3 bg-[#F4F6F4]">
                    {[
                      { label: 'House / Building', value: editHouse, set: setEditHouse, icon: Building2, full: true },
                      { label: 'Street / Road', value: editRoad, set: setEditRoad, icon: MapPin, full: true },
                      { label: 'Area / Suburb', value: editArea, set: setEditArea, icon: Home, full: false },
                      { label: 'City / Town', value: editCity, set: setEditCity, icon: Home, full: false },
                      { label: 'State', value: editState, set: setEditState, icon: Home, full: false },
                      { label: 'PIN / Postal Code', value: editPin, set: setEditPin, icon: Home, full: false },
                    ].map(({ label, value, set, full }) => (
                      <div key={label} className={full ? 'col-span-2' : 'col-span-1'}>
                        <label className="block text-[10px] text-[#3A423E] font-semibold mb-1">{label}</label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => set(e.target.value)}
                          placeholder={label}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#D8D3C7] text-xs text-[#1B2420] placeholder-[#3A423E]/50 outline-none focus:border-[#14524C]"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#3A423E] bg-[#FFFFFF] border border-[#D8D3C7] hover:bg-[#EEF1EE] transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!hasAddress || confirmed}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            confirmed
              ? 'bg-[#4A6741] text-[#FFFFFF]'
              : hasAddress
              ? 'bg-[#14524C] hover:bg-[#0E3D38] text-[#FFFFFF]'
              : 'bg-[#EEF1EE] border border-[#D8D3C7] text-[#3A423E]/50 cursor-not-allowed'
          }`}
        >
          {confirmed ? (
            <>
              <Check className="w-4 h-4" />
              <span>Address Confirmed</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              <span>Confirm This Address</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AddressPickerMap;
