import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function openBrowser(url: string) {
  const start = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  const cmd = process.platform === "win32" ? `start "" "${url}"` : `${start} "${url}"`;
  exec(cmd, (err) => {
    if (err) {
      console.error(`Failed to open browser: ${err.message}`);
    }
  });
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  let port = parseInt(process.env.PORT || "3000", 10);

  function listen(portToTry: number) {
    server.listen(portToTry, () => {
      const url = `http://localhost:${portToTry}/`;
      console.log(`Server running on ${url}`);
      // Open browser in production mode on start
      if (process.env.NODE_ENV === "production") {
        openBrowser(url);
      }
    });
  }

  server.on("error", (e: any) => {
    if (e.code === "EADDRINUSE") {
      console.log(`Port ${port} is occupied. Trying port ${port + 1}...`);
      port++;
      listen(port);
    } else {
      console.error("Server error:", e);
    }
  });

  listen(port);
}

startServer().catch(console.error);
