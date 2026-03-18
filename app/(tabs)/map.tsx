import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Platform, TouchableOpacity } from 'react-native';
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
  const [showStores, setShowStores] = useState(() => {
    try {
      return typeof window !== 'undefined' ? window.localStorage?.getItem('fmz_showStores') !== 'false' : true;
    } catch { return true; }
  });
  const lastBroadcast = useRef<{ lat: number; lng: number } | null>(null);
  const currentRegion = useRef<{ lat: number; lng: number } | null>(null);
  const { status, updateLocation, setStatus: setLocalStatus } = useStatusStore();
  const { nearbySharers, nearbyStores, fetchNearbySharers, fetchNearbyStores, subscribeToMapUpdates } = useMapStore();

  const handleSharerPress = useCallback((s: SharerPin) => { setSelectedStore(null); setSelectedSharer(s); }, []);
  const handleStorePress = useCallback((s: StorePin) => { setSelectedSharer(null); setSelectedStore(s); }, []);
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
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        setPermissionStatus('granted');
        currentRegion.current = { lat: latitude, lng: longitude };
        // Fetch immediately, then retry multiple times as auth session restores
        fetchNearbySharers(latitude, longitude);
        fetchNearbyStores(latitude, longitude);
        setTimeout(() => fetchNearbySharers(latitude, longitude), 2000);
        setTimeout(() => fetchNearbySharers(latitude, longitude), 5000);
        setTimeout(() => fetchNearbySharers(latitude, longitude), 10000);
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
    if (!currentRegion.current) return;
    const interval = setInterval(() => {
      if (currentRegion.current) {
        fetchNearbySharers(currentRegion.current.lat, currentRegion.current.lng);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [permissionStatus]);

  // Location broadcasting when sharing
  useEffect(() => {
    if (status !== 'sharing' || !currentRegion.current) return;
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
  }, [status, permissionStatus]);

  const handleRegionChange = useCallback(
    (lat: number, lng: number) => {
      if (!currentRegion.current) {
        currentRegion.current = { lat, lng };
        return;
      }
      const dist = getDistance(currentRegion.current.lat, currentRegion.current.lng, lat, lng);
      if (dist > 2000) {
        currentRegion.current = { lat, lng };
        fetchNearbySharers(lat, lng);
        fetchNearbyStores(lat, lng);
      }
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
      {/* Logo */}
      <View style={{
        position: 'absolute',
        top: 16,
        left: 0,
        right: 0,
        zIndex: 1001,
        alignItems: 'center',
        pointerEvents: 'none',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ color: '#10B981', fontSize: 40, fontWeight: '900', letterSpacing: 1, lineHeight: 48 }}>
            Find
          </Text>
          <Text style={{ color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: 1, lineHeight: 48 }}>
            My
          </Text>
          <View style={{
            backgroundColor: '#10B981',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 10,
            marginLeft: 4,
            justifyContent: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: 3, lineHeight: 48 }}>
              ZYNS
            </Text>
          </View>
        </View>
        <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 8, letterSpacing: 1 }}>
          ending male loneliness one pouch at a time
        </Text>
      </View>

      <SearchBar onSelectLocation={(lat, lng) => handleRegionChange(lat, lng)} />
      <ActiveConnectionBanner />

      {location && (
        <WebMap
          latitude={location.latitude}
          longitude={location.longitude}
          sharers={nearbySharers}
          stores={showStores ? nearbyStores : []}
          status={status}
          onSharerPress={handleSharerPress}
          onStorePress={handleStorePress}
          onRegionChange={handleRegionChange}
        />
      )}

      {/* Store toggle button */}
      <TouchableOpacity
        onPress={() => {
          const next = !showStores;
          setShowStores(next);
          try { if (typeof window !== 'undefined') window.localStorage?.setItem('fmz_showStores', String(next)); } catch {}
        }}
        style={{
          position: 'absolute',
          top: 70,
          right: 16,
          zIndex: 1000,
          backgroundColor: showStores ? '#3B82F6' : '#2A2A2A',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 14, marginRight: 6 }}>{'\uD83D\uDECD\uFE0F'}</Text>
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
          Stores {showStores ? 'ON' : 'OFF'}
        </Text>
      </TouchableOpacity>

      {selectedSharer && (
        <SharerCard sharer={selectedSharer} onClose={() => setSelectedSharer(null)} />
      )}
      {selectedStore && (
        <StoreCard store={selectedStore} onClose={() => setSelectedStore(null)} />
      )}

      {status !== 'offline' && (
        <View style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 999,
        }}>
          <View style={{
            backgroundColor: status === 'sharing' ? '#10B981' : '#F59E0B',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#fff',
              marginRight: 8,
            }} />
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
              {status === 'sharing'
                ? `You are sharing — visible to others nearby`
                : `You are fiending — browse the map for sharers`}
            </Text>
          </View>
        </View>
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
