"use client";

import { useState } from "react";
import "./locationButton.css";

type LocationButtonProps = {
  onLocationFound: (coordinates: [number, number]) => void;
};

export default function LocationButton({ onLocationFound }: LocationButtonProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not available in this browser.");
      return;
    }

    setErrorMessage(null);
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setIsLocating(false);
        onLocationFound([coords.latitude, coords.longitude]);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage("Location permission was denied. Allow access and try again.");
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage("Your location is currently unavailable. Try again.");
            break;
          case error.TIMEOUT:
            setErrorMessage("Request timed out. Try again.");
            break;
          default:
            setErrorMessage("Unable to get your location. Try again.");
        }
      },
      { timeout: 10000 },
    );
  };

  return (
    <>
      <button
        className="location-button"
        type="button"
        aria-label={isLocating ? "Getting your location" : "Use your current location"}
        aria-busy={isLocating}
        disabled={isLocating}
        onClick={requestLocation}
        title="Use your current location"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 10c0 5.2-7 11-7 11S5 15.2 5 10a7 7 0 1 1 14 0Z" />
          <circle cx="12" cy="10" r="2.25" />
        </svg>
      </button>
      {errorMessage && <span className="location-status" role="alert">{errorMessage}</span>}
    </>
  );
}