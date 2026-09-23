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

type MapStatus = "loading" | "ready" | "config" | "error";

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
    let infoWindow: google.maps.InfoWindow | undefined;
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
            { featureType: "poi.business", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "simplified" }] },
          ],
        });

        infoWindow = new google.maps.InfoWindow();
        const placesService = new google.maps.places.PlacesService(map);

        placesService.nearbySearch(
          {
            location: aucklandCenter,
            radius: 15000,
            type: "restaurant",
          },
          (places, searchStatus) => {
            if (cancelled) {
              return;
            }

            if (searchStatus !== google.maps.places.PlacesServiceStatus.OK || !places?.length) {
              setStatus("error");
              setMessage("Google could not find restaurants right now. Please try again later.");
              return;
            }

            markers = places
              .filter((place) => place.geometry?.location)
              .map((place) => {
                const marker = new google.maps.Marker({
                  map,
                  position: place.geometry!.location,
                  title: place.name,
                });

                marker.addListener("click", () => {
                  infoWindow?.setContent(
                    `<strong>${place.name ?? "Restaurant"}</strong>${place.vicinity ? `<br>${place.vicinity}` : ""}`,
                  );
                  infoWindow?.open({ map, anchor: marker });
                });

                return marker;
              });

            setStatus("ready");
          },
        );
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
      markers.forEach((marker) => marker.setMap(null));
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
      <p className="map-caption">Drag to browse neighbourhoods · Tap a marker to explore</p>
    </div>
  );
}
