"use client";

import dynamic from "next/dynamic";

const AucklandMap = dynamic(() => import("./AucklandMap"), {
  ssr: false,
  loading: () => <div className="map-card map-loading">Loading Auckland map…</div>,
});

export default function AucklandMapLoader() {
  return <AucklandMap />;
}
