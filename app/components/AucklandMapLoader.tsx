"use client";

import dynamic from "next/dynamic";

const AucklandMap = dynamic(() => import("./AucklandMap"), {
  ssr: false,
  loading: () => <div className="map-card map-loading">Loading Auckland map…</div>,
});

/** Defers the browser-only Leaflet component until client-side rendering. */
export default function AucklandMapLoader({ preview = false }: { preview?: boolean }) {
  return <AucklandMap preview={preview} />;
}
