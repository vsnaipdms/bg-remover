"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface BeforeAfterProps {
  original: string;
  processed: string;
}

export default function BeforeAfter({ original, processed }: BeforeAfterProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);

  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) updatePosition(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) updatePosition(e.touches[0].clientX);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Before / After</h3>
        <p className="text-sm text-gray-400">Drag the slider to compare</p>
      </div>

      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden shadow-lg bg-white select-none"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleTouchMove}
        style={{ aspectRatio: "unset", minHeight: "300px", maxHeight: "70vh" }}
      >
        <img
          src={original}
          alt="Original"
          className="absolute inset-0 w-full h-full"
          draggable={false}
          style={{
            objectFit: "contain",
            imageRendering: "auto",
            colorScheme: "auto",
          }}
        />

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={processed}
            alt="Background removed"
            className="absolute inset-0 w-full h-full"
            draggable={false}
            style={{
              objectFit: "contain",
              imageRendering: "auto",
              colorScheme: "auto",
              backgroundImage: `
                linear-gradient(45deg, #ccc 25%, transparent 25%),
                linear-gradient(-45deg, #ccc 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #ccc 75%),
                linear-gradient(-45deg, transparent 75%, #ccc 75%)
              `,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
              backgroundColor: "#f0f0f0",
            }}
          />
        </div>

        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white cursor-col-resize shadow-lg"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-2xl flex items-center justify-center border border-gray-200">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l-4 4 4 4M16 7l4 4-4 4" />
            </svg>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
          Original
        </div>
        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
          Removed
        </div>
      </div>
    </motion.div>
  );
}
