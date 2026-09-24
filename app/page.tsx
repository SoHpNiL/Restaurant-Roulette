import AucklandMapLoader from "./components/AucklandMapLoader";

/** Renders the map-only restaurant discovery homepage. */
export default function Home() {
  return (
    <main className="map-only-page">
      <AucklandMapLoader />
    </main>
  );
}
