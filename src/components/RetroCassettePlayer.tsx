import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, Music, Volume2, RotateCcw } from "lucide-react";
import { Song } from "../types";

interface PlayerProps {
  songs: Song[];
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentSongIndex: number;
  setCurrentSongIndex: (index: number) => void;
}

export default function RetroCassettePlayer({
  songs,
  isPlaying,
  setIsPlaying,
  currentSongIndex,
  setCurrentSongIndex,
}: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [vuLevels, setVuLevels] = useState<number[]>([15, 30, 45, 20, 10, 60, 40]);

  const activeSong = songs[currentSongIndex] || null;

  // Handle music changes
  useEffect(() => {
    if (audioRef.current && activeSong) {
      audioRef.current.src = activeSong.audioUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn("Autoplay block or audio error:", err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentSongIndex, activeSong]);

  // Handle Play/Pause side-effects
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn("Playback failed:", err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // VU Meter effect when playing
  useEffect(() => {
    let animationFrameId: number;
    const updateVu = () => {
      if (isPlaying) {
        setVuLevels(Array.from({ length: 7 }, () => Math.floor(10 + Math.random() * 85)));
      } else {
        setVuLevels((prev) => prev.map((l) => Math.max(5, l - 5)));
      }
      animationFrameId = requestAnimationFrame(updateVu);
    };
    updateVu();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const onAudioEnded = () => {
    handleNext();
  };

  const handlePlayPause = () => {
    if (songs.length === 0) return;
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (songs.length === 0) return;
    setCurrentSongIndex((currentSongIndex + 1) % songs.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (songs.length === 0) return;
    setCurrentSongIndex((currentSongIndex - 1 + songs.length) % songs.length);
    setIsPlaying(true);
  };

  const handleProgressBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div id="retro-player" className="w-full max-w-xl mx-auto rounded-3xl p-6 bg-[#D9D1C1] text-[#5D4037] shadow-xl relative border-t-4 border-[#C7BEAB] box-border overflow-hidden">
      {/* Background Decorative Film Scanlines */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none z-0" />

      {/* Embedded Hidden HTML5 Audio */}
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onAudioEnded}
      />

      {/* Cassette Deco Header */}
      <div className="relative z-10 flex justify-between items-center mb-4 border-b border-[#5D4037]/20 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="font-sans text-[10px] uppercase tracking-[0.15em] text-[#8C9476] font-bold">
            ● MEMORY TAPE RECORDER
          </span>
        </div>
        <span className="font-serif italic text-xs text-[#5D4037]/75">추억 플레이어</span>
      </div>

      {/* THE CASSETTE SHELL */}
      <div className="relative z-10 w-full aspect-[1.58] bg-[#3D3A35] rounded-xl p-5 text-[#FDFBF7] shadow-inner border border-white/5 flex flex-col justify-between">
        
        {/* Cassette Label Strip */}
        <div className="relative bg-[#F5E1E1] text-[#5D4037] px-4 py-2 rounded-md border-b-4 border-neutral-700/10 text-center shadow-inner">
          <div className="font-sans text-[9px] uppercase tracking-[0.1em] text-[#8C9476] font-bold mb-0.5 flex justify-between">
            <span>SIDE A</span>
            <span>STEREO C-90</span>
          </div>
          <h4 className="font-serif italic font-medium text-base line-clamp-1 text-[#5D4037] tracking-tight">
            {activeSong ? activeSong.title : "No tape inserted"}
          </h4>
          <p className="font-sans text-[10px] tracking-wide text-[#5D4037]/70 font-medium truncate mt-0.5">
            {activeSong ? `Artist: ${activeSong.artist}` : "-"}
          </p>
        </div>

        {/* Cassette Window (Tape Spindle Hole Center) */}
        <div className="h-16 w-3/4 mx-auto bg-[#1a0e08] rounded-xl border-t-2 border-zinc-950 px-6 py-2 flex items-center justify-between relative shadow-inner overflow-hidden">
          
          {/* Virtual Film Strip Roll backdrop */}
          <div className={`absolute top-0 bottom-0 left-12 right-12 bg-amber-950/15 transition-opacity ${isPlaying ? "opacity-30" : "opacity-15"}`} />

          {/* Left Cog */}
          <div className="flex flex-col items-center justify-center">
            <div
              className={`w-11 h-11 rounded-full border-[5px] border-dashed border-[#5D4037] flex items-center justify-center bg-[#2A2824] transition-transform duration-100 ease-linear`}
              style={{
                transform: isPlaying ? `rotate(${currentTime * 75}deg)` : `rotate(12deg)`
              }}
            >
              <div className="w-4 h-4 rounded-full bg-[#1a0e08] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D9D1C1]" />
              </div>
            </div>
            <span className="font-mono text-[8px] text-[#fcf8f2]/40 mt-1">L</span>
          </div>

          {/* Centre Tape Window Indicator */}
          <div className="h-10 flex-1 mx-2 bg-[#000]/60 rounded-md border border-neutral-800 flex flex-col justify-around px-2 items-center">
            <div className="w-full flex justify-between font-mono text-[7px] text-[#8C9476]">
              <span>TAPE</span>
              <span>INDEX</span>
            </div>
            <div className="w-full flex space-x-1.5 justify-center items-end h-5 z-20">
              {vuLevels.map((val, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#8C9476] rounded-t-sm transition-all duration-75"
                  style={{ height: `${val}%`, backgroundColor: i % 2 === 0 ? "#FDFBF7" : "#8C9476" }}
                />
              ))}
            </div>
          </div>

          {/* Right Cog */}
          <div className="flex flex-col items-center justify-center">
            <div
              className={`w-11 h-11 rounded-full border-[5px] border-dashed border-[#5D4037] flex items-center justify-center bg-[#2A2824] transition-transform duration-100 ease-linear`}
              style={{
                transform: isPlaying ? `rotate(${currentTime * 75}deg)` : `rotate(120deg)`
              }}
            >
              <div className="w-4 h-4 rounded-full bg-[#1a0e08] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D9D1C1]" />
              </div>
            </div>
            <span className="font-mono text-[8px] text-[#fcf8f2]/40 mt-1">R</span>
          </div>
        </div>

        {/* Cassette Footer Marks */}
        <div className="flex justify-between items-center text-[9px] font-mono text-[#FDFBF7]/40 px-2 leading-none border-t border-white/5 pt-1.5">
          <span>Dolby System B/C NR</span>
          <span>MADE IN KOREA 1992</span>
        </div>
      </div>

      {/* AUDIO PROGRESS & CONTROLS */}
      <div className="relative z-10 mt-6 flex flex-col space-y-4">
        {/* Progress Bar & Durations */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-[#5D4037]/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleProgressBarChange}
            className="w-full h-1 bg-[#5D4037]/20 rounded-lg appearance-none cursor-pointer accent-[#8C9476]"
          />
        </div>

        {/* Button Controls */}
        <div className="flex justify-between items-center pt-2">
          {/* Left Vol */}
          <div className="flex items-center space-x-1.5 w-1/4">
            <Volume2 size={14} className="text-[#8C9476]" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-[#5D4037]/20 rounded-lg appearance-none cursor-pointer accent-[#8C9476] md:w-20"
            />
          </div>

          {/* Central Physical Deck Controls Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrev}
              disabled={songs.length <= 1}
              className="p-2.5 rounded-full bg-[#C7BEAB] hover:bg-[#C7BEAB]/80 text-[#5D4037] transition shadow-inner cursor-pointer"
              title="Previous Song"
              id="btn-prev-song"
            >
              <SkipBack size={16} />
            </button>

            <button
              onClick={handlePlayPause}
              className="p-3.5 rounded-full bg-[#5D4037] hover:bg-[#5D4037]/90 text-[#FDFBF7] transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center font-bold shadow-lg cursor-pointer"
              title={isPlaying ? "Pause" : "Play Tape"}
              id="btn-play-pause"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-0.5" fill="currentColor" />}
            </button>

            <button
              onClick={handleNext}
              disabled={songs.length <= 1}
              className="p-2.5 rounded-full bg-[#C7BEAB] hover:bg-[#C7BEAB]/80 text-[#5D4037] transition shadow-inner cursor-pointer"
              title="Next Song"
              id="btn-next-song"
            >
              <SkipForward size={16} />
            </button>
          </div>

          {/* Right Playlist Auto indicator */}
          <div className="w-1/4 flex justify-end">
            <div className="flex items-center space-x-1 border border-[#C7BEAB] bg-[#FEFEFE] px-2 py-1 rounded text-[10px] font-sans text-[#8C9476] font-semibold">
              <Music size={11} className="animate-bounce" />
              <span>{songs.length} Tapes</span>
            </div>
          </div>
        </div>

        {/* Dynamic playlist switcher */}
        <div className="bg-[#3D3A35] rounded-xl p-3 border border-[#C7BEAB]/20 text-xs text-[#FDFBF7]">
          <p className="font-sans text-[10px] uppercase tracking-[0.1em] text-[#8C9476] mb-2 flex items-center gap-1.5 border-b border-white/5 pb-1.5 font-bold">
            <Volume2 size={11} />
            <span>Select Tape Track</span>
          </p>
          <div className="space-y-1.5 max-h-24 overflow-y-auto">
            {songs.map((song, idx) => (
              <button
                key={song.id}
                onClick={() => {
                  setCurrentSongIndex(idx);
                  setIsPlaying(true);
                }}
                className={`w-full text-left px-2 sm:px-3 py-1.5 rounded flex items-center justify-between font-sans transition ${
                  idx === currentSongIndex
                    ? "bg-[#8C9476]/20 text-[#8C9476] border-l-2 border-[#8C9476] font-semibold"
                    : "text-[#FDFBF7]/60 hover:bg-white/5"
                }`}
                id={`btn-select-song-${idx}`}
              >
                <span className="truncate pr-2">
                  {idx + 1}. {song.title} <span className="text-[10px] opacity-60">by {song.artist}</span>
                </span>
                {idx === currentSongIndex && isPlaying && (
                  <span className="text-[9px] uppercase font-sans tracking-wide animate-pulse font-bold text-[#8C9476]">
                    ● SPINNING
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
