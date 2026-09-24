import AucklandMapLoader from "../components/AucklandMapLoader";
import Link from "next/link";

/** Renders the map-only restaurant discovery page. */
export default function MapPage() {
  return (
    <main className="map-only-page">
      <header className="map-page-header">
        <Link className="map-page-brand" href="/" aria-label="Restaurant Roulette home">
          <span className="brand-mark" aria-hidden="true">
            ↗
          </span>
          <span>Restaurant Roulette</span>
        </Link>
        <label className="map-filter">
          <span className="sr-only">Filter map locations</span>
          <select defaultValue="all" aria-label="Filter map locations">
            <option value="all">All locations</option>
            <option value="restaurants">Restaurants</option>
            <option value="cafes">Cafés</option>
            <option value="takeaway">Takeaway</option>
          </select>
        </label>
      </header>
      <AucklandMapLoader />
    </main>
  );
}
