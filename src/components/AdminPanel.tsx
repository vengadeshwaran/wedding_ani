import React, { useState } from "react";
import { Key, Settings, Music, Camera, Calendar, Mail, Save, Plus, Trash2, Edit2, LogOut, LayoutGrid, Check, Eye } from "lucide-react";
import { CoupleSettings, Song, Photo, LoveEvent, Letter, MemoryNote } from "../types";

interface AdminProps {
  settings: CoupleSettings;
  songs: Song[];
  photos: Photo[];
  events: LoveEvent[];
  letters: Letter[];
  notes: MemoryNote[];
  token: string | null;
  onLogin: (password: string) => Promise<void>;
  onLogout: () => void;
  onUpdateSettings: (data: Partial<CoupleSettings> & { newPassword?: string }) => Promise<void>;
  onAddSong: (data: Omit<Song, "id">) => Promise<void>;
  onEditSong: (id: string, data: Partial<Song>) => Promise<void>;
  onDeleteSong: (id: string) => Promise<void>;
  onAddPhoto: (data: Omit<Photo, "id">) => Promise<void>;
  onDeletePhoto: (id: string) => Promise<void>;
  onAddEvent: (data: Omit<LoveEvent, "id">) => Promise<void>;
  onEditEvent: (id: string, data: Partial<LoveEvent>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  onAddLetter: (data: Omit<Letter, "id">) => Promise<void>;
  onEditLetter: (id: string, data: Partial<Letter>) => Promise<void>;
  onDeleteLetter: (id: string) => Promise<void>;
}

export default function AdminPanel({
  settings,
  songs,
  photos,
  events,
  letters,
  notes,
  token,
  onLogin,
  onLogout,
  onUpdateSettings,
  onAddSong,
  onEditSong,
  onDeleteSong,
  onAddPhoto,
  onDeletePhoto,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onAddLetter,
  onEditLetter,
  onDeleteLetter,
}: AdminProps) {
  // Login input
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active admin module tab
  const [activeTab, setActiveTab] = useState<"settings" | "songs" | "photos" | "events" | "letters">("settings");

  // Forms states
  const [settingsForm, setSettingsForm] = useState({
    husbandName: settings.husbandName,
    wifeName: settings.wifeName,
    anniversaryDate: settings.anniversaryDate,
    weddingTitle: settings.weddingTitle,
    vintageTexture: settings.vintageTexture,
    newPassword: "",
  });

  const [songForm, setSongForm] = useState({
    title: "",
    artist: "",
    audioUrl: "",
    coverImage: "",
    isDefault: false,
  });

  const [photoForm, setPhotoForm] = useState({
    imageUrl: "",
    category: "Engagement",
    caption: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    eventDate: new Date().toISOString().split("T")[0],
    description: "",
    imageUrl: "",
    displayOrder: events.length + 1,
  });

  const [letterForm, setLetterForm] = useState({
    title: "",
    letterDate: new Date().toISOString().split("T")[0],
    content: "",
    coverImage: "",
  });

  // Action status loading
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");

  // Support local Base64 upload
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        triggerStatus("File is too large! Maximum limit is 5MB.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoForm((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEventFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventForm((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerStatus = (msg: string, type: "success" | "error" = "success") => {
    setStatusMsg(msg);
    setStatusType(type);
    setTimeout(() => setStatusMsg(""), 5000);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      await onLogin(passwordInput);
      setPasswordInput("");
    } catch (err: any) {
      setLoginError(err.message || "Login failed. Incorrect key.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Safe Submit wrappers
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateSettings(settingsForm);
      setSettingsForm((prev) => ({ ...prev, newPassword: "" }));
      triggerStatus("Anniversary settings saved successfully!");
    } catch (err: any) {
      triggerStatus(err.message || "Failed to update settings", "error");
    }
  };

  const handleAddSongSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songForm.title || !songForm.artist || !songForm.audioUrl) {
      triggerStatus("Song title, artist, and Audio URL are required!", "error");
      return;
    }
    try {
      await onAddSong(songForm);
      setSongForm({ title: "", artist: "", audioUrl: "", coverImage: "", isDefault: false });
      triggerStatus("New cassette song loaded!");
    } catch (err: any) {
      triggerStatus(err.message || "Failed to add song", "error");
    }
  };

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoForm.imageUrl) {
      triggerStatus("Please select a photo file or input an image URL!", "error");
      return;
    }
    try {
      await onAddPhoto(photoForm);
      setPhotoForm({ imageUrl: "", category: "Engagement", caption: "", date: new Date().toISOString().split("T")[0] });
      triggerStatus("Polaroid photo pinned successfully!");
    } catch (err: any) {
      triggerStatus(err.message || "Failed to add photo", "error");
    }
  };

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.description) {
      triggerStatus("Event title and descriptions are required!", "error");
      return;
    }
    try {
      await onAddEvent(eventForm);
      setEventForm({ title: "", eventDate: new Date().toISOString().split("T")[0], description: "", imageUrl: "", displayOrder: events.length + 2 });
      triggerStatus("Love journey milestone added!");
    } catch (err: any) {
      triggerStatus(err.message || "Failed to create timeline milestone", "error");
    }
  };

  const handleAddLetterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterForm.title || !letterForm.content) {
      triggerStatus("Letter title and contents are required!", "error");
      return;
    }
    try {
      await onAddLetter(letterForm);
      setLetterForm({ title: "", letterDate: new Date().toISOString().split("T")[0], content: "", coverImage: "" });
      triggerStatus("Love handwritten letter folder catalogued!");
    } catch (err: any) {
      triggerStatus(err.message || "Failed to add letter", "error");
    }
  };

  // 1. LOGIN SCREEN VIEW (UNAUTHENTICATED)
  if (!token) {
    return (
      <div className="max-w-md mx-auto p-8 rounded-3xl bg-[#fcf8f2] border-4 border-[#efe3d3] shadow-xl text-[#2c1a11]" id="admin-login-screen">
        <div className="text-center space-y-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto border border-amber-300">
            <Key className="text-amber-700" size={20} />
          </div>
          <h2 className="font-serif font-bold text-2xl">Admin Vault Login</h2>
          <p className="font-sans text-xs text-zinc-500 leading-normal max-w-xs mx-auto">
            Unlock the physical dashboard to manage recordings, photographs, memories, and letters.
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {loginError && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-150 rounded-xl leading-relaxed">
              {loginError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-retro text-[#5d4037]">Dashboard Retro Passkey</label>
            <input
              type="password"
              placeholder="e.g. retro123"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white text-[#2c1a11] text-xs border border-zinc-200 outline-none focus:border-[#d98880] focus:ring-1 focus:ring-[#d98880] transition"
              id="admin-password-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-2.5 bg-[#5d4037] hover:bg-[#2c1a11] text-white font-retro text-xs rounded-xl shadow transition duration-200 cursor-pointer text-center"
            id="admin-login-submit"
          >
            {isLoggingIn ? "Validating Tape..." : "Unseal Vault / 로그인"}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-dashed border-zinc-200 text-center text-[10px] font-mono text-zinc-400">
          <p>Default Passkey: <span className="font-sans font-bold text-zinc-500 bg-zinc-100 px-1 py-0.5 rounded">retro123</span></p>
          <p className="mt-1">Allows immediate play testing!</p>
        </div>
      </div>
    );
  }

  // 2. LOGGED-IN ADMINISTRATOR DASHBOARD
  return (
    <div className="max-w-5xl mx-auto rounded-3xl bg-[#fcf8f2] border border-[#efe3d3] shadow-lg overflow-hidden text-[#2c1a11]" id="admin-dashboard-panel">
      {/* Top Welcome Title Ribbon */}
      <div className="bg-[#2c1a11] px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-white border-b border-[#5d4037]">
        <div className="flex items-center space-x-2">
          <Settings className="text-[#e7aeb2] animate-spin-slow" size={20} />
          <div>
            <h2 className="font-serif font-bold text-lg leading-tight">Admin Control Room</h2>
            <p className="font-sans text-[10px] text-zinc-400">Manage {settings.husbandName} & {settings.wifeName} Anniversary Tape</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="mt-3 sm:mt-0 font-retro text-xs py-1.5 px-3.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer flex items-center space-x-1"
          id="btn-admin-logout"
        >
          <LogOut size={12} />
          <span>Lock Door</span>
        </button>
      </div>

      {/* Tabs Menu Controls */}
      <div className="flex flex-wrap divide-x divide-zinc-200 border-b border-zinc-200 font-retro text-xs bg-white">
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 min-w-[120px] py-4 text-center cursor-pointer transition flex items-center justify-center space-x-2 ${
            activeTab === "settings" ? "bg-[#f5ece1] text-[#2c1a11] font-bold border-b-2 border-[#5d4037]" : "text-zinc-500 hover:bg-[#fcf8f2]"
          }`}
          id="tab-admin-settings"
        >
          <Settings size={14} />
          <span>Vows Settings</span>
        </button>
        <button
          onClick={() => setActiveTab("songs")}
          className={`flex-1 min-w-[120px] py-4 text-center cursor-pointer transition flex items-center justify-center space-x-2 ${
            activeTab === "songs" ? "bg-[#f5ece1] text-[#2c1a11] font-bold border-b-2 border-[#5d4037]" : "text-zinc-500 hover:bg-[#fcf8f2]"
          }`}
          id="tab-admin-songs"
        >
          <Music size={14} />
          <span> Cassette Tracks</span>
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`flex-1 min-w-[120px] py-4 text-center cursor-pointer transition flex items-center justify-center space-x-2 ${
            activeTab === "photos" ? "bg-[#f5ece1] text-[#2c1a11] font-bold border-b-2 border-[#5d4037]" : "text-zinc-500 hover:bg-[#fcf8f2]"
          }`}
          id="tab-admin-photos"
        >
          <Camera size={14} />
          <span>Polaroid Gallery</span>
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`flex-1 min-w-[120px] py-4 text-center cursor-pointer transition flex items-center justify-center space-x-2 ${
            activeTab === "events" ? "bg-[#f5ece1] text-[#2c1a11] font-bold border-b-2 border-[#5d4037]" : "text-zinc-500 hover:bg-[#fcf8f2]"
          }`}
          id="tab-admin-events"
        >
          <Calendar size={14} />
          <span>Timeline Milestones</span>
        </button>
        <button
          onClick={() => setActiveTab("letters")}
          className={`flex-1 min-w-[120px] py-4 text-center cursor-pointer transition flex items-center justify-center space-x-2 ${
            activeTab === "letters" ? "bg-[#f5ece1] text-[#2c1a11] font-bold border-b-2 border-[#5d4037]" : "text-zinc-500 hover:bg-[#fcf8f2]"
          }`}
          id="tab-admin-letters"
        >
          <Mail size={14} />
          <span>Love Letters</span>
        </button>
      </div>

      {/* Main Action Work Zone */}
      <div className="p-6 md:p-8 space-y-6">
        
        {/* Status Alarm Lines */}
        {statusMsg && (
          <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-center space-x-2 ${
            statusType === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
          }`}>
            <Check size={14} />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* 2A. TAB: VOWS SETTINGS */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <h3 className="font-serif font-bold text-lg border-b border-[#5d4037]/15 pb-2">Couple Identification</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-retro text-[#5d4037]">Husband (신랑)</label>
                  <input
                    type="text"
                    value={settingsForm.husbandName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, husbandName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none focus:border-[#d98880]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-retro text-[#5d4037]">Wife (신부)</label>
                  <input
                    type="text"
                    value={settingsForm.wifeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, wifeName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none focus:border-[#d98880]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-retro text-[#5d4037]">Cassette Album Cover Title</label>
                <input
                  type="text"
                  value={settingsForm.weddingTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, weddingTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none focus:border-[#d98880]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-retro text-[#5d4037]">Wedding Date (for Countdown Timer)</label>
                <input
                  type="date"
                  value={settingsForm.anniversaryDate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, anniversaryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none focus:border-[#d98880]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-retro text-[#5d4037]">New Passkey (Leave empty to keep default)</label>
                <input
                  type="password"
                  placeholder="Insert new strong key here"
                  value={settingsForm.newPassword}
                  onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none focus:border-[#d98880]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="toggle-vintage"
                  checked={settingsForm.vintageTexture}
                  onChange={(e) => setSettingsForm({ ...settingsForm, vintageTexture: e.target.checked })}
                  className="rounded border-zinc-300 pointer-events-auto"
                />
                <label htmlFor="toggle-vintage" className="text-xs font-retro text-[#5d4037] cursor-pointer">
                  Activate Film Projected Overlay & Grains Texture
                </label>
              </div>

              <button
                type="submit"
                className="py-2 px-5 bg-[#5d4037] hover:bg-[#2c1a11] text-[#fcf8f2] rounded-xl text-xs font-retro transition flex items-center space-x-1.5 cursor-pointer shadow"
                id="btn-save-settings"
              >
                <Save size={13} />
                <span>Save Vows Configuration</span>
              </button>
            </form>

            {/* Current details display */}
            <div className="bg-[#f5ece1]/45 p-6 rounded-2xl border border-[#5d4037]/10 space-y-4">
              <h4 className="font-serif font-bold text-base">Vows Live Metadata</h4>
              <div className="text-xs space-y-2 font-mono">
                <p>• Couple: <span className="text-[#5d4037] font-sans font-semibold">{settings.husbandName} ♥ {settings.wifeName}</span></p>
                <p>• Anchor Wedding Date: <span className="text-[#d98880]">{settings.anniversaryDate}</span></p>
                <p>• Tape Title: <span className="font-sans font-semibold italic">"{settings.weddingTitle}"</span></p>
                <p>• Seeded Notes counts: <span className="text-purple-700">{notes.length} posted memos</span></p>
                <p>• Total physical cogs: <span className="text-blue-700">{songs.length} song tracks</span></p>
                <p>• Total snapshot frames: <span className="text-emerald-700">{photos.length} polaroids</span></p>
              </div>
            </div>
          </div>
        )}

        {/* 2B. TAB: CASSETTE TRACKS MANAGEMENT */}
        {activeTab === "songs" && (
          <div className="space-y-8">
            {/* Form to insert new song */}
            <form onSubmit={handleAddSongSubmit} className="bg-[#f5ece1]/40 p-6 rounded-2xl border border-[#5d4037]/10 space-y-4 max-w-xl">
              <h3 className="font-serif font-bold text-lg flex items-center gap-1.5">
                <Plus size={16} />
                <span>Publish New Auditory Tape</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-retro text-[#5d4037]">Song Title (곡명)</label>
                  <input
                    type="text"
                    placeholder="e.g. Blossom (벚꽃)"
                    value={songForm.title}
                    onChange={(e) => setSongForm({ ...songForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-retro text-[#5d4037]">Artist / Cover Performer</label>
                  <input
                    type="text"
                    placeholder="e.g. retro piano"
                    value={songForm.artist}
                    onChange={(e) => setSongForm({ ...songForm, artist: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-retro text-[#5d4037]">Audio File (.mp3 URL reference)</label>
                <input
                  type="url"
                  placeholder="https://example.com/audio.mp3"
                  value={songForm.audioUrl}
                  onChange={(e) => setSongForm({ ...songForm, audioUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-retro text-[#5d4037]">Cover Image Link (.png / .jpg URL)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (optional)"
                  value={songForm.coverImage}
                  onChange={(e) => setSongForm({ ...songForm, coverImage: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none font-mono"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="song-default-autoplay"
                  checked={songForm.isDefault}
                  onChange={(e) => setSongForm({ ...songForm, isDefault: e.target.checked })}
                  className="rounded border-zinc-300 pointer-events-auto"
                />
                <label htmlFor="song-default-autoplay" className="text-xs font-retro text-[#5d4037] cursor-pointer">
                  Activate as Default Autoplay Song on entry
                </label>
              </div>

              <button
                type="submit"
                className="py-2 px-5 bg-[#5d4037] hover:bg-[#2c1a11] text-[#fcf8f2] rounded-xl text-xs font-retro transition cursor-pointer flex items-center space-x-1.5"
                id="btn-add-song"
              >
                <Plus size={13} />
                <span>Load Song Tape</span>
              </button>
            </form>

            {/* List of existing songs */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-base">Current Playback Index ({songs.length})</h4>
              <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                {songs.map((song) => (
                  <div key={song.id} className="p-4 flex items-center justify-between text-xs" id={`admin-song-row-${song.id}`}>
                    <div className="flex items-center space-x-3 truncate">
                      <img
                        src={song.coverImage}
                        alt="cover"
                        className="w-10 h-10 rounded object-cover shadow-sm shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-zinc-800 font-sans">{song.title} {song.isDefault && <span className="text-[9px] text-[#d98880] border border-[#d98880] px-1 py-0.2 rounded ml-1 bg-[#d98880]/10 font-mono">DEFAULT</span>}</p>
                        <p className="text-zinc-500 font-sans">by {song.artist}</p>
                        <p className="text-[10px] text-zinc-400 truncate max-w-sm font-mono mt-0.5">{song.audioUrl}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteSong(song.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Deplane track"
                      id={`btn-del-song-${song.id}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2C. TAB: POLAROID PHOTO GALLERY */}
        {activeTab === "photos" && (
          <div className="space-y-8">
            <form onSubmit={handleAddPhotoSubmit} className="bg-[#f5ece1]/40 p-6 rounded-2xl border border-[#5d4037]/10 space-y-4 max-w-xl">
              <h3 className="font-serif font-bold text-lg flex items-center gap-1.5">
                <Plus size={16} />
                <span>Develop New Polaroid Shot</span>
              </h3>

              {/* Local upload file block */}
              <div className="space-y-1.5">
                <label className="text-xs font-retro text-[#5d4037]">Upload Polaroid Image File (Local Image)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileUpload}
                  className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
                  id="input-photo-file"
                />
                <span className="block text-[10px] text-zinc-400 italic">Accepts .jpg, .png up to 5MB, converts to Base64 in JSON database automatically.</span>
              </div>

              {/* Alternative external file image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-retro text-[#5d4037]">Or Paste Image URL Link</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (if not uploading local file)"
                  value={photoForm.imageUrl.startsWith("data:") ? "" : photoForm.imageUrl}
                  onChange={(e) => setPhotoForm({ ...photoForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none font-mono"
                  disabled={photoForm.imageUrl.startsWith("data:")}
                />
                {photoForm.imageUrl.startsWith("data:") && (
                  <div className="flex items-center space-x-1.5 text-xs text-green-700 bg-green-50 px-2 py-1.5 rounded-lg border border-green-200">
                    <span>Base64 local photo loaded and active!</span>
                    <button
                      type="button"
                      onClick={() => setPhotoForm((prev) => ({ ...prev, imageUrl: "" }))}
                      className="text-[10px] text-red-600 underline font-bold"
                    >
                      Clear File
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-retro text-[#5d4037]">Moment Date</label>
                  <input
                    type="date"
                    value={photoForm.date}
                    onChange={(e) => setPhotoForm({ ...photoForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-retro text-[#5d4037]">Polaroid Category</label>
                  <select
                    value={photoForm.category}
                    onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none"
                  >
                    <option value="Engagement">Engagement</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Honeymoon">Honeymoon</option>
                    <option value="Family Moments">Family Moments</option>
                    <option value="Anniversary Celebrations">Anniversary Celebrations</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-retro text-[#5d4037]">Handwritten Caption Caption</label>
                <input
                  type="text"
                  placeholder="e.g. Walking under cherry blossoms in full bloom."
                  value={photoForm.caption}
                  onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
                  maxLength={180}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="py-2 px-5 bg-[#5d4037] hover:bg-[#2c1a11] text-[#fcf8f2] rounded-xl text-xs font-retro transition cursor-pointer flex items-center space-x-1.5"
                id="btn-add-photo"
              >
                <Plus size={13} />
                <span>Publish Polaroid</span>
              </button>
            </form>

            <div className="space-y-3">
              <h4 className="font-serif font-bold text-base">Active Polaroid Frames ({photos.length})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="bg-white p-3 border border-zinc-200 rounded-lg shadow-sm flex flex-col justify-between relative group" id={`admin-photo-card-${photo.id}`}>
                    <div className="aspect-square bg-zinc-900 rounded overflow-hidden relative">
                      <img
                        src={photo.imageUrl}
                        alt="gallery"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 left-1 font-mono text-[8px] bg-black/60 text-white px-1.5 py-0.5 rounded uppercase">
                        {photo.category.substring(0, 7)}
                      </span>
                    </div>
                    <p className="font-serif italic text-[10px] text-zinc-500 text-center mt-2 truncate">"{photo.caption || 'Sweet vow'}"</p>
                    <div className="flex items-center justify-between border-t border-zinc-100 pt-2 mt-2">
                      <span className="font-mono text-[8px] text-zinc-400">{photo.date}</span>
                      <button
                        onClick={() => onDeletePhoto(photo.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition cursor-pointer"
                        title="Delete photo"
                        id={`btn-del-photo-${photo.id}`}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2D. TAB: TIMELINE EVENTS */}
        {activeTab === "events" && (
          <div className="space-y-8">
            <form onSubmit={handleAddEventSubmit} className="bg-[#f5ece1]/40 p-6 rounded-2xl border border-[#5d4037]/10 space-y-4 max-w-xl">
              <h3 className="font-serif font-bold text-lg flex items-center gap-1.5">
                <Plus size={16} />
                <span>Create Timeline Love Milestone</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-retro text-[#5d4037]">Milestone Title</label>
                  <input
                    type="text"
                    placeholder="e.g. First Date (첫 데이트)"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-retro text-[#5d4037]">Milestone Date</label>
                  <input
                    type="date"
                    value={eventForm.eventDate}
                    onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none"
                    required
                  />
                </div>
              </div>

              {/* Local File block for timeline illustration */}
              <div className="space-y-1.5">
                <label className="text-xs font-retro text-[#5d4037]">Upload Story Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEventFileUpload}
                  className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
                  id="input-event-file"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-retro text-[#5d4037]">Or Paste Image URL Link</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (if not uploading local file)"
                  value={eventForm.imageUrl.startsWith("data:") ? "" : eventForm.imageUrl}
                  onChange={(e) => setEventForm({ ...eventForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none font-mono"
                  disabled={eventForm.imageUrl.startsWith("data:")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-retro text-[#5d4037]">Chrono Display Order weight</label>
                <input
                  type="number"
                  value={eventForm.displayOrder}
                  onChange={(e) => setEventForm({ ...eventForm, displayOrder: parseInt(e.target.value) || 1 })}
                  className="w-40 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-retro text-[#5d4037]">Anniversary Story Description</label>
                <textarea
                  placeholder="Tell the beautiful details of this specific milestone memory..."
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white text-xs border border-zinc-200 outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="py-2 px-5 bg-[#5d4037] hover:bg-[#2c1a11] text-[#fcf8f2] rounded-xl text-xs font-retro transition cursor-pointer flex items-center space-x-1.5"
                id="btn-add-event"
              >
                <Plus size={13} />
                <span>Save Milestone</span>
              </button>
            </form>

            <div className="space-y-3">
              <h4 className="font-serif font-bold text-base">Timeline Ledger Index ({events.length})</h4>
              <div className="divide-y divide-[#5d4037]/10 border border-[#5d4037]/15 rounded-2xl overflow-hidden bg-white">
                {[...events].sort((a,b) => a.displayOrder - b.displayOrder).map((ev) => (
                  <div key={ev.id} className="p-4 flex items-center justify-between text-xs" id={`admin-event-row-${ev.id}`}>
                    <div className="flex items-center space-x-3 truncate">
                      <img
                        src={ev.imageUrl}
                        alt="event"
                        className="w-9 h-9 rounded object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-zinc-800 font-sans">
                          {ev.displayOrder}. {ev.title} <span className="text-[10px] text-[#d98880] font-mono ml-2 font-medium">{ev.eventDate}</span>
                        </p>
                        <p className="text-zinc-500 truncate max-w-lg font-sans">{ev.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteEvent(ev.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Deplane event"
                      id={`btn-del-event-${ev.id}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2E. TAB: LOVE LETTERS */}
        {activeTab === "letters" && (
          <div className="space-y-8">
            <form onSubmit={handleAddLetterSubmit} className="bg-[#f5ece1]/40 p-6 rounded-2xl border border-[#5d4037]/10 space-y-4 max-w-xl">
              <h3 className="font-serif font-bold text-lg flex items-center gap-1.5">
                <Plus size={16} />
                <span>Seal Handwritten Letter Draft</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-retro text-[#5d4037]">Letter Envelope Title</label>
                  <input
                    type="text"
                    placeholder="e.g. To My Beloved (나의 사랑하는 이에게)"
                    value={letterForm.title}
                    onChange={(e) => setLetterForm({ ...letterForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-retro text-[#5d4037]">Draft Date</label>
                  <input
                    type="date"
                    value={letterForm.letterDate}
                    onChange={(e) => setLetterForm({ ...letterForm, letterDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-retro text-[#5d4037]">Letter Envelope Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (optional stamp background url)"
                  value={letterForm.coverImage}
                  onChange={(e) => setLetterForm({ ...letterForm, coverImage: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-retro text-[#5d4037]">Letter Body Content</label>
                <textarea
                  placeholder="Draft your long handtyped love record. Paragraph breaks are preserved beautifully..."
                  rows={6}
                  value={letterForm.content}
                  onChange={(e) => setLetterForm({ ...letterForm, content: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white text-xs border border-zinc-200 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="py-2 px-5 bg-[#5d4037] hover:bg-[#2c1a11] text-[#fcf8f2] rounded-xl text-xs font-retro transition cursor-pointer flex items-center space-x-1.5"
                id="btn-add-letter"
              >
                <Plus size={13} />
                <span>Seal Letter</span>
              </button>
            </form>

            <div className="space-y-3">
              <h4 className="font-serif font-bold text-base">Catalogued Letters ({letters.length})</h4>
              <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                {letters.map((letter) => (
                  <div key={letter.id} className="p-4 flex items-center justify-between text-xs" id={`admin-letter-row-${letter.id}`}>
                    <div className="truncate pr-6">
                      <p className="font-semibold text-zinc-800 font-sans">{letter.title}</p>
                      <p className="text-[#d98880] font-mono text-[10px] mt-0.5">Anchored: {letter.letterDate}</p>
                      <p className="text-zinc-500 truncate max-w-md font-sans mt-0.5">{letter.content}</p>
                    </div>
                    <button
                      onClick={() => onDeleteLetter(letter.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Deplane letter"
                      id={`btn-del-letter-${letter.id}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
