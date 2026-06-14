import React, { useState } from "react";
import { Mail, MailOpen, Calendar, Heart, ShieldAlert, ArrowLeft, Stamp } from "lucide-react";
import { Letter } from "../types";

interface LetterProps {
  letters: Letter[];
}

export default function EnvelopeLetter({ letters }: LetterProps) {
  const [openedLetterId, setOpenedLetterId] = useState<string | null>(null);

  const activeLetter = letters.find((l) => l.id === openedLetterId) || null;

  return (
    <div id="envelope-letters-wrapper" className="space-y-12">
      {/* If any single letter is expanded, show the immersive romantic writer sheet view */}
      {activeLetter ? (
        <div className="max-w-2xl mx-auto bg-[#faf4ec] p-8 sm:p-12 rounded-3xl shadow-2xl relative border-4 border-[#efe3d3] paper-texture animate-fade-in text-[#2c1a11]" id="writer-sheet-view">
          {/* Top subtle card deco */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center border-b border-[#5d4037]/10 pb-2 mb-4">
            <button
              onClick={() => setOpenedLetterId(null)}
              className="flex items-center space-x-1.5 text-xs text-[#5d4037]/75 hover:text-[#5d4037] font-retro cursor-pointer transition"
              id="btn-close-letter"
            >
              <ArrowLeft size={14} />
              <span>Seal Back / 편지 밀봉하기</span>
            </button>
            <div className="text-right text-[10px] font-mono text-neutral-400">
              <Calendar size={10} className="inline mr-1" />
              <span>Written: {activeLetter.letterDate}</span>
            </div>
          </div>

          {/* Letter Body Sheet */}
          <div className="pt-6 space-y-6">
            {/* Header Stamp Detail */}
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#d98880] font-bold">
                  ● CONFIDENTIAL MEMORY
                </span>
                <h3 className="font-serif italic font-bold text-xl text-[#2c1a11] leading-tight pr-6">
                  {activeLetter.title}
                </h3>
              </div>
              <div className="w-12 h-14 bg-amber-100 border-2 border-[#5d4037]/20 p-1 flex flex-col justify-between items-center text-center opacity-70 shrink-0 transform rotate-6 select-none shadow-sm">
                <Heart size={12} className="text-[#d98880] mt-1" />
                <span className="font-mono text-[7px] font-semibold text-[#5d4037]">LOVE 1992</span>
              </div>
            </div>

            {/* Content paragraph list */}
            <div className="font-serif leading-loose text-base sm:text-lg text-zinc-800 space-y-6 text-justify px-1 whitespace-pre-wrap selection:bg-[#e7aeb2]/30">
              {activeLetter.content}
            </div>

            {/* Ending Stamp Seal signature */}
            <div className="flex justify-end pt-8 border-t border-dashed border-[#5d4037]/15">
              <div className="text-center flex flex-col items-center">
                <span className="font-serif italic text-xs text-[#5d4037]/75 pb-1">영원히 함께할 연인으로부터</span>
                <div className="w-11 h-11 rounded-full bg-red-100/65 flex items-center justify-center border-2 border-red-500/30 transform -rotate-12 select-none">
                  <span className="font-serif text-[10px] uppercase font-bold text-red-500 tracking-wider">
                    사랑의 인
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* GRID OF SEALED ENVELOPES */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {letters.map((letter) => (
            <div
              key={letter.id}
              onClick={() => setOpenedLetterId(letter.id)}
              className="bg-[#fcf8f2] rounded-2xl overflow-hidden shadow-lg border border-[#5d4037]/15 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 group cursor-poetic flex flex-col relative"
              id={`envelope-card-${letter.id}`}
            >
              {/* Envelope Flap visual background header */}
              <div className="relative aspect-video w-full overflow-hidden bg-[#2c1a11] shrink-0 border-b border-[#5d4037]/15 select-none text-[#fcf8f2]">
                <img
                  src={letter.coverImage || "https://images.unsplash.com/photo-1549417229-aa67d3263c09?q=80&w=650"}
                  alt={letter.title}
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual Envelope fold shadows inside stamp overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Simulated Postage Stamp */}
                <div className="absolute top-3 right-3 w-10 h-11 bg-white p-1 shadow-md border-b-2 border-zinc-300 rounded-sm flex flex-col justify-around items-center select-none transform rotate-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <Heart size={11} className="text-red-500" />
                  </div>
                  <span className="font-mono text-[6px] tracking-tight uppercase text-zinc-600">POSTAGE KOREA</span>
                </div>

                {/* Mail Box Indicator Label */}
                <div className="absolute bottom-3 left-4 flex items-center space-x-1.5">
                  <div className="p-1 rounded bg-[#e7aeb2]/80 text-[#2c1a11]">
                    <Mail size={12} />
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#e7aeb2]">
                    SEALED CARD
                  </span>
                </div>
              </div>

              {/* Envelope description and interactive button block */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                    <span>SEAL DATE: {letter.letterDate}</span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#2c1a11] leading-tight group-hover:text-[#d98880] transition line-clamp-1">
                    {letter.title}
                  </h4>
                  <p className="font-sans text-xs text-zinc-500 leading-normal line-clamp-3">
                    {letter.content}
                  </p>
                </div>

                <button
                  onClick={() => setOpenedLetterId(letter.id)}
                  className="w-full py-2.5 bg-[#f5ece1] hover:bg-[#5d4037] text-[#5d4037] hover:text-[#fcf8f2] font-retro text-xs rounded-xl border border-[#5d4037]/20 transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm active:scale-95 duration-100"
                  id={`btn-open-envelope-${letter.id}`}
                >
                  <MailOpen size={13} />
                  <span>Unseal Letter / 손편지 열어보기</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
