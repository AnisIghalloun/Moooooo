import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("minemods.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS mods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    longDescription TEXT,
    version TEXT,
    author TEXT,
    category TEXT,
    downloads INTEGER DEFAULT 0,
    imageUrl TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM mods").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO mods (id, name, description, longDescription, version, author, category, downloads, imageUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    "1",
    "OptiFine",
    "Minecraft optimization mod. It allows Minecraft to run faster and look better.",
    "# OptiFine\n\nOptiFine is a Minecraft optimization mod. It allows Minecraft to run faster and look better with full support for HD textures and many configuration options.\n\n## Features\n- FPS boost\n- Support for HD Textures\n- Variable Render Distance\n- Antialiasing\n- Connected Textures",
    "1.20.1",
    "sp614x",
    "Optimization",
    1500000,
    "https://picsum.photos/seed/optifine/800/400"
  );

  insert.run(
    "2",
    "JourneyMap",
    "Real-time mapping in-game or in a web browser as you explore.",
    "# JourneyMap\n\nJourneyMap is a client-side mod for Minecraft which maps your world in real-time as you explore. You can view the map in-game using a minimap or full-screen, or even in a web browser.",
    "1.20.1",
    "techbrew",
    "Map",
    800000,
    "https://picsum.photos/seed/journeymap/800/400"
  );

  insert.run(
    "3",
    "Just Enough Items (JEI)",
    "JEI is an item and recipe viewing mod for Minecraft, built from the ground up for stability and performance.",
    "# Just Enough Items (JEI)\n\nJEI is an item and recipe viewing mod for Minecraft, built from the ground up for stability and performance.",
    "1.20.1",
    "mezz",
    "Utility",
    2500000,
    "https://picsum.photos/seed/jei/800/400"
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/mods", (req, res) => {
    const { search, category } = req.query;
    let query = "SELECT * FROM mods";
    const params: any[] = [];

    if (search || category) {
      query += " WHERE";
      if (search) {
        query += " (name LIKE ? OR description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
      }
      if (category) {
        if (search) query += " AND";
        query += " category = ?";
        params.push(category);
      }
    }

    query += " ORDER BY downloads DESC";
    const mods = db.prepare(query).all(...params);
    res.json(mods);
  });

  app.get("/api/mods/:id", (req, res) => {
    const mod = db.prepare("SELECT * FROM mods WHERE id = ?").get(req.params.id);
    if (mod) {
      res.json(mod);
    } else {
      res.status(404).json({ error: "Mod not found" });
    }
  });

  app.post("/api/mods", (req, res) => {
    const { name, description, longDescription, version, author, category, imageUrl, adminPassword } = req.body;
    
    if (adminPassword !== (process.env.ADMIN_PASSWORD || "ANIS2006")) {
      return res.status(403).json({ error: "Incorrect admin password" });
    }

    const id = uuidv4();
    const insert = db.prepare(`
      INSERT INTO mods (id, name, description, longDescription, version, author, category, imageUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(id, name, description, longDescription, version, author, category, imageUrl || `https://picsum.photos/seed/${id}/800/400`);
    res.status(201).json({ id });
  });

  app.post("/api/mods/:id/download", (req, res) => {
    db.prepare("UPDATE mods SET downloads = downloads + 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
