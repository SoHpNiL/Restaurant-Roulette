"use client";

import { useEffect, useRef } from "react";

const aucklandCenter: [number, number] = [-36.8485, 174.7633];
const cbdRestaurants: { name: string; position: [number, number]; address: string }[] = [
  { name: "Ahi", position: [-36.8448, 174.7673], address: "Commercial Bay" },
  { name: "Amano", position: [-36.8453, 174.7691], address: "Tyler Street" },
  { name: "Giapo", position: [-36.8461, 174.7708], address: "Gore Street" },
  { name: "Depot Eatery", position: [-36.8489, 174.7626], address: "Federal Street" },
  { name: "Soul Bar & Bistro", position: [-36.8429, 174.7631], address: "Viaduct Harbour" },
];

/** Displays the Auckland OpenStreetMap basemap without external place data. */
export default function AucklandMap({
  preview = false,
  radiusKm,
  locationCenter,
}: {
  preview?: boolean;
  radiusKm?: number;
  locationCenter?: [number, number];
}) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const radiusCircleRef = useRef<import("leaflet").Circle | null>(null);
  const radiusKmRef = useRef(radiusKm);
  const locationCenterRef = useRef(locationCenter);

  useEffect(() => {
    radiusKmRef.current = radiusKm;
  }, [radiusKm]);
  useEffect(() => {
    locationCenterRef.current = locationCenter;
  }, [locationCenter]);

  useEffect(() => {
    let cancelled = false;

    const loadMap = async () => {
      const L = (await import("leaflet")).default;

      if (cancelled || !mapElement.current) {
        return;
      }

      const aucklandBounds = L.latLngBounds([-37.5, 173.5], [-36.6, 175.8]);
      const mapInstance = L.map(mapElement.current, {
        minZoom: 8,
        maxZoom: 17,
        zoomControl: !preview,
        scrollWheelZoom: !preview,
        maxBounds: preview ? undefined : aucklandBounds,
        maxBoundsViscosity: preview ? undefined : 1,
      }).setView(
        preview ? [-36.8466, 174.7668] : (locationCenterRef.current ?? aucklandCenter),
        preview ? 14 : 11,
      );
      mapRef.current = mapInstance;

      L.tileLayer("https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
        maxZoom: 19,
      }).addTo(mapInstance);

      const initialRadiusKm = radiusKmRef.current;
      if (!preview && initialRadiusKm !== undefined && initialRadiusKm > 0) {
        radiusCircleRef.current = L.circle(locationCenterRef.current ?? aucklandCenter, {
          radius: initialRadiusKm * 1000,
          color: "#c65b20",
          weight: 3,
          opacity: 0.9,
          fill: false,
          dashArray: "8 8",
          interactive: false,
        }).addTo(mapInstance);
        mapInstance.fitBounds(radiusCircleRef.current.getBounds(), {
          padding: [48, 48],
          maxZoom: 17,
        });
      }

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
      mapRef.current?.remove();
      mapRef.current = null;
      radiusCircleRef.current = null;
    };
  }, [preview]);

  useEffect(() => {
    let cancelled = false;

    const updateRadiusCircle = async () => {
      if (preview || radiusKm === undefined) {
        return;
      }

      const mapInstance = mapRef.current;
      if (!mapInstance) {
        return;
      }

      if (locationCenter) {
        radiusCircleRef.current?.setLatLng(locationCenter);
        if (radiusKm <= 0) {
          mapInstance.flyTo(locationCenter, mapInstance.getZoom());
        }
      }

      if (radiusKm <= 0) {
        radiusCircleRef.current?.remove();
        radiusCircleRef.current = null;
        return;
      }

      const L = (await import("leaflet")).default;
      if (cancelled || mapRef.current !== mapInstance) {
        return;
      }

      if (radiusCircleRef.current) {
        radiusCircleRef.current.setLatLng(locationCenter ?? aucklandCenter);
        radiusCircleRef.current.setRadius(radiusKm * 1000);
      } else {
        radiusCircleRef.current = L.circle(locationCenter ?? aucklandCenter, {
          radius: radiusKm * 1000,
          color: "#c65b20",
          weight: 3,
          opacity: 0.9,
          fill: false,
          dashArray: "8 8",
          interactive: false,
        }).addTo(mapInstance);
      }

      mapInstance.fitBounds(radiusCircleRef.current.getBounds(), {
        padding: [48, 48],
        maxZoom: 17,
      });
    };

    void updateRadiusCircle();

    return () => {
      cancelled = true;
    };
  }, [preview, radiusKm, locationCenter]);

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
