"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ScrollHeader from "./components/ScrollHeader";

const rotatingWords = ["Gamble", "Discover", "Explore",];
const heroImages = [
  {
    src: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=85",
    alt: "Fresh pizza ready to share",
    label: "Share a table",
  },
  {
    src: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1000&q=85",
    alt: "Colourful dishes on a restaurant table",
    label: "Try somewhere new",
  },
  {
    src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1000&q=85",
    alt: "Friends enjoying a meal together",
    label: "Make it local",
  },
];

/** Renders the landing page for Restaurant Roulette. */
export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const imageIndexRef = useRef(0);

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setIsChanging(true);

      window.setTimeout(() => {
        setWordIndex((currentIndex) => (currentIndex + 1) % rotatingWords.length);
        const nextImageIndex = (imageIndexRef.current + 1) % heroImages.length;
        const carousel = carouselRef.current;
        const slide = carousel?.children[nextImageIndex];

        imageIndexRef.current = nextImageIndex;
        setImageIndex(nextImageIndex);

        if (carousel && slide) {
          carousel.scrollLeft = (slide as HTMLElement).offsetLeft;
        }

        setIsChanging(false);
      }, 300);
    }, 4000);

    return () => window.clearInterval(rotation);
  }, []);

  function scrollToImage(index: number) {
    const carousel = carouselRef.current;
    const slide = carousel?.children[index];

    if (!carousel || !slide) {
      return;
    }

    carousel.scrollTo({
      left: (slide as HTMLElement).offsetLeft,
      behavior: "smooth",
    });
  }

  const handleImageScroll = () => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const nextIndex = Math.round(carousel.scrollLeft / carousel.clientWidth);

    imageIndexRef.current = nextIndex;
    setImageIndex(nextIndex);
  };

  return (
    <main className="home-page">
      <ScrollHeader />
      <header className="home-header">
        <Link className="brand" href="/" aria-label="Restaurant Roulette home">
          <span>Restaurant Roulette</span>
        </Link>
        <div className="home-auth" aria-label="Account options">
          <span>Log in</span>
          <span className="home-auth-divider" aria-hidden="true">
            /
          </span>
          <span>Sign up</span>
        </div>
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
            <span> Local</span>
            <span>Restaurants</span>
          </h1>
          <p className="home-intro">
            Stop wasting time eating the same food everyday.
            Gamble and discover a new favourite restaurant
          </p>
          <Link className="spinner-button" href="/map" aria-label="Let's go to the restaurant map">
            <span className="spinner" aria-hidden="true">
              <span className="spinner-wheel">
                <span className="spinner-center" />
              </span>
            </span>
            <span>Let&apos;s go</span>
          </Link>
        </div>
        <div className="home-art">
          <div
            className="home-carousel"
            ref={carouselRef}
            onScroll={handleImageScroll}
            aria-label="Local restaurant highlights"
          >
            {heroImages.map((image) => (
              <article className="home-slide" key={image.src}>
                <Image
                  className="home-slide-image"
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 700px) 86vw, 50vw"
                  priority={imageIndex === 0}
                />
                <span className="home-slide-label">{image.label}</span>
              </article>
            ))}
          </div>
          <div className="home-carousel-dots" aria-label="Choose a highlight">
            {heroImages.map((image, index) => (
              <button
                className={`home-carousel-dot${imageIndex === index ? " is-active" : ""}`}
                key={image.src}
                type="button"
                aria-label={`Show highlight ${index + 1}`}
                aria-current={imageIndex === index ? "true" : undefined}
                onClick={() => scrollToImage(index)}
              />
            ))}
          </div>
        </div>
      </section>
      <a className="home-scroll-cue" href="#map-preview">
        <span>Scroll to explore</span>
      </a>
      <section className="map-preview-section" id="map-preview" aria-labelledby="map-preview-title">
        <div className="map-preview-copy">
          <p className="home-kicker">Around the corner</p>
          <h2 id="map-preview-title">Your next table is closer than you think.</h2>
          <p>
            Browse local places, follow your curiosity, and let the map do the
            choosing.
          </p>
          <Link className="map-preview-link" href="/map">
            Open the live map <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="map-preview" aria-label="Illustrated static map of Auckland">
          <div className="map-preview-water" />
          <div className="map-preview-block map-preview-block-one" />
          <div className="map-preview-block map-preview-block-two" />
          <div className="map-preview-block map-preview-block-three" />
          <div className="map-preview-road map-preview-road-one" />
          <div className="map-preview-road map-preview-road-two" />
          <div className="map-preview-road map-preview-road-three" />
          <span className="map-preview-pin map-preview-pin-one">✦</span>
          <span className="map-preview-pin map-preview-pin-two">✦</span>
          <span className="map-preview-pin map-preview-pin-three">✦</span>
          <span className="map-preview-label">Auckland</span>
        </div>
      </section>
      <footer className="home-footer">
        <span>Made for curious appetites</span>
        <span className="">Support Auckland, Not Fast Food</span>
      </footer>
    </main>
  );
}
