import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Platform } from 'react-native';
import { SharerPin, StorePin } from '@/types';

// Only import leaflet on web
let MapContainer: any;
let TileLayer: any;
let Marker: any;
let Popup: any;
let useMap: any;
let L: any;

if (Platform.OS === 'web') {
  const RL = require('react-leaflet');
  MapContainer = RL.MapContainer;
  TileLayer = RL.TileLayer;
  Marker = RL.Marker;
  Popup = RL.Popup;
  useMap = RL.useMap;
  L = require('leaflet');
}

interface WebMapProps {
  latitude: number;
  longitude: number;
  sharers: SharerPin[];
  stores: StorePin[];
  onSharerPress: (sharer: SharerPin) => void;
  onStorePress: (store: StorePin) => void;
  onRegionChange: (lat: number, lng: number) => void;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center]);
  return null;
}

export function WebMap({
  latitude,
  longitude,
  sharers,
  stores,
  onSharerPress,
  onStorePress,
  onRegionChange,
}: WebMapProps) {
  if (Platform.OS !== 'web') return null;

  const sharerIcon = L.divIcon({
    className: 'custom-marker',
    html: '<div style="width:32px;height:32px;border-radius:50%;background:#10B981;border:3px solid #fff;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;">Z</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const storeIcon = L.divIcon({
    className: 'custom-marker',
    html: '<div style="width:28px;height:28px;border-radius:50%;background:#3B82F6;border:2px solid #93C5FD;display:flex;align-items:center;justify-content:center;font-size:12px;">\uD83D\uDECD\uFE0F</div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      whenReady={(map: any) => {
        map.target.on('moveend', () => {
          const center = map.target.getCenter();
          onRegionChange(center.lat, center.lng);
        });
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapController center={[latitude, longitude]} />

      {sharers.map((sharer) => (
        <Marker
          key={sharer.id}
          position={[sharer.latitude, sharer.longitude]}
          icon={sharerIcon}
          eventHandlers={{
            click: () => onSharerPress(sharer),
          }}
        >
          <Popup>
            <div style={{ color: '#fff', background: '#1A1A1A', padding: 8, borderRadius: 8 }}>
              <strong>@{sharer.username}</strong><br/>
              {sharer.product_name} · {sharer.karma} karma
            </div>
          </Popup>
        </Marker>
      ))}

      {stores.map((store) => (
        <Marker
          key={store.place_id}
          position={[store.latitude, store.longitude]}
          icon={storeIcon}
          eventHandlers={{
            click: () => onStorePress(store),
          }}
        >
          <Popup>
            <div style={{ color: '#fff', background: '#1A1A1A', padding: 8, borderRadius: 8 }}>
              <strong>{store.name}</strong><br/>
              {store.address}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
