import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { DatabaseSchema, Song, Photo, LoveEvent, Letter, MemoryNote } from "./src/types";

const app = express();
const PORT = 3001;
const DB_PATH = path.join(process.cwd(), "database.json");

// Middleware to parse large JSON (crucial for Base64 image uploads)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Default Seeding Data for our beautiful Korean romantic retro theme
const DEFAULT_DATABASE: DatabaseSchema & { adminPasswordHash: string } = {
  adminPasswordHash: crypto.createHash("sha256").update("retro123").digest("hex"),
  settings: {
    husbandName: "வெங்கடேஸ்வரன்",
    wifeName: "Sae-byeok",
    anniversaryDate: "2022-09-18",
    weddingTitle: "Our Memory Tape",
    vintageTexture: true,
    ambientSoundUrl: "https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav" // Gentle film projector sound/soft wind
  },
  songs: [
    {
      id: "song-1",
      title: "First Love (첫사랑)",
      artist: "வெங்கடேஸ்வரன் & Sae-byeok",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400",
      isDefault: true
    },
    {
      id: "song-2",
      title: "Cherry Blossom Ending (벚꽃 엔딩)",
      artist: "Busker Acoustic",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      coverImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400",
      isDefault: false
    },
    {
      id: "song-3",
      title: "Some (썸) Instrumental",
      artist: "Retro Piano Cover",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      coverImage: "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?q=80&w=400",
      isDefault: false
    }
  ],
  photos: [
    {
      id: "photo-1",
      imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800",
      category: "Engagement",
      caption: "Our first sunset proposal at Jeju Island, surrounded by fields of canola flowers.",
      date: "2021-10-24"
    },
    {
      id: "photo-2",
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
      category: "Wedding",
      caption: "Saying 'I do' under the rustic archway with all our loved ones witnessing.",
      date: "2022-09-18"
    },
    {
      id: "photo-3",
      imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800",
      category: "Honeymoon",
      caption: "Lost in the beautiful traditional streets, sharing sweet honey pancakes.",
      date: "2022-10-05"
    },
    {
      id: "photo-4",
      imageUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800",
      category: "Family Moments",
      caption: "A joyful family picnic under winter's gentle warm sunshine.",
      date: "2023-12-15"
    },
    {
      id: "photo-5",
      imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800",
      category: "Anniversary Celebrations",
      caption: "First anniversary back at our favorite Hanok Retro café.",
      date: "2023-09-18"
    }
  ],
  events: [
    {
      id: "event-1",
      title: "First Meeting (첫 만남)",
      eventDate: "2019-05-14",
      description: "We locked eyes across a vintage music bookstore in Ikseon-dong. Sae-byeok was looking for an old vinyl, and வெங்கடேஸ்வரன் held the last copy.",
      imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800",
      displayOrder: 1
    },
    {
      id: "event-2",
      title: "The First Movie Date",
      eventDate: "2019-06-02",
      description: "Sharing caramel popcorn under retro neon lights. We talked for four hours of non-stop Korean melodies afterward.",
      imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800",
      displayOrder: 2
    },
    {
      id: "event-3",
      title: "The Sunset Proposal",
      eventDate: "2021-10-24",
      description: "வெங்கடேஸ்வரன் got on one knee during our sunset beach stroll in Jeju. A custom recorded tape of our memories played in the background.",
      imageUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800",
      displayOrder: 3
    },
    {
      id: "event-4",
      title: "Our Dream Wedding",
      eventDate: "2022-09-18",
      description: "We tied the knot in an intimate courtyard wedding ceremony. Soft lanterns danced, and we promised to walk hand-in-hand forever.",
      imageUrl: "https://images.unsplash.com/photo-1519225495810-7517cbd14569?q=80&w=800",
      displayOrder: 4
    },
    {
      id: "event-5",
      title: "Romantic Honeymoon",
      eventDate: "2022-10-02",
      description: "Wandering through golden forests, eating retro street toast, and documenting every smile with our film cameras.",
      imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800",
      displayOrder: 5
    }
  ],
  letters: [
    {
      id: "letter-1",
      title: "To My Sae-byeok (My Shining Blossom)",
      letterDate: "2022-09-18",
      content: "Dearest Sae-byeok,\n\nStanding before you today, looking into your sparkling eyes, I felt like the protagonist of a timeless cinematic love story.\n\nFrom the very second we bumped into each other in that old, dusty record store, I knew my heart was no longer my own. You brought warm, beautiful colors into my monochrome world, much like a film photograph blooming into life.\n\nI promise to love you through every season—to dry your tears, celebrate your laughs, listen to our favorite retro records with you on rainy nights, and make every single day feel as safe and warm as a cozy café. Thank you for choosing me to be your dance partner for life.\n\nWith all my heart and soul,\nவெங்கடேஸ்வரன்",
      coverImage: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=400"
    },
    {
      id: "letter-2",
      title: "To வெங்கடேஸ்வரன் (My Peaceful Haven)",
      letterDate: "2022-09-18",
      content: "My Dear வெங்கடேஸ்வரன்,\n\nThey say love is like an old song that never goes out of style. Today, on our wedding day, our song truly began.\n\nYou are my home, வெங்கடேஸ்வரன். In a busy, hurried world, your quiet smiles and steady hands are my ultimate sanctuary. I love how you remember my favorite songs, how you always give me the sunny side of the street, and how you dream about our future.\n\nToday, I give you my whole heart. Let's write our story beautifully, frame by frame, capturing every tiny retro moment. I can't wait to grow old and sweet with you.\n\nYour wife,\nSae-byeok",
      coverImage: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=400"
    }
  ],
  notes: [
    {
      id: "note-1",
      author: "Omma (엄마)",
      content: "Happy anniversary! Walk beautifully together, like a wonderful blooming drama. Always support each other. ❤️",
      date: "2024-09-18",
      color: "bg-rose-50"
    },
    {
      id: "note-2",
      author: "Ji-tae",
      content: "The coolest couple ever! Let's listen to retro songs and eat Korean BBQ soon! Happy 2 Years!",
      date: "2024-09-18",
      color: "bg-amber-50"
    },
    {
      id: "note-3",
      author: "Min-a (민아)",
      content: "I still remember your beautiful Jeju proposal like it was yesterday. Have an amazing lifetime journey!",
      date: "2024-09-19",
      color: "bg-emerald-50"
    }
  ]
};

