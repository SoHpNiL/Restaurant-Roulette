import Link from "next/link";
import AucklandMapLoader from "./components/AucklandMapLoader";

export default function Home() {
  return (
    <main className="page-shell">
      <nav className="nav">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            ↗
          </span>
          Restaurant Roulette
        </Link>
        <span className="nav-note">A better way to pick dinner</span>
      </nav>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">No more “you choose”</p>
          <h1 id="hero-title">
            Let&apos;s find your
            <span> next favourite.</span>
          </h1>
          <p className="intro">
            Spin the wheel and discover a restaurant everyone can agree on.
            Good food is just one decision away.
          </p>
          <button className="primary-button" type="button">
            Spin the wheel <span aria-hidden="true">↗</span>
          </button>
        </div>

        <AucklandMapLoader />
      </section>

      <footer className="footer">
        <span>Made for indecisive diners.</span>
        <span>© {new Date().getFullYear()} Restaurant Roulette</span>
      </footer>
    </main>
  );
}
