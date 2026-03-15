import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusFAB } from '@/components/map/StatusFAB';
import { SharerMarker } from '@/components/map/SharerPin';
import { SharerCard } from '@/components/map/SharerCard';
import { StoreMarker } from '@/components/map/StoreMarker';
import { StoreCard } from '@/components/map/StoreCard';
import { ConnectionAlert } from '@/components/connection/ConnectionAlert';
import { SearchBar } from '@/components/map/SearchBar';
import { ActiveConnectionBanner } from '@/components/connection/ActiveConnectionBanner';
import { useStatusStore } from '@/stores/useStatusStore';
import { useMapStore } from '@/stores/useMapStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useConnectionStore } from '@/stores/useConnectionStore';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/constants/config';
import { SharerPin, StorePin } from '@/types';

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8e8e8e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1d1d' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e0e' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [selectedSharer, setSelectedSharer] = useState<SharerPin | null>(null);
  const [selectedStore, setSelectedStore] = useState<StorePin | null>(null);
  const lastBroadcast = useRef<{ lat: number; lng: number } | null>(null);
  const currentRegion = useRef<{ lat: number; lng: number } | null>(null);
  const { status, updateLocation } = useStatusStore();
  const { nearbySharers, nearbyStores, fetchNearbySharers, fetchNearbyStores, subscribeToMapUpdates } = useMapStore();
  const { profile } = useAuthStore();
  const { fetchPendingRequests } = useConnectionStore();
  const mapRef = useRef<MapView>(null);

  // Request location permission
  useEffect(() => {
    (async () => {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(perm);
      if (perm === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(loc);
        currentRegion.current = {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        };
        // Initial fetch
        await fetchNearbySharers(loc.coords.latitude, loc.coords.longitude);
        await fetchNearbyStores(loc.coords.latitude, loc.coords.longitude);
      }
    })();
  }, []);

  // Subscribe to realtime map updates
  useEffect(() => {
    const unsubscribe = subscribeToMapUpdates();
    return unsubscribe;
  }, []);

  // Fetch pending connection requests on mount
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  // Periodic refetch every 30 seconds
  useEffect(() => {
    if (!currentRegion.current) return;
    const interval = setInterval(() => {
      if (currentRegion.current) {
        fetchNearbySharers(currentRegion.current.lat, currentRegion.current.lng);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [location]);

  // Location broadcasting when sharing
  useEffect(() => {
    if (status !== 'sharing' || permissionStatus !== 'granted') return;

    const interval = setInterval(async () => {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;

      if (lastBroadcast.current) {
        const dist = getDistance(
          lastBroadcast.current.lat,
          lastBroadcast.current.lng,
          latitude,
          longitude,
        );
        if (dist < APP_CONFIG.LOCATION_MOVEMENT_THRESHOLD_M) return;
      }

      await updateLocation(latitude, longitude);
      lastBroadcast.current = { lat: latitude, lng: longitude };
    }, APP_CONFIG.LOCATION_UPDATE_INTERVAL_MS);

    // Broadcast immediately on start
    (async () => {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await updateLocation(loc.coords.latitude, loc.coords.longitude);
      lastBroadcast.current = {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      };
    })();

    return () => clearInterval(interval);
  }, [status, permissionStatus]);

  const handleRegionChange = useCallback(
    (region: Region) => {
      if (!currentRegion.current) {
        currentRegion.current = { lat: region.latitude, lng: region.longitude };
        return;
      }
      const dist = getDistance(
        currentRegion.current.lat,
        currentRegion.current.lng,
        region.latitude,
        region.longitude,
      );
      if (dist > 2000) {
        currentRegion.current = { lat: region.latitude, lng: region.longitude };
        fetchNearbySharers(region.latitude, region.longitude);
        fetchNearbyStores(region.latitude, region.longitude);
      }
    },
    [fetchNearbySharers],
  );

  if (permissionStatus === null) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <Text className="text-gray-400">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (permissionStatus !== 'granted') {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center px-6">
        <Text className="text-4xl mb-4">{'\uD83D\uDCCD'}</Text>
        <Text className="text-white text-xl font-bold text-center mb-3">
          Enable Location
        </Text>
        <Text className="text-gray-400 text-center text-base mb-6">
          FindMyZyns needs your location to find nicotine sharers and stores near you.
        </Text>
        <Button
          title="Open Settings"
          onPress={() => Location.requestForegroundPermissionsAsync()}
        />
      </SafeAreaView>
    );
  }

  const handleSearchLocation = useCallback(
    (lat: number, lng: number) => {
      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
      currentRegion.current = { lat, lng };
      fetchNearbySharers(lat, lng);
      fetchNearbyStores(lat, lng);
    },
    [fetchNearbySharers, fetchNearbyStores],
  );

  return (
    <View className="flex-1 bg-dark">
      <SearchBar onSelectLocation={handleSearchLocation} />
      <ActiveConnectionBanner />
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={Platform.OS === 'android' ? darkMapStyle : undefined}
        userInterfaceStyle="dark"
        initialRegion={
          location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : {
                latitude: 37.7749,
                longitude: -122.4194,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
        }
        onRegionChangeComplete={handleRegionChange}
        onPress={() => { setSelectedSharer(null); setSelectedStore(null); }}
      >
        {nearbySharers.map((sharer) => (
          <SharerMarker
            key={sharer.id}
            sharer={sharer}
            onPress={(s) => {
              setSelectedStore(null);
              setSelectedSharer(s);
            }}
          />
        ))}
        {nearbyStores.map((store) => (
          <StoreMarker
            key={store.place_id}
            store={store}
            onPress={(s) => {
              setSelectedSharer(null);
              setSelectedStore(s);
            }}
          />
        ))}
      </MapView>

      {selectedSharer && (
        <SharerCard
          sharer={selectedSharer}
          onClose={() => setSelectedSharer(null)}
        />
      )}

      {selectedStore && (
        <StoreCard
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
        />
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
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
