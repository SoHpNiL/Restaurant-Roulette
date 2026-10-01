"use client";

import dynamic from "next/dynamic";

const AucklandMap = dynamic(() => import("./AucklandMap"), {
  ssr: false,
  loading: () => <div className="map-card map-loading">Loading Auckland map…</div>,
});

/** Defers the browser-only Leaflet component until client-side rendering. */
export default function AucklandMapLoader({
  preview = false,
  radiusKm,
  locationCenter,
}: {
  preview?: boolean;
  radiusKm?: number;
  locationCenter?: [number, number];
}) {
  return <AucklandMap preview={preview} radiusKm={radiusKm} locationCenter={locationCenter} />;
}
