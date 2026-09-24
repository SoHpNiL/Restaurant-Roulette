"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const rotatingWords = ["Support", "Discover", "Review", "Explore", "Trust"];

/** Renders the landing page for Restaurant Roulette. */
export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setIsChanging(true);

      window.setTimeout(() => {
        setWordIndex((currentIndex) => (currentIndex + 1) % rotatingWords.length);
        setIsChanging(false);
      }, 300);
    }, 4000);

    return () => window.clearInterval(rotation);
  }, []);

  return (
    <main className="home-page">
      <header className="home-header">
        <Link className="brand" href="/" aria-label="Restaurant Roulette home">
          <span className="brand-mark" aria-hidden="true">
            ↗
          </span>
          <span>Restaurant Roulette</span>
        </Link>
      </header>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-copy">
          <h1 id="home-title">
            <span
              className={`rotating-word${isChanging ? " rotating-word-exit" : ""}`}
              aria-live="polite"
              key={rotatingWords[wordIndex]}
            >
              {rotatingWords[wordIndex]}
            </span>
            <span> a Local</span>
            <span>Restaurant</span>
          </h1>
          <p className="home-intro">
            Find your next favourite spot, support the people behind it, and make an
            ordinary meal feel like a plan.
          </p>
          <Link className="primary-button home-cta" href="/map">
            <span>Let&apos;s go</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="home-art" aria-hidden="true">
          <div className="home-art-sun" />
          <div className="home-art-plate">
            <div className="home-art-plate-inner">
              <span className="home-art-fork">✦</span>
              <span className="home-art-leaf">⌁</span>
            </div>
          </div>
          <span className="home-art-label home-art-label-top">Good food</span>
          <span className="home-art-label home-art-label-bottom">Close to home</span>
        </div>
      </section>
      <footer className="home-footer">
        <span>Made for curious appetites</span>
        <span>Explore Auckland ↗</span>
      </footer>
    </main>
  );
}
