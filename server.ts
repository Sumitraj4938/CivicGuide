import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import helmet from "helmet";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "https:*"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for Vite
        "connect-src": ["'self'", "https://generativelanguage.googleapis.com", "https://*.firebaseio.com", "https://*.googleapis.com", "wss://*.firebaseio.com"],
      },
    }
  }));

  app.use(express.json());

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // News API (Mocking for now, will connect to Firestore if data exists)
  app.get("/api/news", (req, res) => {
    const mockNews = [
      {
        id: "1",
        title: "Voter Registration Deadlines Approaching",
        summary: "Several states have registration deadlines coming up this month. Ensure your voice is heard.",
        source: "CivicGuide Monitoring",
        publishedAt: new Date().toISOString(),
        category: "Alert"
      },
      {
        id: "2",
        title: "New Voting Technology in Key Districts",
        summary: "Election boards are implementing upgraded scanning technology to ensure accuracy and speed.",
        source: "Election Bureau",
        publishedAt: new Date().toISOString(),
        category: "Technology"
      }
    ];
    res.json(mockNews);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
