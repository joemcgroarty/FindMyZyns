import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { SharerPin, StorePin } from '@/types';

let MapContainer: any;
let TileLayer: any;
let Marker: any;
let Popup: any;
let L: any;

if (Platform.OS === 'web') {
  const RL = require('react-leaflet');
  MapContainer = RL.MapContainer;
  TileLayer = RL.TileLayer;
  Marker = RL.Marker;
  Popup = RL.Popup;
  L = require('leaflet');
}

interface WebMapProps {
  latitude: number;
  longitude: number;
  sharers: SharerPin[];
  stores: StorePin[];
  status: 'offline' | 'sharing' | 'needing';
  onSharerPress: (sharer: SharerPin) => void;
  onStorePress: (store: StorePin) => void;
  onRegionChange: (lat: number, lng: number) => void;
}

export function WebMap({
  latitude,
  longitude,
  sharers,
  stores,
  status,
  onSharerPress,
  onStorePress,
  onRegionChange,
}: WebMapProps) {
  const initialized = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (Platform.OS !== 'web') return null;

  const sharerIcon = L.divIcon({
    className: 'custom-marker',
    html: '<div style="width:32px;height:32px;border-radius:50%;background:#10B981;border:3px solid #fff;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;">Z</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const youAreHereIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="position:relative;width:20px;height:20px;">
      <div style="position:absolute;inset:0;border-radius:50%;background:${status === 'sharing' ? '#10B981' : status === 'needing' ? '#F59E0B' : '#6B7280'};opacity:0.3;animation:pulse 2s infinite;"></div>
      <div style="position:absolute;inset:4px;border-radius:50%;background:${status === 'sharing' ? '#10B981' : status === 'needing' ? '#F59E0B' : '#fff'};border:2px solid #fff;"></div>
    </div>
    <style>@keyframes pulse{0%,100%{transform:scale(1);opacity:0.3}50%{transform:scale(2);opacity:0}}</style>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
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
        // Skip the initial moveend that fires on map load
        setTimeout(() => {
          initialized.current = true;
        }, 1000);

        map.target.on('moveend', () => {
          if (!initialized.current) return;

          // Debounce region changes to prevent rapid re-renders
          if (debounceTimer.current) clearTimeout(debounceTimer.current);
          debounceTimer.current = setTimeout(() => {
            const center = map.target.getCenter();
            onRegionChange(center.lat, center.lng);
          }, 500);
        });
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* Your location marker */}
      <Marker
        key={`you-${status}`}
        position={[latitude, longitude]}
        icon={youAreHereIcon}
      >
        <Popup>
          <div style={{ color: '#fff', background: '#1A1A1A', padding: 8, borderRadius: 8 }}>
            <strong>You are here</strong>
            {status !== 'offline' && <><br/>{status === 'sharing' ? 'Sharing — visible to others' : 'Needing — browsing for sharers'}</>}
          </div>
        </Popup>
      </Marker>

      {sharers.map((sharer) => (
        <Marker
          key={sharer.id}
          position={[sharer.latitude, sharer.longitude]}
          icon={sharerIcon}
          eventHandlers={{ click: () => onSharerPress(sharer) }}
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
          eventHandlers={{ click: () => onStorePress(store) }}
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
