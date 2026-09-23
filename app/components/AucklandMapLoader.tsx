"use client";

import dynamic from "next/dynamic";

const AucklandMap = dynamic(() => import("./AucklandMap"), {
  ssr: false,
  loading: () => <div className="map-card map-loading">Loading Auckland map…</div>,
});

/** Defers the browser-only Google Maps component until client-side rendering. */
export default function AucklandMapLoader() {
  return <AucklandMap />;
}
