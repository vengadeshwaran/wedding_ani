export interface CoupleSettings {
  husbandName: string;
  wifeName: string;
  anniversaryDate: string; // ISO or YYYY-MM-DD
  weddingTitle: string;
  vintageTexture: boolean;
  ambientSoundUrl: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverImage: string;
  isDefault: boolean;
}

export interface Photo {
  id: string;
  imageUrl: string;
  category: "Engagement" | "Wedding" | "Honeymoon" | "Family" | "Anniversary" | string;
  caption: string;
  date: string;
}

export interface LoveEvent {
  id: string;
  title: string;
  eventDate: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
}

export interface Letter {
  id: string;
  title: string;
  letterDate: string;
  content: string;
  coverImage: string;
  isOpened?: boolean;
}

export interface MemoryNote {
  id: string;
  author: string;
  content: string;
  date: string;
  color: string; // Tailwind bg color class
}

export interface DatabaseSchema {
  settings: CoupleSettings;
  songs: Song[];
  photos: Photo[];
  events: LoveEvent[];
  letters: Letter[];
  notes: MemoryNote[];
}
