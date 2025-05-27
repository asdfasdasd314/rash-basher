import React, { useEffect, useRef } from 'react';

export function LeafletWebMap() {
  const mapRef = useRef(null);

  useEffect(() => {
    // Avoid re-creating if already initialized
    if (!mapRef.current || window.L) return;

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
    script.onload = () => {
      const map = window.L.map(mapRef.current).setView([37.7749, -122.4194], 13);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      window.L.marker([37.7749, -122.4194]).addTo(map).bindPopup('Hello from Leaflet!');
    };
    document.body.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);

  return (
    <div
      ref={mapRef}
      id="map"
      style={{ height: '100vh', width: '100%' }}
    />
  );
}