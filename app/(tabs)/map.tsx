import { useState, useEffect, useRef } from 'react';
import { View, Text, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusFAB } from '@/components/map/StatusFAB';
import { useStatusStore } from '@/stores/useStatusStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/constants/config';

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
  const lastBroadcast = useRef<{ lat: number; lng: number } | null>(null);
  const { status, updateLocation } = useStatusStore();
  const { profile } = useAuthStore();
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(perm);
      if (perm === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(loc);
      }
    })();
  }, []);

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

  return (
    <View className="flex-1 bg-dark">
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
      />
      <StatusFAB />
    </View>
  );
}

// Haversine distance in meters
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
