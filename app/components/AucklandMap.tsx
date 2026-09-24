"use client";

import { useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

const aucklandCenter: [number, number] = [-36.8485, 174.7633];
const aucklandBounds: [[number, number], [number, number]] = [
  [-37.15, 174.55],
  [-36.65, 175.15],
];
const restaurantSearchRegions = [
  { lat: -36.73, lng: 174.7 },
  { lat: -36.78, lng: 174.92 },
  { lat: -36.85, lng: 174.65 },
  { lat: -36.85, lng: 174.82 },
  { lat: -36.94, lng: 174.72 },
  { lat: -37.0, lng: 174.9 },
];

type MapStatus = "loading" | "ready" | "config" | "error";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

/** Displays an OpenStreetMap basemap with restaurant locations found through Google Places. */
export default function AucklandMap() {
  const mapElement = useRef<HTMLDivElement>(null);
  const hasApiKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  const [status, setStatus] = useState<MapStatus>(hasApiKey ? "loading" : "config");
  const [message, setMessage] = useState(
    hasApiKey
      ? "Finding restaurants around Auckland…"
      : "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local to load restaurant locations.",
  );

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return;
    }

    let cancelled = false;
    let cleanupMap: (() => void) | undefined;

    const loadMap = async () => {
      try {
        const L = (await import("leaflet")).default;
        setOptions({ key: apiKey, v: "weekly" });
        const { Place } = (await importLibrary("places")) as google.maps.PlacesLibrary;

        if (cancelled || !mapElement.current) {
          return;
        }

        const map = L.map(mapElement.current, {
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

        const placeSearches: PromiseSettledResult<{ places: google.maps.places.Place[] }>[] = [];

        for (const center of restaurantSearchRegions) {
          try {
            placeSearches.push({
              status: "fulfilled",
              value: await Place.searchNearby({
                fields: ["displayName", "formattedAddress", "location"],
                includedPrimaryTypes: ["restaurant"],
                locationRestriction: {
                  center,
                  radius: 8000,
                },
                maxResultCount: 20,
              }),
            });
          } catch (error) {
            placeSearches.push({ status: "rejected", reason: error });
          }

          await new Promise((resolve) => window.setTimeout(resolve, 1000));
        }

        if (cancelled) {
          map.remove();
          return;
        }

        const restaurantPlaces = Array.from(
          new globalThis.Map(
            placeSearches
              .filter(
                (result): result is PromiseFulfilledResult<{ places: google.maps.places.Place[] }> =>
                  result.status === "fulfilled",
              )
              .flatMap(({ value }) => value.places)
              .filter((place) => place.location)
              .map((place) => [place.id, place]),
          ).values(),
        );

        if (!restaurantPlaces.length) {
          map.remove();
          setStatus("error");
          setMessage(
            placeSearches.some((result) => result.status === "rejected")
              ? "Google Places is rate-limiting requests. Please try again shortly."
              : "Google could not find restaurants right now. Please try again later.",
          );
          return;
        }

        const restaurantIcon = L.divIcon({
          className: "restaurant-marker",
          html: "🍽️",
          iconAnchor: [17, 17],
          iconSize: [34, 34],
        });
        const markers = restaurantPlaces.map((place) => {
          const marker = L.marker([place.location!.lat(), place.location!.lng()], {
            icon: restaurantIcon,
            title: place.displayName ?? "Restaurant",
          });
          const name = escapeHtml(place.displayName ?? "Restaurant");
          const address = place.formattedAddress
            ? `<br><span>${escapeHtml(place.formattedAddress)}</span>`
            : "";
          marker.bindPopup(`<strong>${name}</strong>${address}`);
          return marker;
        });
        let clusterMarkers: L.Marker[] = [];

        const updateMarkers = () => {
          const zoom = map.getZoom();
          const showIndividualMarkers = zoom >= 14;
          markers.forEach((marker) => {
            if (showIndividualMarkers) {
              marker.addTo(map);
            } else {
              marker.removeFrom(map);
            }
          });
          clusterMarkers.forEach((marker) => marker.removeFrom(map));
          clusterMarkers = [];

          if (showIndividualMarkers) {
            return;
          }

          const gridSize = zoom <= 11 ? { lat: 0.09, lng: 0.14 } : { lat: 0.045, lng: 0.07 };
          const clusters = new globalThis.Map<
            string,
            { places: typeof restaurantPlaces; center: { lat: number; lng: number } }
          >();

          restaurantPlaces.forEach((place) => {
            const location = place.location!;
            const key = `${Math.floor(location.lat() / gridSize.lat)}:${Math.floor(location.lng() / gridSize.lng)}`;
            const cluster = clusters.get(key);
            if (cluster) {
              cluster.places.push(place);
              cluster.center.lat += location.lat();
              cluster.center.lng += location.lng();
            } else {
              clusters.set(key, {
                places: [place],
                center: { lat: location.lat(), lng: location.lng() },
              });
            }
          });

          clusters.forEach(({ places, center }) => {
            center.lat /= places.length;
            center.lng /= places.length;
            const size = Math.min(44, 24 + places.length * 0.7);
            const clusterMarker = L.marker([center.lat, center.lng], {
              icon: L.divIcon({
                className: "restaurant-cluster",
                html: `${places.length}`,
                iconAnchor: [size / 2, size / 2],
                iconSize: [size, size],
              }),
              title: `${places.length} restaurants in this area. Click to zoom in.`,
            }).addTo(map);
            clusterMarker.on("click", () => {
              const nextZoom = Math.min(map.getZoom() + 2, 14);
              const target = places[Math.floor(places.length / 2)].location!;
              map.setView([target.lat(), target.lng()], nextZoom);
            });
            clusterMarkers.push(clusterMarker);
          });
        };

        map.on("zoomend", updateMarkers);
        updateMarkers();
        setStatus("ready");

        cleanupMap = () => {
          map.remove();
        };
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("The map could not load. Check the API key and enabled Google Places service.");
        }
      }
    };

    void loadMap();

    return () => {
      cancelled = true;
      cleanupMap?.();
    };
  }, []);

  return (
    <div className="map-card" aria-label="Interactive OpenStreetMap of Auckland restaurants">
      <div className="map-heading">
        <span className="map-kicker">Explore Auckland</span>
        <span className="map-location">Google Places ↗</span>
      </div>
      <div ref={mapElement} className="auckland-map" />
      {status !== "ready" && (
        <div className={`map-status map-status-${status}`} role={status === "error" ? "alert" : undefined}>
          {status === "loading" && <span className="map-spinner" aria-hidden="true" />}
          <span>{message}</span>
        </div>
      )}
      <p className="map-caption">Click the restaurant count to zoom in · Tap a marker to explore</p>
    </div>
  );
}
