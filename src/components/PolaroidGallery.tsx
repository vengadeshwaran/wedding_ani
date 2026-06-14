import React, { useState } from "react";
import { Camera, Calendar, Tag, ZoomIn, Eye, X } from "lucide-react";
import { Photo } from "../types";

interface GalleryProps {
  photos: Photo[];
}

export default function PolaroidGallery({ photos }: GalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Categories list
  const categories = ["All", "Engagement", "Wedding", "Honeymoon", "Family Moments", "Anniversary Celebrations"];

  // Normalize category matches
  const filteredPhotos = selectedCategory === "All"
    ? photos
    : photos.filter(p => p.category.toLowerCase().startsWith(selectedCategory.toLowerCase().substring(0, 5)));

  // Generate deterministic tilt based on the photo index to make it feel randomly pinned
  const getTiltClass = (idx: number) => {
    const tilts = [
      "rotate-1 hover:rotate-0 -translate-y-1 hover:-translate-y-2",
      "-rotate-2 hover:rotate-0 translate-y-1 hover:-translate-y-2",
      "rotate-2 hover:rotate-0 -translate-y-1 hover:-translate-y-2",
      "-rotate-1 hover:rotate-0 hover:-translate-y-2",
      "rotate-3 hover:rotate-0 translate-y-0.5 hover:-translate-y-2",
      "-rotate-3 hover:rotate-0 -translate-y-0.5 hover:-translate-y-2"
    ];
    return tilts[idx % tilts.length];
  };

  const preventDefaults = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-8" id="polaroid-gallery-wrapper">
      {/* Category Picker Tabs */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-[#5d4037]/10 pb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full font-retro text-xs transition duration-300 relative border ${
              selectedCategory === cat
                ? "bg-[#5d4037] text-[#fcf8f2] border-[#5d4037] shadow-md"
                : "bg-[#f5ece1]/40 text-[#5d4037] border-transparent hover:bg-[#f5ece1]/85 hover:border-[#5d4037]/20"
            }`}
            id={`btn-gallery-cat-${cat.replace(/\s+/g, "-").toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry-like Flex/Grid Polaroid Arranger */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 retro-glass rounded-2xl max-w-md mx-auto p-8 border border-dashed border-[#5d4037]/20">
          <Camera size={36} className="mx-auto text-zinc-400 mb-3" />
          <p className="font-serif italic text-[#4a3b32]/60">We are sketching our future chapters... No photographs in this category yet!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {filteredPhotos.map((photo, i) => (
            <div
              key={photo.id}
              onClick={() => {
                const globalIdx = photos.findIndex(p => p.id === photo.id);
                setLightboxIndex(globalIdx);
              }}
              className={`w-full max-w-sm bg-white p-4 pb-6 shadow-[0_10px_25px_-5px_rgba(93,64,55,0.15),0_8px_10px_-6px_rgba(93,64,55,0.1)] hover:shadow-2xl border border-zinc-100 rounded-sm cursor-zoom-in transition-all duration-300 transform ${getTiltClass(i)}`}
              id={`polaroid-card-${photo.id}`}
            >
              {/* Image Frame Wrapper */}
              <div className="relative aspect-square w-full overflow-hidden bg-neutral-900 border border-zinc-200 shadow-inner group">
                <img
                  src={photo.imageUrl}
                  alt={photo.caption || "Sweet Love Moment"}
                  className="w-full h-full object-cover grayscale-[15%] sepia-[10%] brightness-[103%] group-hover:scale-105 group-hover:brightness-105 duration-500 ease-out"
                  referrerPolicy="no-referrer"
                  onContextMenu={(e) => e.preventDefault()} // Disable Right Click
                />
                
                {/* Vintage overlay glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#9c7b62]/10 via-transparent to-[#fff]/5 pointer-events-none" />

                {/* Tag Overlay Label */}
                <span className="absolute top-2 left-2 text-[10px] font-mono uppercase tracking-widest bg-white/90 text-[#5d4037] px-2 py-0.5 rounded shadow-sm border border-zinc-200/50">
                  {photo.category}
                </span>

                {/* Hover zoom magnifier indicators */}
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="flex items-center space-x-1 text-white text-xs font-mono tracking-wider bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                    <ZoomIn size={12} />
                    <span>ZOOM TAPE</span>
                  </div>
                </div>
              </div>

              {/* Memory Caption & Date (Polaroid footer label in handwritten style) */}
              <div className="mt-4 text-center px-1">
                <p className="font-serif italic text-sm text-zinc-700 leading-relaxed line-clamp-2 select-text">
                  "{photo.caption || "A happy dream."}"
                </p>
                <div className="mt-3 flex items-center justify-center space-x-1.5 text-[10px] font-mono text-zinc-400 border-t border-zinc-100 pt-2.5">
                  <Calendar size={11} />
                  <span>{photo.date || "Unknown Date"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal (with secure download blocks) */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[999] bg-neutral-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-fade-in"
          onContextMenu={(e) => e.preventDefault()} // Double protect right click
          id="polaroid-lightbox"
        >
          {/* Top Panel Controls */}
          <div className="relative z-10 flex justify-between items-center text-white p-2">
            <div className="flex items-center space-x-2">
              <Camera size={16} className="text-[#e7aeb2]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#e7aeb2]">
                ORIGINAL REFLECTION IMAGE
              </span>
            </div>
            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition cursor-pointer"
              title="Close View"
              id="btn-lightbox-close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Core Visual Lightbox Stage */}
          <div className="flex-1 flex items-center justify-center relative p-2 max-h-[80vh]">
            {/* Download Shield (Invisible top layer preventing copy drag) */}
            <div
              className="absolute inset-0 z-30 select-none cursor-not-allowed"
              onDragStart={(e) => e.preventDefault()}
              onMouseDown={preventDefaults}
            />

            <img
              src={photos[lightboxIndex].imageUrl}
              alt={photos[lightboxIndex].caption}
              className="max-w-full max-h-[70vh] rounded-md shadow-2xl z-10 pointer-events-none select-none select-text border border-zinc-800"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Bottom Card Deck Labels */}
          <div className="relative z-10 text-center text-neutral-300 max-w-xl mx-auto space-y-1.5 p-4 border-t border-zinc-800 bg-neutral-900/60 rounded-xl">
            <span className="text-[10px] font-mono tracking-widest text-[#e7aeb2] px-2 py-0.5 rounded border border-[#e7aeb2]/30 uppercase bg-[#e7aeb2]/5">
              {photos[lightboxIndex].category}
            </span>
            <p className="font-serif italic text-base text-zinc-100 pt-2 leading-relaxed select-text">
              "{photos[lightboxIndex].caption || "A warm vintage memory."}"
            </p>
            <div className="flex items-center justify-center space-x-3 text-[10px] font-mono text-zinc-500 pt-1.5">
              <div className="flex items-center gap-1">
                <Calendar size={11} />
                <span>{photos[lightboxIndex].date}</span>
              </div>
              <span>|</span>
              <div className="flex items-center gap-1 text-red-400 font-mono">
                <Camera size={11} />
                <span>Download Restricted for Security</span>
              </div>
            </div>
          </div>

          {/* Lightbox Nav controls */}
          <div className="absolute top-1/2 left-4 right-4 flex justify-between z-40 transform -translate-y-1/2 pointer-events-none">
            <button
              onClick={() =>
                setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length)
              }
              className="p-2 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 text-white hover:scale-105 pointer-events-auto transition cursor-pointer"
              title="Previous Photo"
              id="btn-lightbox-prev"
            >
              ❮
            </button>
            <button
              onClick={() => setLightboxIndex((lightboxIndex + 1) % photos.length)}
              className="p-2 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 text-white hover:scale-105 pointer-events-auto transition cursor-pointer"
              title="Next Photo"
              id="btn-lightbox-next"
            >
              ❯
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
