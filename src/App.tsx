import React, { useState, useEffect } from "react";
import { Heart, Calendar, Clock, Image as ImageIcon, BookOpen, Settings, Play, Pause, ChevronRight, Lock, MessageCircle } from "lucide-react";
import BackgroundParticles from "./components/BackgroundParticles";
import RetroCassettePlayer from "./components/RetroCassettePlayer";
import PolaroidGallery from "./components/PolaroidGallery";
import LoveTimeline from "./components/LoveTimeline";
import EnvelopeLetter from "./components/EnvelopeLetter";
import MemoryWall from "./components/MemoryWall";
import AdminPanel from "./components/AdminPanel";
import { CoupleSettings, Song, Photo, LoveEvent, Letter, MemoryNote } from "./types";

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState<"home" | "gallery" | "story" | "admin">("home");

  // Dynamic state loaded from Express database
  const [settings, setSettings] = useState<CoupleSettings>({
    husbandName: "வெங்கடேஸ்வரன்",
    wifeName: "Sae-byeok",
    anniversaryDate: "2022-09-18",
    weddingTitle: "Our Memory Tape",
    vintageTexture: true,
    ambientSoundUrl: ""
  });
  const [songs, setSongs] = useState<Song[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [events, setEvents] = useState<LoveEvent[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [notes, setNotes] = useState<MemoryNote[]>([]);

  // Sound track playing states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  // Admin access states
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Countdown clock tickers
  const [daysTogether, setDaysTogether] = useState<number>(0);
  const [anniversaryCountdown, setAnniversaryCountdown] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
    nextAnnivYear: 2026,
  });

  // Load server-side configurations
  const loadFullData = async () => {
    try {
      const res = await fetch("/api/full-data");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setSongs(data.songs);
        setPhotos(data.photos);
        setEvents(data.events);
        setLetters(data.letters);
        setNotes(data.notes);

        // Find the index of default song
        const defaultIdx = data.songs.findIndex((s: Song) => s.isDefault);
        if (defaultIdx !== -1) {
          setCurrentSongIndex(defaultIdx);
        }
      }
    } catch (err) {
      console.warn("Failed to query full dynamic state, loading safe pre-seeded structures.");
    }
  };

  useEffect(() => {
    loadFullData();

    // Check for previous active admin session in local storage
    const cachedToken = localStorage.getItem("retro_admin_key");
    if (cachedToken) {
      setAdminToken(cachedToken);
    }
  }, []);

  // Countdown calculating loop
  useEffect(() => {
    const calcTimer = () => {
      const now = new Date();
      const weddingDate = new Date(settings.anniversaryDate);
      
      // 1. Calculate DAYS together (since Wedding Day)
      const diffMs = now.getTime() - weddingDate.getTime();
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      setDaysTogether(days > 0 ? days : 0);

      // 2. Calculate dynamic COUNTDOWN to next anniversary date
      const month = weddingDate.getMonth();
      const date = weddingDate.getDate();

      let nextAnniv = new Date(now.getFullYear(), month, date);
      if (now.getTime() > nextAnniv.getTime()) {
        // If current date has passed anniversary month/day this year, target next year
        nextAnniv = new Date(now.getFullYear() + 1, month, date);
      }

      const totalSecsLeft = Math.floor((nextAnniv.getTime() - now.getTime()) / 1000);
      
      if (totalSecsLeft > 0) {
        setAnniversaryCountdown({
          days: Math.floor(totalSecsLeft / (3600 * 24)),
          hours: Math.floor((totalSecsLeft % (3600 * 24)) / 3600),
          mins: Math.floor((totalSecsLeft % 3600) / 60),
          secs: totalSecsLeft % 60,
          nextAnnivYear: nextAnniv.getFullYear(),
        });
      } else {
        setAnniversaryCountdown({ days: 0, hours: 0, mins: 0, secs: 0, nextAnnivYear: now.getFullYear() });
      }
    };

    calcTimer();
    const interval = setInterval(calcTimer, 1000);
    return () => clearInterval(interval);
  }, [settings.anniversaryDate]);

  // ==========================================
  // Client Actions & APIs Interceptors
  // ==========================================

  const handleAdminLogin = async (password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const data = await res.json();
      setAdminToken(data.token);
      localStorage.setItem("retro_admin_key", data.token);
    } else {
      const errData = await res.json();
      throw new Error(errData.error || "Incorrect Passkey");
    }
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem("retro_admin_key");
    fetch("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  };

  const handleUpdateSettings = async (data: Partial<CoupleSettings> & { newPassword?: string }) => {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const updated = await res.json();
      setSettings(updated.settings);
    } else {
      const err = await res.json();
      throw new Error(err.error || "Could not save configuration.");
    }
  };

  const handleAddSong = async (songData: Omit<Song, "id">) => {
    const res = await fetch("/api/songs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(songData),
    });

    if (res.ok) {
      await loadFullData();
    } else {
      const err = await res.json();
      throw new Error(err.error || "Failed to append song.");
    }
  };

  const handleDeleteSong = async (id: string) => {
    const res = await fetch(`/api/songs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (res.ok) {
      await loadFullData();
    }
  };

  const handleAddPhoto = async (photoData: Omit<Photo, "id">) => {
    const res = await fetch("/api/photos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(photoData),
    });

    if (res.ok) {
      await loadFullData();
    } else {
      const err = await res.json();
      throw new Error(err.error || "Failed to save photo.");
    }
  };

  const handleDeletePhoto = async (id: string) => {
    const res = await fetch(`/api/photos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (res.ok) {
      await loadFullData();
    }
  };

  const handleAddEvent = async (eventData: Omit<LoveEvent, "id">) => {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(eventData),
    });

    if (res.ok) {
      await loadFullData();
    } else {
      const err = await res.json();
      throw new Error(err.error || "Failed to append milestone.");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const res = await fetch(`/api/events/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (res.ok) {
      await loadFullData();
    }
  };

  const handleAddLetter = async (letterData: Omit<Letter, "id">) => {
    const res = await fetch("/api/letters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(letterData),
    });

    if (res.ok) {
      await loadFullData();
    } else {
      const err = await res.json();
      throw new Error(err.error || "Failed to add letter.");
    }
  };

  const handleDeleteLetter = async (id: string) => {
    const res = await fetch(`/api/letters/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (res.ok) {
      await loadFullData();
    }
  };

  const handleAddNote = async (author: string, content: string, color: string) => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, content, color }),
    });

    if (res.ok) {
      await loadFullData();
    } else {
      const err = await res.json();
      throw new Error(err.error || "Failed to submit sticky note.");
    }
  };

  const handleDeleteNote = async (id: string) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (res.ok) {
      await loadFullData();
    }
  };

  return (
    <div className="relative min-h-screen paper-texture pb-20 select-text bg-[#FDFBF7] text-[#5D4037] overflow-x-hidden" id="app-root-frame">
      {/* Intro Splash Overlay */}
      {showIntro && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#3D3A35] cursor-pointer"
          onClick={() => {
            setShowIntro(false);
            setIsPlaying(true);
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/60 pointer-events-none" />
          <div className="relative z-10 text-center space-y-6 px-8 max-w-md">
            <div className="text-5xl animate-pulse">♥</div>
            <h1 className="font-serif font-light text-4xl sm:text-5xl italic text-[#F5E1E1] tracking-tight leading-tight">
              {settings.husbandName} & {settings.wifeName}
            </h1>
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-[#8C9476] font-semibold">
              {settings.weddingTitle}
            </p>
            <div className="w-16 h-px bg-[#8C9476] mx-auto" />
            <p className="font-serif italic text-[#FDFBF7]/70 text-sm leading-relaxed">
              Press play to begin our love story...
            </p>
            <div className="mt-4 inline-flex items-center gap-3 bg-[#5D4037] text-[#FDFBF7] px-8 py-3 rounded-full font-sans text-xs uppercase tracking-[0.2em] font-semibold shadow-lg hover:bg-[#5D4037]/80 transition-all">
              <Play size={14} fill="currentColor" />
              Enter
            </div>
            <p className="text-[10px] font-mono text-[#FDFBF7]/30 mt-2">Tap anywhere to continue</p>
          </div>
        </div>
      )}
      {/* 1. Conditionally Render Overlaid Film Grain Scanlines */}
      {settings.vintageTexture && <div className="film-grain opacity-[0.03]" />}

      {/* Background Floral Accents (Immersive UI Style) */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#F5E1E1] opacity-[0.25] blur-3xl pointer-events-none"></div>
      <div className="absolute -top-10 right-20 w-60 h-60 rounded-full bg-[#8C9476] opacity-[0.15] blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-[#D9D1C1] opacity-[0.1] blur-3xl pointer-events-none"></div>

      {/* 2. Floating Heart Particles Background */}
      <BackgroundParticles active={true} />

      {/* Top Navigation & Title Header Visual Bar */}
      <header className="relative z-10 w-full flex flex-col md:flex-row justify-between items-center px-6 sm:px-12 py-8 max-w-6xl mx-auto gap-6 border-b border-[#D9D1C1]/30">
        <div className="space-y-1 text-center md:text-left select-none">
          <h1 className="font-serif font-light text-4xl sm:text-5xl tracking-tight text-[#5D4037] opacity-90 italic">
            {settings.husbandName} & {settings.wifeName}
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] font-sans text-[#8C9476] font-semibold pt-0.5">
            {settings.weddingTitle} • {settings.anniversaryDate}
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-4 sm:gap-8 bg-[#D9D1C1]/15 px-6 py-2.5 rounded-full border border-[#D9D1C1]/30 backdrop-blur-sm select-none">
          <button
            onClick={() => setActiveTab("home")}
            className={`text-xs uppercase tracking-[0.2em] font-sans pb-0.5 transition-all cursor-pointer ${
              activeTab === "home" ? "border-b-2 border-[#5D4037] text-[#5D4037] font-semibold" : "text-[#5D4037]/50 hover:text-[#5D4037]"
            }`}
            id="nav-btn-home"
          >
            Memories
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`text-xs uppercase tracking-[0.2em] font-sans pb-0.5 transition-all cursor-pointer ${
              activeTab === "gallery" ? "border-b-2 border-[#5D4037] text-[#5D4037] font-semibold" : "text-[#5D4037]/50 hover:text-[#5D4037]"
            }`}
            id="nav-btn-gallery"
          >
            Polaroids
          </button>
          <button
            onClick={() => setActiveTab("story")}
            className={`text-xs uppercase tracking-[0.2em] font-sans pb-0.5 transition-all cursor-pointer ${
              activeTab === "story" ? "border-b-2 border-[#5D4037] text-[#5D4037] font-semibold" : "text-[#5D4037]/50 hover:text-[#5D4037]"
            }`}
            id="nav-btn-story"
          >
            Letters & Timeline
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`text-xs uppercase tracking-[0.2em] font-sans pb-0.5 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "admin" ? "border-b-2 border-[#5D4037] text-[#5D4037] font-semibold" : "text-[#5D4037]/50 hover:text-[#5D4037]"
            }`}
            id="nav-btn-admin"
          >
            <Lock size={11} />
            Admin
          </button>
        </nav>
      </header>

      {/* CORE DISPLAY WALL BLOCK */}
      <main className="relative z-10 max-w-5xl mx-auto mt-10 px-4">
        
        {/* ==========================================
            TAB 1: HOME PANEL COVER TAPE
            ========================================== */}
        {activeTab === "home" && (
          <div className="space-y-14 animate-fade-in" id="home-pane">
            
            {/* HERO SECTION STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              
              {/* Box A: Positive Days Counter */}
              <div className="bg-[#FEFEFE] rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-[#D9D1C1]/50 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#8C9476]" />
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-[#8C9476] text-xs font-sans tracking-[0.2em] uppercase font-bold">
                    <Clock size={13} />
                    <span>TIMELINE RECORD SHEET</span>
                  </div>
                  <h3 className="font-serif font-light text-2xl text-[#5D4037] opacity-90 italic">Days of Shared Love</h3>
                  <p className="text-[#5D4037]/70 font-sans text-xs leading-relaxed font-light">
                    The beautiful chronicle of the paths we have walked together, recorded frame by frame, heartbeat by heartbeat.
                  </p>
                </div>

                <div className="my-8 flex items-baseline space-x-2.5 justify-center">
                  <span className="font-serif font-black text-6xl text-[#5D4037] tracking-tight animate-pulse">
                    {daysTogether}
                  </span>
                  <span className="font-serif italic font-medium text-lg text-[#8C9476]">Days Together</span>
                </div>

                <div className="text-[10px] font-mono text-[#8C9476]/80 text-center border-t border-dashed border-[#D9D1C1] pt-4 select-none">
                  Since Vows Exchange • {settings.anniversaryDate}
                </div>
              </div>

              {/* Box B: Upcoming Next Anniversary Countdown */}
              <div className="relative bg-[#3D3A35] text-[#FDFBF7] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl border border-[#2A2824]/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/45 pointer-events-none" />
                
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center space-x-2 text-[#F5E1E1] text-xs font-sans tracking-[0.2em] uppercase font-bold">
                    <Calendar size={13} />
                    <span>NEXT ANNIVERSARY LEDGER</span>
                  </div>
                  <h3 className="font-serif font-light text-2xl italic text-[#FDFBF7]/90">Countdown to the Vow Remake</h3>
                  <p className="text-[#FDFBF7]/70 font-sans text-xs leading-relaxed font-light">
                    Time is whispering towards our next celebration year. Anticipating sweet cherry blossoms to fall again together.
                  </p>
                </div>

                {/* Countdown Dial Grid */}
                <div className="relative z-10 my-8 grid grid-cols-4 gap-3.5 text-center select-none max-w-sm mx-auto w-full">
                  <div className="bg-[#5D4037]/40 p-3.5 rounded-xl border border-[#FDFBF7]/10 flex flex-col justify-center">
                    <span className="block font-serif font-bold text-2xl sm:text-3xl text-[#F5E1E1]">{anniversaryCountdown.days}</span>
                    <span className="text-[8px] uppercase tracking-wider text-[#FDFBF7]/60 mt-1 block font-sans">Days</span>
                  </div>
                  <div className="bg-[#5D4037]/40 p-3.5 rounded-xl border border-[#FDFBF7]/10 flex flex-col justify-center">
                    <span className="block font-serif font-bold text-2xl sm:text-3xl text-[#F5E1E1]">{anniversaryCountdown.hours}</span>
                    <span className="text-[8px] uppercase tracking-wider text-[#FDFBF7]/60 mt-1 block font-sans">Hrs</span>
                  </div>
                  <div className="bg-[#5D4037]/40 p-3.5 rounded-xl border border-[#FDFBF7]/10 flex flex-col justify-center">
                    <span className="block font-serif font-bold text-2xl sm:text-3xl text-[#F5E1E1]">{anniversaryCountdown.mins}</span>
                    <span className="text-[8px] uppercase tracking-wider text-[#FDFBF7]/60 mt-1 block font-sans">Mins</span>
                  </div>
                  <div className="bg-[#5D4037]/40 p-3.5 rounded-xl border border-[#FDFBF7]/10 flex flex-col justify-center">
                    <span className="block font-serif font-bold text-2xl sm:text-3xl text-[#F5E1E1]">{anniversaryCountdown.secs}</span>
                    <span className="text-[8px] uppercase tracking-wider text-[#FDFBF7]/60 mt-1 block font-sans">Secs</span>
                  </div>
                </div>

                <div className="relative z-10 text-[10px] font-mono text-[#F5E1E1]/70 text-center border-t border-dashed border-[#5D4037] pt-4">
                  REMARK DATE: SEPTEMBER 18, {anniversaryCountdown.nextAnnivYear}
                </div>
              </div>

            </div>

            {/* RETRO CASSETTE SOUNDTRACK WORKSPACE */}
            <div className="space-y-4">
              <div className="text-center space-y-1.5 max-w-md mx-auto">
                <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#8C9476] font-bold">
                  ● THE SOUNDS OF MEMORY
                </span>
                <h3 className="font-serif font-light text-2xl text-[#5D4037] italic">Play Our Vintage Tape</h3>
                <p className="font-sans text-xs text-[#5D4037]/70 max-w-sm mx-auto leading-relaxed font-light">
                  Turn up the cassette volume and listen to the sweet background acoustic melodies curated directly for our anniversary years.
                </p>
              </div>

              {songs.length > 0 ? (
                <RetroCassettePlayer
                  songs={songs}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  currentSongIndex={currentSongIndex}
                  setCurrentSongIndex={setCurrentSongIndex}
                />
              ) : (
                <div className="text-center p-8 bg-[#3D3A35] text-[#FDFBF7] rounded-3xl max-w-lg mx-auto">
                  <p className="font-serif italic opacity-60">Seeding acoustic player tracks...</p>
                </div>
              )}
            </div>

            {/* LOVE STORY PREVIEW BLOCK */}
            <div className="max-w-3xl mx-auto bg-[#FEFEFE] rounded-2xl p-6 sm:p-8 space-y-6 text-[#5D4037] border border-[#D9D1C1]/50 shadow-md">
              <div className="flex justify-between items-start border-b border-[#D9D1C1]/30 pb-4">
                <div className="space-y-1">
                  <h3 className="font-serif font-light text-xl italic">The Plot Summary (우리들의 시놉시스)</h3>
                  <p className="font-sans text-xs text-[#5D4037]/60">Every classic story begins in a simple record store...</p>
                </div>
                <button
                  onClick={() => setActiveTab("story")}
                  className="flex items-center space-x-1 text-xs text-[#8C9476] hover:text-[#5D4037] font-semibold cursor-pointer transition pt-1"
                  id="btn-discover-story"
                >
                  <span>Explore Chronicles</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                <div className="aspect-video sm:aspect-square rounded-xl overflow-hidden shadow-sm relative bg-neutral-900 border border-[#D9D1C1]/30">
                  <img
                    src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=400"
                    alt="film plot representation"
                    className="w-full h-full object-cover grayscale-[15%] sepia-[10%] opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-[#F5E1E1]/10 pointer-events-none" />
                </div>
                <div className="sm:col-span-2 space-y-3">
                  <h4 className="font-serif italic font-bold text-base leading-snug">"Two heartbeats matching the rotation of retro vinyl records..."</h4>
                  <p className="font-sans text-xs sm:text-sm text-[#5D4037]/80 leading-relaxed font-light">
                    We met by serendipity. We fell in love slowly, frame by frame, like vintage film rolls developed under a warm amber lamp. 
                    From walking endlessly under falling blossoms in Ikseon-dong to locking vows on our wedding pavilion, we promise to listen to this custom cassette loop for the rest of our days.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            TAB 2: POLAROID GALLERY VIEW
            ========================================== */}
        {activeTab === "gallery" && (
          <div className="space-y-8 animate-fade-in" id="gallery-pane">
            <div className="text-center space-y-1.5 max-w-xl mx-auto">
              <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#8C9476] font-bold">
                ● POLAROID RETRO ALBUM
              </span>
              <h2 className="font-serif font-light text-3xl italic text-[#5D4037]">Korean Polaroid Photo gallery</h2>
              <p className="font-sans text-xs text-[#5D4037]/70 leading-normal max-w-md mx-auto font-light">
                Beautiful cinematic moments captured in authentic Polaroid style frames. Browse through the happy seasons of our lives. Left clicks launch the slider projection!
              </p>
            </div>

            {photos.length > 0 ? (
              <PolaroidGallery photos={photos} />
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl max-w-xl mx-auto border border-[#efe3d3] p-10">
                <p className="font-serif italic text-zinc-400">Loading photographs from active database...</p>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 3: STORY & LETTERS & NOTES VIEW
            ========================================== */}
        {activeTab === "story" && (
          <div className="space-y-16 animate-fade-in" id="story-pane">
            {/* Story Timeline */}
            <div className="space-y-8">
              <div className="text-center space-y-1.5 max-w-xl mx-auto">
                <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#8C9476] font-bold">
                  ● LOVE TIMELINE JOURNAL
                </span>
                <h2 className="font-serif font-light text-3xl italic text-[#5D4037]">Chronology of Our Vows</h2>
                <p className="font-sans text-xs text-[#5D4037]/70 leading-normal max-w-md mx-auto font-light">
                  A beautiful record of our shared history. Follow the romantic connectors to explore our milestones—from the first record store gaze to future dream houses.
                </p>
              </div>

              {events.length > 0 ? (
                <LoveTimeline events={events} />
              ) : (
                <div className="text-center py-10">
                  <p className="font-serif italic text-zinc-400">Seeding timeline milestones...</p>
                </div>
              )}
            </div>

            {/* Love Letters Box */}
            <div className="space-y-8 border-t border-[#5d4037]/10 pt-16">
              <div className="text-center space-y-1.5 max-w-xl mx-auto">
                <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#8C9476] font-bold">
                  ● THE HANDWRITTEN POST BOX
                </span>
                <h2 className="font-serif font-light text-3xl italic text-[#5D4037]">Unseal Romantic Letters</h2>
                <p className="font-sans text-xs text-[#5D4037]/70 leading-normal max-w-md mx-auto font-light">
                  Tap to unseal wax envelopes and discover handwritten promises made in deep affection on our milestone days.
                </p>
              </div>

              {letters.length > 0 ? (
                <EnvelopeLetter letters={letters} />
              ) : (
                <div className="text-center py-10">
                  <p className="font-serif italic text-zinc-400">Seeding wax envelope letters...</p>
                </div>
              )}
            </div>

            {/* Sticky Memo Wall */}
            <div className="space-y-8 border-t border-[#5d4037]/10 pt-16">
              <div className="text-center space-y-1.5 max-w-xl mx-auto">
                <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#8C9476] font-bold">
                  ● THE WEDDING MESSAGE WALL
                </span>
                <h2 className="font-serif font-light text-3xl italic text-[#5D4037]">Anniversary Prayers Memo Wall</h2>
                <p className="font-sans text-xs text-[#5D4037]/70 leading-normal max-w-md mx-auto font-light">
                  We look forward to reading your precious notes. Write a lovely prayer, cute wish, or retro quote on the sticky memo board below!
                </p>
              </div>

              <MemoryWall
                notes={notes}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                isAdmin={!!adminToken}
              />
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: ADMIN DASHBOARD PROTECTED
            ========================================== */}
        {activeTab === "admin" && (
          <div className="animate-fade-in" id="admin-pane">
            <AdminPanel
              settings={settings}
              songs={songs}
              photos={photos}
              events={events}
              letters={letters}
              notes={notes}
              token={adminToken}
              onLogin={handleAdminLogin}
              onLogout={handleAdminLogout}
              onUpdateSettings={handleUpdateSettings}
              onAddSong={handleAddSong}
              onEditSong={async () => {}} // Simple list reloading triggers for simplification
              onDeleteSong={handleDeleteSong}
              onAddPhoto={handleAddPhoto}
              onDeletePhoto={handleDeletePhoto}
              onAddEvent={handleAddEvent}
              onEditEvent={async () => {}}
              onDeleteEvent={handleDeleteEvent}
              onAddLetter={handleAddLetter}
              onEditLetter={async () => {}}
              onDeleteLetter={handleDeleteLetter}
            />
          </div>
        )}

      </main>

      {/* FOOTER BLOCK LABEL */}
      <footer className="mt-24 text-center text-[10px] font-mono text-zinc-400 select-none border-t border-zinc-200 py-8 space-y-1.5 max-w-md mx-auto relative z-10 text-center">
        <p>© 2026 {settings.husbandName} ♥ {settings.wifeName} • Anniversary Tape</p>
        <p className="italic">Retro-engineered with love & K-drama memories in continuous playback.</p>
      </footer>
    </div>
  );
}
