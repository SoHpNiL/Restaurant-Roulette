"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ScrollHeaderProps = {
  threshold?: number;
};

/** Displays a fixed header after the page has been scrolled past a threshold. */
export default function ScrollHeader({ threshold = 120 }: ScrollHeaderProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY >= threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return (
    <header
      className={`scroll-header${isVisible ? " is-visible" : ""}`}
      aria-hidden={!isVisible}
    >
      <Link className="scroll-header-brand" href="/" tabIndex={isVisible ? 0 : -1}>
        Restaurant Roulette
      </Link>
      <div className="scroll-header-auth" aria-label="Account options">
        <span>Log in</span>
        <span className="home-auth-divider" aria-hidden="true">
          /
        </span>
        <span>Sign up</span>
      </div>
    </header>
  );
}
