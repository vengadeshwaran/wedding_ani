import React from "react";
import { Heart, Calendar, ArrowRight, BookOpen } from "lucide-react";
import { LoveEvent } from "../types";

interface TimelineProps {
  events: LoveEvent[];
}

export default function LoveTimeline({ events }: TimelineProps) {
  // Sort events by order
  const sortedEvents = [...events].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="relative py-8" id="love-timeline-container">
      {/* Central Timeline Connection Rope */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-[#5d4037]/35 transform md:-translate-x-1/2 z-0" />

      {/* Events Loop */}
      <div className="space-y-12 md:space-y-16 relative z-10">
        {sortedEvents.map((ev, idx) => {
          const isLeft = idx % 2 === 0;

          return (
            <div
              key={ev.id}
              className={`flex flex-col md:flex-row items-start md:items-center ${
                isLeft ? "md:flex-row" : "md:flex-row-reverse"
              } w-full text-zinc-800`}
              id={`timeline-row-${ev.id}`}
            >
              {/* Event Content card panel */}
              <div className="w-full md:w-[46%] pl-10 md:pl-0">
                <div className="bg-[#fcf8f2] p-5 sm:p-6 rounded-2xl border border-[#5d4037]/15 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden">
                  
                  {/* Highlight Ribbon line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#e7aeb2] to-[#d98880]" />

                  {/* Date badge */}
                  <div className="flex items-center space-x-1.5 text-xs font-mono text-[#d98880] mb-2 pt-1">
                    <Calendar size={12} />
                    <span>{ev.eventDate}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#2c1a11] mb-3 group-hover:text-[#d98880] transition">
                    {ev.title}
                  </h3>

                  {/* Flex display: text + side thumbnail image */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {ev.imageUrl && (
                      <div className="w-full sm:w-1/3 aspect-video sm:aspect-square rounded-xl overflow-hidden shadow-sm relative bg-[#1e1008] shrink-0 border border-[#5d4037]/10">
                        <img
                          src={ev.imageUrl}
                          alt={ev.title}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-orange-900/5 pointer-events-none" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-sans text-xs sm:text-sm text-[#4a3b32]/95 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                  </div>

                  {/* Visual Retro Frame Stamps */}
                  <div className="absolute bottom-2 right-2.5 opacity-10 group-hover:opacity-30 transition duration-300">
                    <BookOpen size={30} className="text-[#5d4037]" />
                  </div>
                </div>
              </div>

              {/* Central Pivoting Heart Stamp Node */}
              <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center z-20">
                <div className="w-9 h-9 rounded-full bg-[#fcf8f2] border-2 border-[#5d4037] flex items-center justify-center shadow-md transform hover:scale-110 active:scale-95 transition cursor-pointer">
                  <Heart
                    size={15}
                    className="text-[#d98880]"
                    fill={idx < 4 ? "#d98880" : "none"}
                  />
                </div>
              </div>

              {/* Offset space-filling node (Hidden on mobile) */}
              <div className="hidden md:block w-[46%]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
