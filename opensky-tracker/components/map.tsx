'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icon ISS Neon Gold SVG
const issIcon = L.divIcon({
  html: `<div style="width: 36px; height: 36px; filter: drop-shadow(0px 0px 8px #ffb700);">
           <svg viewBox="0 0 24 24" fill="#ffb700" xmlns="http://www.w3.org/2000/svg">
             <path d="M19 12h-2v-2h2v2zm-4 0h-2v-2h2v2zm-8 0H5v-2h2v2zm4 0H9v-2h2v2zm8-4h-2V6h2v2zm-4 0h-2V6h2v2zm-8 0H5V6h2v2zm4 0H9V6h2v2zm10 8h-2v2h2v-2zm-4 0h-2v2h2v-2zm-8 0H5v2h2v-2zm4 0H9v2h2v-2z"/>
           </svg>
         </div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Auto-follow kamera peta ke ISS
function MapFollower({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(center, { animate: true });
  }, [center, map]);
  return null;
}

export default function Map() {
  const [issData, setIssData] = useState<any>(null);
  const [autoFollow, setAutoFollow] = useState<boolean>(true);
  const [distanceToID, setDistanceToID] = useState<number | null>(null);

  // Koordinat pusat Jakarta, Indonesia
  const ID_LAT = -6.2000;
  const ID_LON = 106.8166;

  // Fungsi hitung jarak Haversine (km) dari ISS ke Jakarta
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius bumi dalam km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  useEffect(() => {
    const fetchISS = async () => {
      try {
        const res = await fetch('/api/opensky');
        if (res.ok) {
          const data = await res.json();
          setIssData(data);
          if (data.latitude && data.longitude) {
            const dist = calculateDistance(data.latitude, data.longitude, ID_LAT, ID_LON);
            setDistanceToID(dist);
          }
        }
      } catch (err) {
        console.error('Gagal fetch ISS:', err);
      }
    };

    fetchISS();
    const interval = setInterval(fetchISS, 3000);
    return () => clearInterval(interval);
  }, []);

  const position: [number, number] = issData
    ? [issData.latitude, issData.longitude]
    : [0, 0];

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-mono">
      {/* Sidebar Telemetri & Info Jarak ke Indonesia */}
      <div className="absolute top-4 left-4 z-[1000] w-80 sm:w-96 space-y-4">
        {/* Distance Tracker Card */}
        <div className="bg-black/80 backdrop-blur-md border border-amber-500/40 p-4 rounded-2xl text-white shadow-2xl space-y-3">
          <div className="flex justify-between items-center border-b border-amber-500/20 pb-2">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
              Indonesia Proximity Tracker
            </span>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Distance to Jakarta, ID:</span>
            <div className="text-2xl font-bold text-amber-300 mt-1">
              {distanceToID !== null ? `${distanceToID.toLocaleString()} km` : 'Calculating...'}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              {distanceToID && distanceToID < 2000 ? '🔥 ISS sedang mendekati wilayah Asia Tenggara!' : 'Orbit sedang berada di region lain.'}
            </p>
          </div>
        </div>

        {/* ISS Main Telemetry Card */}
        {issData && (
          <div className="bg-black/80 backdrop-blur-md border border-amber-500/40 p-4 rounded-2xl text-white shadow-2xl space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-2">
              <span className="text-amber-400 font-bold text-sm">ISS (NORAD ID 25544)</span>
              <button
                onClick={() => setAutoFollow(!autoFollow)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                  autoFollow ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-gray-800 border-gray-600 text-gray-400'
                }`}
              >
                {autoFollow ? 'Auto-Lock: ON' : 'Auto-Lock: OFF'}
              </button>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Velocity:</span>
              <span className="font-bold text-amber-300">
                {Math.round(issData.velocity).toLocaleString()} km/h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Altitude:</span>
              <span className="font-bold text-cyan-300">
                {Math.round(issData.altitude)} km
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Latitude:</span>
              <span>{issData.latitude.toFixed(4)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Longitude:</span>
              <span>{issData.longitude.toFixed(4)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Visibility:</span>
              <span className="font-bold uppercase text-amber-400">{issData.visibility}</span>
            </div>
          </div>
        )}
      </div>

      {/* Map Renderer */}
      <MapContainer
        center={[0, 0]}
        zoom={3}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {issData && (
          <>
            {autoFollow && <MapFollower center={position} />}
            <Marker position={position} icon={issIcon}>
              <Popup>
                <div className="text-black font-sans text-xs">
                  <strong>International Space Station</strong>
                  <br />
                  Speed: {Math.round(issData.velocity)} km/h
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
}