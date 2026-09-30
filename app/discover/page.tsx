"use client";

import { useState } from "react";
import AucklandMapLoader from "../components/AucklandMapLoader";
import Filter from "../components/filter_component/Filter";
import Link from "next/link";

/** Renders the map-only restaurant discovery page. */
export default function DiscoverPage() {
  const [maxDistance, setMaxDistance] = useState(0);

  return (
    <main className="map-only-page">
      <header className="map-page-header">
        <Link className="map-page-brand" href="/" aria-label="Restaurant Roulette home">
          <span>Restaurant Roulette</span>
        </Link>
        <Filter maxDistance={maxDistance} onDistanceChange={setMaxDistance} />
      </header>
      <AucklandMapLoader radiusKm={maxDistance} />
      <div className="">

      </div>
    </main>
  );
}
