import React, { useEffect, useState } from "react";

interface SeededParticle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  rotation: number;
}

export default function BackgroundParticles({ active = true }: { active?: boolean }) {
  const [particles, setParticles] = useState<SeededParticle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Seed 25 randomized floating love hearts
    const initParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 95, // Percentage
      delay: Math.random() * -12, // Start ahead so there's no initial blank gap
      duration: 10 + Math.random() * 8, // Seconds
      size: 12 + Math.random() * 24, // Pixels
      drift: -80 + Math.random() * 160, // Drift motion px
      rotation: Math.random() * 90 - 45, // Rotated angle
    }));
    setParticles(initParticles);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute text-rose-300/30 font-serif animate-heart-particle select-none"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
            "--drift": `${p.drift}px`,
            "--rotation": `${p.rotation}deg`,
          } as React.CSSProperties}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
