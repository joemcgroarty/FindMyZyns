import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Platform } from 'react-native';
import { StatusFAB } from '@/components/map/StatusFAB';
import { SharerCard } from '@/components/map/SharerCard';
import { StoreCard } from '@/components/map/StoreCard';
import { ConnectionAlert } from '@/components/connection/ConnectionAlert';
import { SearchBar } from '@/components/map/SearchBar';
import { ActiveConnectionBanner } from '@/components/connection/ActiveConnectionBanner';
import { WebMap } from '@/components/map/WebMap';
import { useStatusStore } from '@/stores/useStatusStore';
import { useMapStore } from '@/stores/useMapStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useConnectionStore } from '@/stores/useConnectionStore';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/constants/config';
import { SharerPin, StorePin } from '@/types';

export default function MapScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [selectedSharer, setSelectedSharer] = useState<SharerPin | null>(null);
  const [selectedStore, setSelectedStore] = useState<StorePin | null>(null);
  const lastBroadcast = useRef<{ lat: number; lng: number } | null>(null);
  const { status, updateLocation } = useStatusStore();
  const { nearbySharers, nearbyStores, fetchNearbySharers, fetchNearbyStores, subscribeToMapUpdates } = useMapStore();
  const { profile } = useAuthStore();
  const { fetchPendingRequests } = useConnectionStore();

  // Request location via browser Geolocation API
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setPermissionStatus('granted');
        fetchNearbySharers(pos.coords.latitude, pos.coords.longitude);
        fetchNearbyStores(pos.coords.latitude, pos.coords.longitude);
      },
      () => setPermissionStatus('denied'),
      { enableHighAccuracy: false },
    );
  }, []);

  // Subscribe to realtime
  useEffect(() => {
    const unsub = subscribeToMapUpdates();
    return unsub;
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // Periodic refetch
  useEffect(() => {
    if (!location) return;
    const interval = setInterval(() => {
      if (location) fetchNearbySharers(location.latitude, location.longitude);
    }, 30000);
    return () => clearInterval(interval);
  }, [location]);

  // Location broadcasting when sharing
  useEffect(() => {
    if (status !== 'sharing' || !location) return;
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (lastBroadcast.current) {
          const dist = getDistance(lastBroadcast.current.lat, lastBroadcast.current.lng, latitude, longitude);
          if (dist < APP_CONFIG.LOCATION_MOVEMENT_THRESHOLD_M) return;
        }
        await updateLocation(latitude, longitude);
        lastBroadcast.current = { lat: latitude, lng: longitude };
      });
    }, APP_CONFIG.LOCATION_UPDATE_INTERVAL_MS);

    // Broadcast immediately
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await updateLocation(pos.coords.latitude, pos.coords.longitude);
      lastBroadcast.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    });

    return () => clearInterval(interval);
  }, [status, location]);

  const handleRegionChange = useCallback(
    (lat: number, lng: number) => {
      setLocation({ latitude: lat, longitude: lng });
      fetchNearbySharers(lat, lng);
      fetchNearbyStores(lat, lng);
    },
    [],
  );

  if (permissionStatus === null) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#9CA3AF' }}>Loading...</Text>
      </View>
    );
  }

  if (permissionStatus !== 'granted') {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>{'\uD83D\uDCCD'}</Text>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 }}>
          Enable Location
        </Text>
        <Text style={{ color: '#9CA3AF', textAlign: 'center', marginBottom: 24 }}>
          FindMyZyns needs your location to find nicotine sharers and stores near you. Please enable location in your browser settings.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A', position: 'relative' }}>
      <SearchBar onSelectLocation={(lat, lng) => handleRegionChange(lat, lng)} />
      <ActiveConnectionBanner />

      {location && (
        <WebMap
          latitude={location.latitude}
          longitude={location.longitude}
          sharers={nearbySharers}
          stores={nearbyStores}
          onSharerPress={(s) => { setSelectedStore(null); setSelectedSharer(s); }}
          onStorePress={(s) => { setSelectedSharer(null); setSelectedStore(s); }}
          onRegionChange={handleRegionChange}
        />
      )}

      {selectedSharer && (
        <SharerCard sharer={selectedSharer} onClose={() => setSelectedSharer(null)} />
      )}
      {selectedStore && (
        <StoreCard store={selectedStore} onClose={() => setSelectedStore(null)} />
      )}

      <StatusFAB />
      <ConnectionAlert />
    </View>
  );
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
