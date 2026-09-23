"use client";

import { useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

const aucklandCenter = { lat: -36.8485, lng: 174.7633 };
const aucklandBounds = {
  north: -36.65,
  south: -37.15,
  east: 175.15,
  west: 174.55,
};
const restaurantSearchRegions = [
  { lat: -36.72, lng: 174.69 },
  { lat: -36.72, lng: 174.82 },
  { lat: -36.72, lng: 174.96 },
  { lat: -36.79, lng: 174.62 },
  { lat: -36.79, lng: 174.76 },
  { lat: -36.79, lng: 174.9 },
  { lat: -36.79, lng: 175.04 },
  { lat: -36.86, lng: 174.62 },
  { lat: -36.86, lng: 174.76 },
  { lat: -36.86, lng: 174.9 },
  { lat: -36.86, lng: 175.04 },
  { lat: -36.93, lng: 174.62 },
  { lat: -36.93, lng: 174.76 },
  { lat: -36.93, lng: 174.9 },
  { lat: -36.93, lng: 175.04 },
  { lat: -37.0, lng: 174.76 },
  { lat: -37.0, lng: 174.9 },
];

type MapStatus = "loading" | "ready" | "config" | "error";

/** Loads Auckland restaurant data and displays clustered or individual map markers based on zoom. */
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

    let markers: google.maps.Marker[] = [];
    let clusterMarkers: google.maps.Marker[] = [];
    let infoWindow: google.maps.InfoWindow | undefined;
    let removeZoomListener: google.maps.MapsEventListener | undefined;
    let cancelled = false;

    const loadMap = async () => {
      try {
        setOptions({ key: apiKey, v: "weekly" });
        await importLibrary("maps");
        await importLibrary("places");

        if (cancelled || !mapElement.current) {
          return;
        }

        const map = new google.maps.Map(mapElement.current, {
          center: aucklandCenter,
          zoom: 11,
          minZoom: 10,
          maxZoom: 17,
          restriction: { latLngBounds: aucklandBounds, strictBounds: true },
          gestureHandling: "greedy",
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "simplified" }] },
          ],
        });

        infoWindow = new google.maps.InfoWindow();
        const { Place } = (await importLibrary("places")) as google.maps.PlacesLibrary;
        const placeSearches = await Promise.all(
          restaurantSearchRegions.map((center) =>
            Place.searchNearby({
              fields: ["displayName", "formattedAddress", "location"],
              includedPrimaryTypes: ["restaurant"],
              locationRestriction: {
                center,
                radius: 8000,
              },
              maxResultCount: 20,
            }),
          ),
        );

        if (cancelled) {
          return;
        }

        const restaurantPlaces = Array.from(
          new globalThis.Map(
            placeSearches
              .flatMap(({ places }) => places)
              .filter((place) => place.location)
              .map((place) => [place.id, place]),
          ).values(),
        );

        if (!restaurantPlaces.length) {
          setStatus("error");
          setMessage("Google could not find restaurants right now. Please try again later.");
          return;
        }

        markers = restaurantPlaces.map((place) => {
          const marker = new google.maps.Marker({
            map: null,
            position: place.location!,
            title: place.displayName ?? "Restaurant",
          });

          marker.addListener("click", () => {
            infoWindow?.setContent(
              `<strong>${place.displayName ?? "Restaurant"}</strong>${place.formattedAddress ? `<br>${place.formattedAddress}` : ""}`,
            );
            infoWindow?.open({ map, anchor: marker });
          });

          return marker;
        });

        const updateMarkers = () => {
          const zoom = map.getZoom() ?? 11;
          const showIndividualMarkers = zoom >= 14;
          markers.forEach((marker) => marker.setMap(showIndividualMarkers ? map : null));

          // Rebuild the grid clusters as the zoom changes so nearby suburbs remain readable.
          clusterMarkers.forEach((marker) => marker.setMap(null));
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
            const clusterMarker = new google.maps.Marker({
              map,
              position: center,
              title: `${places.length} restaurants in this area. Click to zoom in.`,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: "#d8f36a",
                fillOpacity: 1,
                strokeColor: "#1d2824",
                strokeWeight: 3,
                scale: Math.min(22, 12 + places.length * 0.35),
              },
              label: {
                text: `${places.length}`,
                color: "#1d2824",
                fontWeight: "800",
                fontSize: "13px",
              },
            });
            clusterMarker.addListener("click", () => {
              const nextZoom = Math.min((map.getZoom() ?? 11) + 2, 14);
              const nextGridSize = { lat: gridSize.lat / 2, lng: gridSize.lng / 2 };
              const nextClusters = new globalThis.Map<
                string,
                { places: typeof restaurantPlaces; center: { lat: number; lng: number } }
              >();

              places.forEach((place) => {
                const location = place.location!;
                const key = `${Math.floor(location.lat() / nextGridSize.lat)}:${Math.floor(location.lng() / nextGridSize.lng)}`;
                const nextCluster = nextClusters.get(key);

                if (nextCluster) {
                  nextCluster.places.push(place);
                  nextCluster.center.lat += location.lat();
                  nextCluster.center.lng += location.lng();
                } else {
                  nextClusters.set(key, {
                    places: [place],
                    center: { lat: location.lat(), lng: location.lng() },
                  });
                }
              });

              const densestCluster = Array.from(nextClusters.values()).reduce(
                (densest, candidate) =>
                  candidate.places.length > densest.places.length ? candidate : densest,
              );
              const targetCenter = {
                lat: densestCluster.center.lat / densestCluster.places.length,
                lng: densestCluster.center.lng / densestCluster.places.length,
              };

              map.setZoom(nextZoom);
              map.panTo(targetCenter);
            });
            clusterMarkers.push(clusterMarker);
          });
        };

        removeZoomListener = map.addListener("zoom_changed", updateMarkers);
        updateMarkers();
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Google Maps could not load. Check the API key and enabled Google services.");
        }
      }
    };

    void loadMap();

    return () => {
      cancelled = true;
      removeZoomListener?.remove();
      markers.forEach((marker) => marker.setMap(null));
      clusterMarkers.forEach((marker) => marker.setMap(null));
      infoWindow?.close();
    };
  }, []);

  return (
    <div className="map-card" aria-label="Interactive Google map of Auckland restaurants">
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
      <p className="map-caption">Click the location count to zoom in · Tap a marker to explore</p>
    </div>
  );
}
