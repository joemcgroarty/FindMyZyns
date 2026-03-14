import { StorePin } from '@/types';

const GOOGLE_PLACES_URL = 'https://places.googleapis.com/v1/places:searchNearby';

// Cache stores by geographic cell (rounded to 2 decimal places)
const storeCache = new Map<string, { data: StorePin[]; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

export async function fetchNearbyStores(
  lat: number,
  lng: number,
): Promise<StorePin[]> {
  const cacheKey = getCacheKey(lat, lng);
  const cached = storeCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    // In production, this would call a Supabase Edge Function that proxies to Google Places
    // For now, use the EXPO_PUBLIC_GOOGLE_PLACES_KEY if available
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;
    if (!apiKey) {
      // Return empty array if no API key configured
      return [];
    }

    const response = await fetch(GOOGLE_PLACES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.displayName,places.formattedAddress,places.location,places.rating,places.currentOpeningHours,places.id',
      },
      body: JSON.stringify({
        includedTypes: ['gas_station', 'convenience_store'],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 5000.0,
          },
        },
      }),
    });

    if (!response.ok) return [];

    const json = await response.json();
    const stores: StorePin[] = (json.places ?? []).map((place: Record<string, unknown>) => ({
      place_id: (place as { id: string }).id,
      name: ((place as { displayName: { text: string } }).displayName)?.text ?? 'Unknown',
      address: (place as { formattedAddress: string }).formattedAddress ?? '',
      latitude: ((place as { location: { latitude: number } }).location)?.latitude ?? 0,
      longitude: ((place as { location: { longitude: number } }).location)?.longitude ?? 0,
      rating: (place as { rating?: number }).rating ?? null,
      is_open: ((place as { currentOpeningHours?: { openNow?: boolean } }).currentOpeningHours)?.openNow ?? null,
    }));

    storeCache.set(cacheKey, { data: stores, timestamp: Date.now() });
    return stores;
  } catch {
    return [];
  }
}
