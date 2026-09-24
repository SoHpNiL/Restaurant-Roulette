"use client";

import { useEffect, useRef } from "react";

const aucklandCenter: [number, number] = [-36.8485, 174.7633];
const aucklandBounds: [[number, number], [number, number]] = [
  [-37.15, 174.55],
  [-36.65, 175.15],
];

/** Displays the Auckland OpenStreetMap basemap without external place data. */
export default function AucklandMap() {
  const mapElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    const loadMap = async () => {
      const L = (await import("leaflet")).default;

      if (cancelled || !mapElement.current) {
        return;
      }

      map = L.map(mapElement.current, {
        maxBounds: L.latLngBounds(aucklandBounds),
        maxBoundsViscosity: 1,
        minZoom: 10,
        maxZoom: 17,
        zoomControl: true,
      }).setView(aucklandCenter, 11);

      L.tileLayer("https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
        maxZoom: 19,
      }).addTo(map);
    };

    void loadMap();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return (
    <div className="map-card" aria-label="Interactive OpenStreetMap of Auckland">
      <div className="map-heading">
        <span className="map-kicker">Explore Auckland</span>
        <span className="map-location">OpenStreetMap ↗</span>
      </div>
      <div ref={mapElement} className="auckland-map" />
      <p className="map-caption">Pan and zoom to explore Auckland</p>
    </div>
  );
}
