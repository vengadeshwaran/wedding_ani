import React, { useState } from "react";
import { MessageSquarePlus, MessageSquare, Trash2, Calendar, Sparkles } from "lucide-react";
import { MemoryNote } from "../types";

interface MemoryWallProps {
  notes: MemoryNote[];
  onAddNote: (author: string, content: string, color: string) => Promise<void>;
  onDeleteNote?: (id: string) => Promise<void>;
  isAdmin?: boolean;
}

export default function MemoryWall({ notes, onAddNote, onDeleteNote, isAdmin = false }: MemoryWallProps) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState("bg-rose-50");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const colorPresets = [
    { label: "Blush Rose", value: "bg-rose-50", text: "text-rose-800", border: "border-rose-200/60" },
    { label: "Retro Gold", value: "bg-amber-50", text: "text-amber-800", border: "border-amber-200/60" },
    { label: "Fresh Mint", value: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200/60" },
    { label: "Cozy Sky", value: "bg-sky-50", text: "text-sky-800", border: "border-sky-200/60" },
    { label: "Soft Violet", value: "bg-violet-50", text: "text-violet-800", border: "border-violet-200/60" },
    { label: "Warm Clay", value: "bg-orange-50", text: "text-orange-800", border: "border-orange-200/60" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!author.trim()) {
      setErrorMsg("Please enter your name!");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("Please write a sweet note!");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddNote(author, content, selectedColor);
      setAuthor("");
      setContent("");
      setSelectedColor("bg-rose-50");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to post note, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPresetInfo = (val: string) => {
    return colorPresets.find((c) => c.value === val) || colorPresets[0];
  };

  const getTiltStyle = (id: string) => {
    // Generate deterministic mild tilt based on letter values in the unique ID string
    let sum = 0;
    for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    const orientations = [
      "-rotate-1 shadow-sm",
      "rotate-1 shadow-md",
      "-rotate-2 shadow-md",
      "rotate-2 shadow-sm",
      "rotate-0.5 shadow-lg",
      "-rotate-0.5 shadow mt-1",
    ];
    return orientations[sum % orientations.length];
  };

  return (
    <div id="memory-wall-wrapper" className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: THE POST MEMO PANEL FORM (Styled like a retro notebook) */}
        <div className="bg-[#fcf8f2] p-6 rounded-2xl border border-[#5d4037]/15 shadow-md relative overflow-hidden paper-texture">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#e7aeb2] to-[#d98880]" />
          
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquarePlus className="text-[#d98880]" size={18} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#d98880]">
              POST RECOLLECTION MESSAGE
            </span>
          </div>

          <h3 className="font-serif font-bold text-lg text-[#2c1a11] mb-2">
            Leave Your Sweet Wishes
          </h3>
          <p className="font-sans text-xs text-zinc-500 leading-relaxed mb-6">
            Write a special note, beautiful quote, or anniversary wish for the happy couple to see.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-retro text-[#5d4037]">Your Name (작성자)</label>
              <input
                type="text"
                placeholder="e.g. Aunt Min-ji or Ji-tae"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={40}
                className="w-full px-3.5 py-2 rounded-xl bg-white text-zinc-800 text-xs border border-zinc-200 outline-none focus:border-[#d98880] focus:ring-1 focus:ring-[#d98880] transition"
                id="input-note-author"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-retro text-[#5d4037]">Your Message (내용)</label>
              <textarea
                placeholder="Write your wishes here under the stars..."
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={300}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white text-zinc-800 text-xs border border-zinc-200 outline-none focus:border-[#d98880] focus:ring-1 focus:ring-[#d98880] transition resize-none"
                id="input-note-content"
              />
            </div>

            {/* Pastel Palette Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-retro text-[#5d4037]">Sticky Tape Theme</label>
              <div className="grid grid-cols-6 gap-1.5">
                {colorPresets.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c.value)}
                    className={`h-7 rounded-md ${c.value} border-2 transition transform hover:scale-110 active:scale-95 ${
                      selectedColor === c.value ? "border-[#5d4037]" : "border-transparent"
                    }`}
                    title={c.label}
                    id={`btn-color-pick-${c.value}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#5d4037] hover:bg-[#2c1a11] text-[#fcf8f2] font-retro text-xs rounded-xl shadow transition duration-200 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              id="btn-note-submit"
            >
              <Sparkles size={13} />
              <span>{isSubmitting ? "Post-It Pinned..." : "Pin Anniversary Wish / 등록하기"}</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN LISTING RECOLLECTIONS: THE POST-IT WALL BOARD */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#5d4037]/10 pb-3">
            <MessageSquare size={16} className="text-[#d98880]" />
            <h4 className="font-serif font-bold text-base text-[#2c1a11]">
              Sticky Memo Wall (추억의 메모지)
            </h4>
            <span className="font-mono text-[10px] text-zinc-400 bg-[#f5ece1] px-2 py-0.5 rounded-full border border-[#5d4037]/10 ml-auto">
              {notes.length} notes posted
            </span>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-16 retro-glass rounded-2xl p-8 border border-dashed border-[#5d4037]/15">
              <p className="font-serif italic text-zinc-400">Be the first to pin a warm wish and bless the couple! 📌</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {notes.map((note) => {
                const colorInfo = getPresetInfo(note.color);

                return (
                  <div
                    key={note.id}
                    className={`p-6 rounded-sm border ${colorInfo.border} ${note.color} ${colorInfo.text} flex flex-col justify-between relative shadow-sm hover:shadow-lg transition duration-200 transform ${getTiltStyle(
                      note.id
                    )}`}
                    id={`note-card-${note.id}`}
                  >
                    {/* Simulated sticky note hanging tape strip on top center */}
                    <div className="absolute top-[-9px] left-1/2 transform -translate-x-1/2 w-14 h-4 bg-yellow-200/60 border border-yellow-300/30 shadow-none rotate-2 pointer-events-none select-none" />

                    {/* Content */}
                    <div className="space-y-3 pt-1">
                      <p className="font-serif italic text-sm leading-relaxed whitespace-pre-wrap select-text selection:bg-[#e7aeb2]/35">
                        "{note.content}"
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 flex justify-between items-center border-t border-dashed border-[#5d4037]/15 pt-2.5 text-[9px] font-mono select-none">
                      <div className="flex flex-col">
                        <span className="font-sans font-bold text-[10px]">From: {note.author}</span>
                        <div className="flex items-center gap-1 opacity-60 mt-0.5">
                          <Calendar size={9} />
                          <span>Pinned: {note.date}</span>
                        </div>
                      </div>

                      {isAdmin && onDeleteNote && (
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="p-1 rounded-full text-red-600 hover:bg-red-100/50 hover:text-red-700 transition"
                          title="Erase Sticky Note"
                          id={`btn-delete-note-${note.id}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
