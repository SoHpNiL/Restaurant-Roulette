"use client";

import "./Filter.css";
import { useState } from "react";

/** Renders a resizable panel on the discovery map. */
export default function Filter() {
  const [isExpanded, setIsExpanded] = useState(false); //appends an is-expanded text to the css to show animation

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
      <div className="filter-area" aria-hidden={!isExpanded}>

      </div>
    </div>
  );
}