// Database Read/Write helpers
function readDB(): DatabaseSchema & { adminPasswordHash: string } {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DATABASE, null, 2), "utf-8");
      return DEFAULT_DATABASE;
    }
    const rawData = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error reading database file, returning default:", error);
    return DEFAULT_DATABASE;
  }
}

function writeDB(data: DatabaseSchema & { adminPasswordHash: string }) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to database file:", error);
  }
}

// In-Memory Active Sessions Store
const ACTIVE_SESSIONS: Set<string> = new Set();

// Authentication middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  const token = authHeader.replace("Bearer ", "");
  if (!ACTIVE_SESSIONS.has(token)) {
    res.status(401).json({ error: "Invalid or expired session token" });
    return;
  }
  next();
}

// ==========================================
// 1. APIs - Auth & Settings
// ==========================================
app.post("/api/auth/login", (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  const db = readDB();
  const inputHash = crypto.createHash("sha256").update(password).digest("hex");

  if (inputHash === db.adminPasswordHash) {
    const sessionToken = crypto.randomBytes(32).toString("hex");
    ACTIVE_SESSIONS.add(sessionToken);
    res.json({ token: sessionToken, settings: db.settings });
  } else {
    res.status(401).json({ error: "Mismatched retro key (Incorrect Password)" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    ACTIVE_SESSIONS.delete(token);
  }
  res.json({ success: true });
});

// Update Settings & Password
app.put("/api/settings", requireAdmin, (req, res) => {
  const { husbandName, wifeName, anniversaryDate, weddingTitle, vintageTexture, ambientSoundUrl, newPassword } = req.body;
  const db = readDB();

  db.settings = {
    husbandName: husbandName || db.settings.husbandName,
    wifeName: wifeName || db.settings.wifeName,
    anniversaryDate: anniversaryDate || db.settings.anniversaryDate,
    weddingTitle: weddingTitle || db.settings.weddingTitle,
    vintageTexture: vintageTexture !== undefined ? vintageTexture : db.settings.vintageTexture,
    ambientSoundUrl: ambientSoundUrl !== undefined ? ambientSoundUrl : db.settings.ambientSoundUrl
  };

  if (newPassword && newPassword.trim().length > 0) {
    db.adminPasswordHash = crypto.createHash("sha256").update(newPassword).digest("hex");
  }

  writeDB(db);
  res.json({ settings: db.settings, message: "Settings updated successfully" });
});

// Public metadata get
app.get("/api/settings", (req, res) => {
  const db = readDB();
  res.json(db.settings);
});

// Full state for single-page load
app.get("/api/full-data", (req, res) => {
  const db = readDB();
  res.json({
    settings: db.settings,
    songs: db.songs,
    photos: db.photos,
    events: db.events,
    letters: db.letters,
    notes: db.notes
  });
});

// ==========================================
// 2. APIs - Songs (Music Management)
// ==========================================
app.get("/api/songs", (req, res) => {
  const db = readDB();
  res.json(db.songs);
});

app.post("/api/songs", requireAdmin, (req, res) => {
  const { title, artist, audioUrl, coverImage, isDefault } = req.body;
  if (!title || !artist || !audioUrl) {
    res.status(400).json({ error: "Title, artist, and audio URL are required" });
    return;
  }

  const db = readDB();
  const newSong: Song = {
    id: `song-${Date.now()}`,
    title,
    artist,
    audioUrl,
    coverImage: coverImage || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400",
    isDefault: !!isDefault
  };

  if (newSong.isDefault) {
    db.songs.forEach(s => s.isDefault = false);
  }

  db.songs.push(newSong);
  writeDB(db);
  res.status(201).json(newSong);
});

app.put("/api/songs/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { title, artist, audioUrl, coverImage, isDefault } = req.body;
  const db = readDB();
  const songIndex = db.songs.findIndex(s => s.id === id);

  if (songIndex === -1) {
    res.status(404).json({ error: "Song not found" });
    return;
  }

  const updatedSong = {
    ...db.songs[songIndex],
    title: title || db.songs[songIndex].title,
    artist: artist || db.songs[songIndex].artist,
    audioUrl: audioUrl || db.songs[songIndex].audioUrl,
    coverImage: coverImage || db.songs[songIndex].coverImage,
    isDefault: isDefault !== undefined ? !!isDefault : db.songs[songIndex].isDefault
  };

  if (updatedSong.isDefault) {
    db.songs.forEach(s => s.isDefault = false);
  }

  db.songs[songIndex] = updatedSong;
  writeDB(db);
  res.json(updatedSong);
});

app.delete("/api/songs/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const filtered = db.songs.filter(s => s.id !== id);

  if (filtered.length === db.songs.length) {
    res.status(404).json({ error: "Song not found" });
    return;
  }

  db.songs = filtered;
  // Fallback default
  if (db.songs.length > 0 && !db.songs.some(s => s.isDefault)) {
    db.songs[0].isDefault = true;
  }

  writeDB(db);
  res.json({ success: true });
});

