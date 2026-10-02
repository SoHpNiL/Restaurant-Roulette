"use client";

import "./Filter.css";
import { useState } from "react";
import LocationButton from "../location_component/locationButton";

/** Renders a resizable panel on the discovery map. */
export default function Filter({
  maxDistance,
  onDistanceChange,
  onLocationFound,
}: {
  maxDistance: number;
  onDistanceChange: (distance: number) => void;
  onLocationFound: (coordinates: [number, number]) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false); //appends an is-expanded text to the css to show animation
  const [maxPrice, setMaxPrice] = useState(50);

  return (
    <div className="filter-box">
      <button
        className="filter-resize-button"
        type="button"
        aria-label={isExpanded ? "Shrink panel" : "Expand panel"}
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        <span className="filter-resize-icon filter-resize-icon-stretch" aria-hidden="true" />
        <span className="filter-resize-icon filter-resize-icon-expand" aria-hidden="true" />
      </button>
      <LocationButton onLocationFound={onLocationFound} />
      <span className="filter-title" aria-hidden="true">FILTERS 🔥</span>
      <div className="filter-mock-controls" role="group" aria-label="Mock filter controls">
        <div className="filter-range-control">
          <label htmlFor="filter-price-range">
            <span>Maximum price: </span>
            <span className="filter-range-value">${maxPrice}</span>
          </label>
          <input
            className="filter-range-slider"
            id="filter-price-range"
            type="range"
            min="0"
            max="100"
            value={maxPrice}
            onChange={(event) => setMaxPrice(Number(event.target.value))}
            style={{
              background: `linear-gradient(to right, #c65b20 0%, #c65b20 ${maxPrice}%, var(--cream) ${maxPrice}%, var(--cream) 100%)`,
            }}
          />
          <div className="filter-range-labels" aria-hidden="true">
            <span>$0</span>
            <span>$100</span>
          </div>
        </div>
        <div className="filter-range-control">
          <label htmlFor="filter-distance-range">
            <span>Maximum distance: </span>
            <span className="filter-range-value">{maxDistance} km</span>
          </label>
          <input
            className="filter-range-slider"
            id="filter-distance-range"
            type="range"
            min="0"
            max="25"
            value={maxDistance}
            onChange={(event) => onDistanceChange(Number(event.target.value))}
            style={{
              background: `linear-gradient(to right, #c65b20 0%, #c65b20 ${(maxDistance / 25) * 100}%, var(--cream) ${(maxDistance / 25) * 100}%, var(--cream) 100%)`,
            }}
          />
          <div className="filter-range-labels" aria-hidden="true">
            <span>0 km</span>
            <span>25 km</span>
          </div>
        </div>
        <button type="button">Cuisine</button>
        <button type="button"> 4+ Rating</button>
        <button type="button">Open now</button>
        <button type="button">Takeaway</button>
        <button type="button">Delivery</button>
        <button type="button">Vegetarian</button>
        <button type="button">Vegan</button>
        <button type="button">Outdoor seating</button>
        <button type="button">Reservations</button>
      </div>
    </div>
  );
}