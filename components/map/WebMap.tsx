import { useEffect, useRef, memo } from 'react';
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

export const WebMap = memo(function WebMap({
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
  const lastCenter = useRef<{ lat: number; lng: number } | null>(null);

  if (Platform.OS !== 'web') return null;

  function getUserIcon(userStatus: string, karma: number) {
    const isSharing = userStatus === 'sharing';
    const bg = isSharing ? '#10B981' : '#F59E0B';
    const dot = karma < 0
      ? '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:7px;height:7px;border-radius:50%;background:#EF4444;"></div>'
      : karma > 0
        ? '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:7px;height:7px;border-radius:50%;background:#10B981;"></div>'
        : '';
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="position:relative;width:18px;height:18px;"><div style="width:18px;height:18px;border-radius:50%;background:${bg};"></div>${dot}</div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }

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
    html: '<div style="width:10px;height:10px;border-radius:50%;background:#3B82F6;"></div>',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      whenReady={(map: any) => {
        const c = map.target.getCenter();
        lastCenter.current = { lat: c.lat, lng: c.lng };

        setTimeout(() => {
          initialized.current = true;
        }, 1000);

        map.target.on('moveend', () => {
          if (!initialized.current) return;

          const center = map.target.getCenter();
          // Only trigger if center moved more than ~500m (ignore pure zoom)
          if (lastCenter.current) {
            const dlat = Math.abs(center.lat - lastCenter.current.lat);
            const dlng = Math.abs(center.lng - lastCenter.current.lng);
            if (dlat < 0.005 && dlng < 0.005) return;
          }
          lastCenter.current = { lat: center.lat, lng: center.lng };

          if (debounceTimer.current) clearTimeout(debounceTimer.current);
          debounceTimer.current = setTimeout(() => {
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
            {status !== 'offline' && <><br/>{status === 'sharing' ? 'Sharing — visible to others' : 'Fiending — browsing for sharers'}</>}
          </div>
        </Popup>
      </Marker>

      {sharers.map((sharer) => (
        <Marker
          key={sharer.id}
          position={[sharer.latitude, sharer.longitude]}
          icon={getUserIcon(sharer.user_status || 'sharing', sharer.karma)}
          eventHandlers={{ click: () => onSharerPress(sharer) }}
        >
          <Popup>
            <div style={{ color: '#000', padding: 4 }}>
              <strong>@{sharer.username}</strong>
              <span style={{ color: sharer.user_status === 'sharing' ? '#10B981' : '#F59E0B', marginLeft: 6, fontSize: 11 }}>
                {sharer.user_status === 'sharing' ? 'Sharing' : 'Fiending'}
              </span>
              <span style={{
                color: sharer.karma < 0 ? '#EF4444' : sharer.karma === 0 ? '#6B7280' : '#10B981',
                marginLeft: 6,
                fontSize: 11,
                fontWeight: 'bold',
              }}>
                {sharer.karma < 0 ? 'Mooch' : sharer.karma === 0 ? 'Balanced' : 'Giver'}
              </span>
              <br/>
              {sharer.product_name ? `${sharer.product_name} · ` : ''}{sharer.karma} karma
              <br/>
              <button
                onClick={(e) => {
                  const btn = e.currentTarget;
                  btn.textContent = 'Sent ✓';
                  btn.style.background = '#6B7280';
                  btn.style.cursor = 'default';
                  btn.disabled = true;
                }}
                style={{
                  marginTop: 5,
                  width: '100%',
                  padding: '3px 0',
                  border: 'none',
                  borderRadius: 6,
                  background: sharer.user_status === 'sharing' ? '#10B981' : '#F59E0B',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                {sharer.user_status === 'sharing' ? 'Request' : 'Offer'}
              </button>
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
            <div style={{ color: '#000', padding: 4 }}>
              <strong>{store.name}</strong><br/>
              <span style={{ fontSize: 11, color: '#666' }}>{store.address}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
});