// ==========================================
// 3. APIs - Photos (Gallery Management)
// ==========================================
app.get("/api/photos", (req, res) => {
  const db = readDB();
  res.json(db.photos);
});

app.post("/api/photos", requireAdmin, (req, res) => {
  const { imageUrl, category, caption, date } = req.body;
  if (!imageUrl || !category) {
    res.status(400).json({ error: "Image URL and category are required" });
    return;
  }

  const db = readDB();
  const newPhoto: Photo = {
    id: `photo-${Date.now()}`,
    imageUrl,
    category,
    caption: caption || "",
    date: date || new Date().toISOString().split("T")[0]
  };

  db.photos.push(newPhoto);
  writeDB(db);
  res.status(201).json(newPhoto);
});

app.put("/api/photos/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { imageUrl, category, caption, date } = req.body;
  const db = readDB();
  const index = db.photos.findIndex(p => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Photo not found" });
    return;
  }

  db.photos[index] = {
    ...db.photos[index],
    imageUrl: imageUrl || db.photos[index].imageUrl,
    category: category || db.photos[index].category,
    caption: caption !== undefined ? caption : db.photos[index].caption,
    date: date || db.photos[index].date
  };

  writeDB(db);
  res.json(db.photos[index]);
});

app.delete("/api/photos/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const filtered = db.photos.filter(p => p.id !== id);

  if (filtered.length === db.photos.length) {
    res.status(404).json({ error: "Photo not found" });
    return;
  }

  db.photos = filtered;
  writeDB(db);
  res.json({ success: true });
});

