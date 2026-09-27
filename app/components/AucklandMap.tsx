"use client";

import { useEffect, useRef } from "react";

const aucklandCenter: [number, number] = [-36.8485, 174.7633];
const aucklandBounds: [[number, number], [number, number]] = [
  [-37.02, 174.62],   
  [-36.75, 175.05],   
];
const cbdRestaurants: { name: string; position: [number, number]; address: string }[] = [
  { name: "Ahi", position: [-36.8448, 174.7673], address: "Commercial Bay" },
  { name: "Amano", position: [-36.8453, 174.7691], address: "Tyler Street" },
  { name: "Giapo", position: [-36.8461, 174.7708], address: "Gore Street" },
  { name: "Depot Eatery", position: [-36.8489, 174.7626], address: "Federal Street" },
  { name: "Soul Bar & Bistro", position: [-36.8429, 174.7631], address: "Viaduct Harbour" },
];

/** Displays the Auckland OpenStreetMap basemap without external place data. */
export default function AucklandMap({ preview = false }: { preview?: boolean }) {
  const mapElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    const loadMap = async () => {
      const L = (await import("leaflet")).default;

      if (cancelled || !mapElement.current) {
        return;
      }

      const mapInstance = L.map(mapElement.current, {
        maxBounds: L.latLngBounds(aucklandBounds),
        maxBoundsViscosity: 1,
        minZoom: 10,
        maxZoom: 17,
        zoomControl: !preview,
        scrollWheelZoom: !preview,
      }).setView(preview ? [-36.8466, 174.7668] : aucklandCenter, preview ? 14 : 11);
      map = mapInstance;

      L.tileLayer("https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
        maxZoom: 19,
      }).addTo(mapInstance);

      if (preview) {
        const restaurantIcon = L.divIcon({
          className: "",
          html: '<span class="restaurant-marker" aria-hidden="true"><span>✦</span></span>',
          iconSize: [42, 42],
          iconAnchor: [21, 21],
        });

        cbdRestaurants.forEach((restaurant) => {
          L.marker(restaurant.position, {
            icon: restaurantIcon,
            title: restaurant.name,
            alt: restaurant.name,
          })
            .bindPopup(`<strong>${restaurant.name}</strong><br />${restaurant.address}`)
            .addTo(mapInstance);
        });
      }
    };

    void loadMap();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [preview]);

  return (
    <div
      className={`map-card${preview ? " home-map-card" : ""}`}
      aria-label={preview ? "Map of Auckland CBD restaurants" : "Interactive OpenStreetMap of Auckland"}
    >
      <div className="map-heading">
        <span className="map-kicker">Explore Auckland</span>
        <span className="map-location">OpenStreetMap ↗</span>
      </div>
      <div ref={mapElement} className="auckland-map" />
      <p className="map-caption">Pan and zoom to explore Auckland</p>
    </div>
  );
}