// ==========================================
// 4. APIs - Events (Timeline Management)
// ==========================================
app.get("/api/events", (req, res) => {
  const db = readDB();
  const sorted = [...db.events].sort((a, b) => a.displayOrder - b.displayOrder);
  res.json(sorted);
});

app.post("/api/events", requireAdmin, (req, res) => {
  const { title, eventDate, description, imageUrl, displayOrder } = req.body;
  if (!title || !eventDate || !description) {
    res.status(400).json({ error: "Title, date, and description are required" });
    return;
  }

  const db = readDB();
  const newEvent: LoveEvent = {
    id: `event-${Date.now()}`,
    title,
    eventDate,
    description,
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800",
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : db.events.length + 1
  };

  db.events.push(newEvent);
  writeDB(db);
  res.status(201).json(newEvent);
});

app.put("/api/events/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { title, eventDate, description, imageUrl, displayOrder } = req.body;
  const db = readDB();
  const index = db.events.findIndex(e => e.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  db.events[index] = {
    ...db.events[index],
    title: title || db.events[index].title,
    eventDate: eventDate || db.events[index].eventDate,
    description: description || db.events[index].description,
    imageUrl: imageUrl || db.events[index].imageUrl,
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : db.events[index].displayOrder
  };

  writeDB(db);
  res.json(db.events[index]);
});

app.delete("/api/events/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const filtered = db.events.filter(e => e.id !== id);

  if (filtered.length === db.events.length) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  db.events = filtered;
  writeDB(db);
  res.json({ success: true });
});

// ==========================================
// 5. APIs - Letters (Love Letters)
// ==========================================
app.get("/api/letters", (req, res) => {
  const db = readDB();
  res.json(db.letters);
});

app.post("/api/letters", requireAdmin, (req, res) => {
  const { title, letterDate, content, coverImage } = req.body;
  if (!title || !content || !letterDate) {
    res.status(400).json({ error: "Title, content, and date are required" });
    return;
  }

  const db = readDB();
  const newLetter: Letter = {
    id: `letter-${Date.now()}`,
    title,
    letterDate,
    content,
    coverImage: coverImage || "https://images.unsplash.com/photo-1510150490525-473c47e087f8?q=80&w=400"
  };

  db.letters.push(newLetter);
  writeDB(db);
  res.status(201).json(newLetter);
});

app.put("/api/letters/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { title, letterDate, content, coverImage } = req.body;
  const db = readDB();
  const index = db.letters.findIndex(l => l.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Letter not found" });
    return;
  }

  db.letters[index] = {
    ...db.letters[index],
    title: title || db.letters[index].title,
    letterDate: letterDate || db.letters[index].letterDate,
    content: content || db.letters[index].content,
    coverImage: coverImage || db.letters[index].coverImage
  };

  writeDB(db);
  res.json(db.letters[index]);
});

app.delete("/api/letters/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const filtered = db.letters.filter(l => l.id !== id);

  if (filtered.length === db.letters.length) {
    res.status(404).json({ error: "Letter not found" });
    return;
  }

  db.letters = filtered;
  writeDB(db);
  res.json({ success: true });
});

// ==========================================
// 6. APIs - Memory Notes (Memory Wall)
// ==========================================
app.get("/api/notes", (req, res) => {
  const db = readDB();
  res.json(db.notes);
});

app.post("/api/notes", (req, res) => {
  const { author, content, color } = req.body;
  if (!author || !content) {
    res.status(400).json({ error: "Author and content are required" });
    return;
  }

  const db = readDB();
  const colors = ["bg-rose-50", "bg-amber-50", "bg-emerald-50", "bg-sky-50", "bg-violet-50", "bg-orange-50"];
  const finalColor = color || colors[Math.floor(Math.random() * colors.length)];

  const newNote: MemoryNote = {
    id: `note-${Date.now()}`,
    author,
    content,
    date: new Date().toISOString().split("T")[0],
    color: finalColor
  };

  db.notes.push(newNote);
  writeDB(db);
  res.status(201).json(newNote);
});

app.delete("/api/notes/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const filtered = db.notes.filter(n => n.id !== id);

  if (filtered.length === db.notes.length) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  db.notes = filtered;
  writeDB(db);
  res.json({ success: true });
});

// Start express server configuration for build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // In development mode, Vite processes assets in parallel
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // In production mode, serve built static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Anniversary Server] retro engine humming elegantly on http://localhost:${PORT}`);
  });
}

startServer();
