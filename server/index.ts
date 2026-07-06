import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import fs from "fs/promises";
import fsSync from "fs";
import os from "os";
import { promisify } from "util";
import JSZip from "jszip";

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadDotEnv() {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fsSync.existsSync(envPath)) {
      const content = fsSync.readFileSync(envPath, "utf-8");
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let val = match[2].trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          process.env[key] = val;
        }
      }
    }
  } catch (err) {
    console.error("Failed to load .env file:", err);
  }
}
loadDotEnv();

function openBrowser(url: string) {
  const start = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  const cmd = process.platform === "win32" ? `start "" "${url}"` : `${start} "${url}"`;
  exec(cmd, (err) => {
    if (err) {
      console.error(`Failed to open browser: ${err.message}`);
    }
  });
}

interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  children?: FileNode[];
  size?: number;
}

// Recursive helper to build tree structure
async function buildTree(dirPath: string): Promise<FileNode[]> {
  const nodes: FileNode[] = [];
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    for (const item of items) {
      // Exclude systemic, build and lock files/folders
      if (
        item.name === ".git" ||
        item.name === "node_modules" ||
        item.name === "__pycache__" ||
        item.name === "dist"
      ) {
        continue;
      }
      const fullPath = path.join(dirPath, item.name).replace(/\\/g, "/");
      const isDir = item.isDirectory();
      const node: FileNode = {
        name: item.name,
        path: fullPath,
        isDir,
      };
      if (isDir) {
        node.children = await buildTree(fullPath);
      } else {
        const stat = await fs.stat(fullPath);
        node.size = stat.size;
      }
      nodes.push(node);
    }
  } catch (err) {
    console.error("Error reading dir:", dirPath, err);
  }
  // Sort directories first, then files alphabetically
  return nodes.sort((a, b) => {
    if (a.isDir !== b.isDir) {
      return a.isDir ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

function getLibraryPath(): string {
  // Check local Library folder in project root
  const localLibrary = path.resolve(__dirname, "..", "Library");
  const localLibraryAlt = path.resolve(__dirname, "Library");
  
  if (fsSync.existsSync(localLibrary)) return localLibrary;
  if (fsSync.existsSync(localLibraryAlt)) return localLibraryAlt;
  
  // Fallback to E:\Library
  const eLibrary = "E:\\Library";
  if (fsSync.existsSync(eLibrary)) return eLibrary;
  
  // Default to project root Library path
  return localLibrary;
}

// Helper to recursively read all files from a directory and return { path, contents } objects
async function readFilesRecursively(dir: string, baseDir: string = dir): Promise<Array<{ path: string; contents: string }>> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: Array<{ path: string; contents: string }> = [];
  for (const entry of entries) {
    const resPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await readFilesRecursively(resPath, baseDir)));
    } else {
      const contents = await fs.readFile(resPath, "utf-8");
      const relativePath = path.relative(baseDir, resPath).replace(/\\/g, "/");
      files.push({ path: relativePath, contents });
    }
  }
  return files;
}

// Helper to parse search results from npx skills find output
function parseSearchOutput(stdout: string) {
  const skills = [];
  const lines = stdout.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Match: vercel-labs/agent-skills@vercel-react-best-practices 514.6K installs
    const match = trimmed.match(/^([^\s@]+)@([^\s]+)\s+([\d.]+)([KkMm]?)\s+installs/);
    if (match) {
      const source = match[1];
      const skillId = match[2];
      const installsNum = parseFloat(match[3]);
      const installsMultiplier = match[4].toUpperCase();
      
      let installs = installsNum;
      if (installsMultiplier === "K") installs *= 1000;
      if (installsMultiplier === "M") installs *= 1000000;
      
      skills.push({
        id: `${source}@${skillId}`,
        skillId: skillId,
        name: skillId,
        source: source,
        installs: Math.floor(installs),
        description: `Agentic skill package ${skillId} from repository ${source}`
      });
    }
  }
  return skills;
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // Return server-side environment variables to configure AI automatically
  app.get("/api/config", (req, res) => {
    res.json({
      success: true,
      geminiApiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "",
      openaiApiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || ""
    });
  });

  // Native folder selection dialog (Windows only)
  app.post("/api/workspace/browse", async (req, res) => {
    try {
      const command = `powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; $f = New-Object System.Windows.Forms.FolderBrowserDialog; $f.ShowNewFolderButton = $true; $f.Description = 'Select AgentForge Workspace Folder'; [void]$f.ShowDialog(); $f.SelectedPath"`;
      const { stdout } = await execAsync(command);
      const selectedPath = stdout.trim().replace(/\\/g, "/");
      
      if (selectedPath) {
        res.json({ success: true, path: selectedPath });
      } else {
        res.json({ success: false, error: "No folder selected" });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Import .skill archive or handle text skill
  app.post("/api/library/import-skill", async (req, res) => {
    let tempZipPath = "";
    try {
      const { filename, base64Data, overwrite } = req.body;
      if (!filename || !base64Data) {
        return res.status(400).json({ success: false, error: "Missing filename or base64Data" });
      }

      const buffer = Buffer.from(base64Data, "base64");
      
      // Determine if it is a ZIP archive by checking magic bytes (50 4B 03 04)
      const isZip = buffer.length >= 4 && 
                    buffer[0] === 0x50 && 
                    buffer[1] === 0x4B && 
                    buffer[2] === 0x03 && 
                    buffer[3] === 0x04;

      if (!isZip) {
        // It's just a text file. Return the content to be opened in a new tab.
        const textContent = buffer.toString("utf-8");
        return res.json({ success: true, isZip: false, content: textContent });
      }

      // It is a ZIP archive. Save to a temporary file.
      const tempDir = os.tmpdir();
      tempZipPath = path.join(tempDir, `temp-${Date.now()}-${filename}.zip`);
      await fs.writeFile(tempZipPath, buffer);

      // List ZIP contents using .NET System.IO.Compression via PowerShell
      const listCommand = `powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::OpenRead('${tempZipPath.replace(/\\/g, "/")}') .Entries | ForEach-Object { $_.FullName }"`;
      const { stdout } = await execAsync(listCommand);
      const entries = stdout.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith("__MACOSX") && !line.includes(".DS_Store"));

      if (entries.length === 0) {
        throw new Error("The archive is empty or invalid.");
      }

      // Check if all entries share a common top-level directory
      let commonRoot = "";
      const firstEntry = entries[0];
      const firstSlashIdx = firstEntry.indexOf("/");
      if (firstSlashIdx > 0) {
        const rootCandidate = firstEntry.substring(0, firstSlashIdx);
        const allShareRoot = entries.every(entry => entry.startsWith(rootCandidate + "/"));
        if (allShareRoot) {
          commonRoot = rootCandidate;
        }
      }

      // Determine final skill folder name
      let skillFolderName = "";
      if (commonRoot) {
        skillFolderName = commonRoot;
      } else {
        // Flat zip. Use the archive filename sanitized.
        skillFolderName = filename.replace(/\.skill$/i, "").replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
      }

      // Library skills base directory
      const skillsBaseDir = path.join(getLibraryPath(), "Skills").replace(/\\/g, "/");
      await fs.mkdir(skillsBaseDir, { recursive: true });

      const targetSkillDir = path.join(skillsBaseDir, skillFolderName).replace(/\\/g, "/");
      const targetExists = fsSync.existsSync(targetSkillDir);

      if (targetExists && !overwrite) {
        // Request confirmation before overwriting
        await fs.unlink(tempZipPath).catch(() => {});
        return res.json({ success: true, isZip: true, exists: true, skillName: skillFolderName });
      }

      // Extract ZIP using PowerShell
      let extractCommand = "";
      if (commonRoot) {
        // Has common root, extract directly to Library/Skills
        extractCommand = `powershell -NoProfile -Command "Expand-Archive -Path '${tempZipPath.replace(/\\/g, "/")}' -DestinationPath '${skillsBaseDir}' -Force"`;
      } else {
        // Flat zip, extract into a dedicated directory
        extractCommand = `powershell -NoProfile -Command "New-Item -ItemType Directory -Force -Path '${targetSkillDir}'; Expand-Archive -Path '${tempZipPath.replace(/\\/g, "/")}' -DestinationPath '${targetSkillDir}' -Force"`;
      }

      await execAsync(extractCommand);
      await fs.unlink(tempZipPath).catch(() => {});

      return res.json({ success: true, isZip: true, extracted: true, skillName: skillFolderName });
    } catch (err: any) {
      if (tempZipPath && fsSync.existsSync(tempZipPath)) {
        await fs.unlink(tempZipPath).catch(() => {});
      }
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Format python/javascript code
  app.post("/api/workspace/format", async (req, res) => {
    try {
      const { code, filepath } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, error: "Missing code" });
      }

      const ext = path.extname(filepath || "").toLowerCase();

      if (ext === ".js" || ext === ".json") {
        const tempFile = path.join(os.tmpdir(), `temp-${Date.now()}${ext}`);
        await fs.writeFile(tempFile, code);
        try {
          const { stdout } = await execAsync(`npx prettier "${tempFile.replace(/\\/g, "/")}"`);
          await fs.unlink(tempFile).catch(() => {});
          return res.json({ success: true, formatted: stdout });
        } catch (err: any) {
          await fs.unlink(tempFile).catch(() => {});
          return res.json({ success: false, error: err.message, original: code });
        }
      } else if (ext === ".py") {
        const tempFile = path.join(os.tmpdir(), `temp-${Date.now()}.py`);
        await fs.writeFile(tempFile, code);
        try {
          await execAsync(`black "${tempFile.replace(/\\/g, "/")}"`);
          const formatted = await fs.readFile(tempFile, "utf-8");
          await fs.unlink(tempFile).catch(() => {});
          return res.json({ success: true, formatted });
        } catch (blackErr) {
          try {
            await execAsync(`autopep8 --in-place "${tempFile.replace(/\\/g, "/")}"`);
            const formatted = await fs.readFile(tempFile, "utf-8");
            await fs.unlink(tempFile).catch(() => {});
            return res.json({ success: true, formatted });
          } catch (pepErr) {
            // Fallback: strip trailing whitespace
            const lines = code.split(/\r?\n/);
            const formattedLines = lines.map((line: string) => line.trimEnd());
            const formatted = formattedLines.join("\n");
            await fs.unlink(tempFile).catch(() => {});
            return res.json({ success: true, formatted });
          }
        }
      } else {
        return res.json({ success: true, formatted: code });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── Workspace & Library API Endpoints ────────────────────────────────────

  // Get library skill packages categorised by parent folders
  app.get("/api/library", async (req, res) => {
    try {
      const libPath = getLibraryPath().replace(/\\/g, "/");
      // Ensure directory exists
      await fs.mkdir(libPath, { recursive: true });
      const items = await fs.readdir(libPath, { withFileTypes: true });
      
      const categories: Record<string, string[]> = {};
      
      // Recursive function to scan subdirectories for skill.md / SKILL.md
      const scanCategoryDir = async (dirPath: string, relativePrefix: string = ""): Promise<string[]> => {
        const results: string[] = [];
        try {
          const subItems = await fs.readdir(dirPath, { withFileTypes: true });
          for (const sub of subItems) {
            if (sub.isDirectory() && (!sub.name.startsWith(".") || sub.name === ".agents")) {
              const fullSubPath = path.join(dirPath, sub.name);
              const hasSkillMd = fsSync.existsSync(path.join(fullSubPath, "SKILL.md")) || 
                                 fsSync.existsSync(path.join(fullSubPath, "skill.md"));
              
              const relPath = relativePrefix ? `${relativePrefix}/${sub.name}` : sub.name;
              if (hasSkillMd) {
                // Found skill.md / SKILL.md in root, this is a skill package
                results.push(relPath);
              } else {
                // Category/collection directory, recurse into it
                const nested = await scanCategoryDir(fullSubPath, relPath);
                results.push(...nested);
              }
            }
          }
        } catch (e) {
          // ignore
        }
        return results;
      }

      for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith(".")) {
          const categoryPath = path.join(libPath, item.name);
          categories[item.name] = await scanCategoryDir(categoryPath);
        }
      }
      
      // Load installed_skills.json and include full package IDs
      const dbPath = path.join(process.cwd(), "installed_skills.json");
      try {
        const content = await fs.readFile(dbPath, "utf-8");
        const db = JSON.parse(content);
        if (db && Array.isArray(db.installed)) {
          if (!categories["Skills"]) {
            categories["Skills"] = [];
          }
          for (const item of db.installed) {
            if (item.id && !categories["Skills"].includes(item.id)) {
              categories["Skills"].push(item.id);
            }
          }
        }
      } catch (err) {
        // file doesn't exist, ignore
      }
      
      res.json({ success: true, path: libPath, categories });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Install a skill from skills.sh into the local library
  app.post("/api/library/install", async (req, res) => {
    try {
      const { skillId, name, description, version, content, category, files } = req.body;
      if (!skillId || !name) {
        return res.status(400).json({ success: false, error: "Missing skillId or name" });
      }
      
      const idStr = String(skillId); // e.g. vercel-labs/agent-skills@vercel-react-best-practices
      const [pkgName, skillName] = idStr.includes("@") ? idStr.split("@") : [idStr, name];
      
      const parentFolder = category || "Skills";
      const libPath = getLibraryPath().replace(/\\/g, "/");
      const cleanFolder = skillName;
      const targetDir = path.join(libPath, parentFolder, cleanFolder).replace(/\\/g, "/");
      const projectAgentsDir = path.join(process.cwd(), ".agents", "skills", cleanFolder).replace(/\\/g, "/");
      
      // Create target directories recursively
      await fs.mkdir(targetDir, { recursive: true });
      await fs.mkdir(projectAgentsDir, { recursive: true });
      
      if (files && Array.isArray(files) && files.length > 0) {
        // Write all downloaded files from skills.sh snapshot to both library and project .agents/skills
        for (const file of files) {
          const filePath = path.join(targetDir, file.path).replace(/\\/g, "/");
          // Ensure parent directory for this file exists
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          await fs.writeFile(filePath, file.contents || "", "utf-8");

          // Also write to local project agents folder
          const agentFilePath = path.join(projectAgentsDir, file.path).replace(/\\/g, "/");
          await fs.mkdir(path.dirname(agentFilePath), { recursive: true });
          await fs.writeFile(agentFilePath, file.contents || "", "utf-8");
        }
      } else {
        // Fallback/Legacy installer behavior
        await fs.mkdir(path.join(targetDir, "scripts"), { recursive: true });
        await fs.mkdir(path.join(targetDir, "references"), { recursive: true });
        await fs.mkdir(path.join(targetDir, "assets"), { recursive: true });
        
        await fs.mkdir(path.join(projectAgentsDir, "scripts"), { recursive: true });
        await fs.mkdir(path.join(projectAgentsDir, "references"), { recursive: true });
        await fs.mkdir(path.join(projectAgentsDir, "assets"), { recursive: true });

        const skillFileContent = `---
name: "${name}"
description: "${description || ""}"
version: "${version || "1.0.0"}"
---
# ${name}

${content || `## Purpose\nThis skill helps with ${name.toLowerCase()}.\n`}
`;
        await fs.writeFile(path.join(targetDir, "SKILL.md"), skillFileContent, "utf-8");
        await fs.writeFile(path.join(projectAgentsDir, "SKILL.md"), skillFileContent, "utf-8");
      }
      
      // 2. Write/append to installed_skills.json database
      const dbPath = path.join(process.cwd(), "installed_skills.json");
      let db: { installed: any[] } = { installed: [] };
      try {
        const dbContent = await fs.readFile(dbPath, "utf-8");
        db = JSON.parse(dbContent);
      } catch (err) {
        // file doesn't exist
      }
      
      // Remove any existing entry for this skillId
      db.installed = (db.installed || []).filter((item: any) => item.id !== idStr);
      
      db.installed.push({
        id: idStr,
        skillId: skillName,
        name: name,
        description: description || "",
        version: version || "1.0.0",
        installedAt: new Date().toISOString(),
        files: (files || []).map((f: any) => ({ path: f.path, contents: f.contents }))
      });
      
      await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");
      
      res.json({ success: true, path: targetDir });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Proxy search requests to skills.sh using the REST API
  app.get("/api/library/search", async (req, res) => {
    try {
      const { q } = req.query;
      const queryStr = q ? String(q).trim() : "agent";
      
      const response = await fetch(`https://skills-api-integration.vercel.app/api/skills/search?q=${encodeURIComponent(queryStr)}&limit=25`);
      if (!response.ok) {
        throw new Error(`Failed to fetch from skills.sh API: ${response.statusText}`);
      }
      
      const result = await response.json() as { data: any[] };
      const skills = (result.data || []).map((item: any) => {
        // The frontend expects the format owner/repo@skill, where owner/repo is the package/repo source, and skill is the slug/name
        const parts = item.id.split("/");
        let source = item.source || "";
        let skillId = item.slug || item.name || "";
        if (parts.length >= 3) {
          source = `${parts[0]}/${parts[1]}`;
          skillId = parts.slice(2).join("/");
        }
        
        return {
          id: `${source}@${skillId}`,
          skillId: skillId,
          name: skillId,
          source: source,
          installs: Math.floor(item.installs || 0),
          description: item.description || `Agentic skill package ${skillId} from repository ${source}`
        };
      });
      
      res.json({ success: true, data: { skills } });
    } catch (err: any) {
      console.error("Search proxy failed:", err);
      res.json({ success: true, data: { skills: [] } });
    }
  });

  // Proxy download requests to skills.sh using the REST API
  app.get("/api/library/download", async (req, res) => {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ success: false, error: "Missing id parameter" });
      }
      
      const idStr = String(id);
      if (!idStr.includes("@")) {
        return res.status(400).json({ success: false, error: "Invalid skill ID format. Expected owner/repo@skill" });
      }
      
      const [pkgName, skillId] = idStr.split("@");
      
      const response = await fetch(`https://skills-api-integration.vercel.app/api/skills/${pkgName}/${skillId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch skill details from skills.sh API: ${response.statusText}`);
      }
      
      const result = await response.json() as { files: Array<{ path: string; contents: string }> };
      if (!result.files || !Array.isArray(result.files)) {
        throw new Error(`Invalid response format from skills.sh API: missing files`);
      }
      
      res.json({
        success: true,
        data: {
          id: idStr,
          files: result.files
        }
      });
    } catch (err: any) {
      console.error("Download proxy failed:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Open directory and return file tree structure
  app.post("/api/workspace/open", async (req, res) => {
    try {
      const { dirPath } = req.body;
      if (!dirPath) {
        return res.status(400).json({ success: false, error: "Missing dirPath" });
      }
      const absolutePath = path.resolve(dirPath).replace(/\\/g, "/");
      if (!fsSync.existsSync(absolutePath)) {
        return res.status(404).json({ success: false, error: "Directory does not exist" });
      }
      const tree = await buildTree(absolutePath);
      
      let isGit = false;
      try {
        await fs.access(path.join(absolutePath, ".git"));
        isGit = true;
      } catch {}
      
      res.json({ success: true, path: absolutePath, tree, isGit });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Read file contents
  app.post("/api/workspace/file/read", async (req, res) => {
    try {
      const { filePath } = req.body;
      if (!filePath) {
        return res.status(400).json({ success: false, error: "Missing filePath" });
      }
      const content = await fs.readFile(filePath, "utf-8");
      res.json({ success: true, content });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Write file contents
  app.post("/api/workspace/file/write", async (req, res) => {
    try {
      const { filePath, content } = req.body;
      if (!filePath || content === undefined) {
        return res.status(400).json({ success: false, error: "Missing filePath or content" });
      }
      await fs.writeFile(filePath, content, "utf-8");
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Copy directory helper
  async function copyDir(src: string, dest: string) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  // Initialize a new temporary workspace
  app.post("/api/workspace/temporary", async (req, res) => {
    try {
      const tempDirName = `temp_workspace_${Date.now()}`;
      const tempPath = path.join(os.tmpdir(), tempDirName).replace(/\\/g, "/");
      await fs.mkdir(tempPath, { recursive: true });
      
      const defaultFilePath = path.join(tempPath, "README.md").replace(/\\/g, "/");
      await fs.writeFile(defaultFilePath, "# Welcome to your Temporary Workspace\n\nDescribe your project and build it with AI!", "utf-8");
      
      res.json({ 
        success: true, 
        workspacePath: tempPath,
        filePath: defaultFilePath
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save temporary workspace to Library Workspaces
  app.post("/api/workspace/save-temporary", async (req, res) => {
    try {
      const { tempPath, workspaceName, newFileName, activeFileContent, scaffoldingRef } = req.body;
      if (!tempPath || !workspaceName || !newFileName) {
        return res.status(400).json({ success: false, error: "Missing required parameters: tempPath, workspaceName, newFileName" });
      }

      // Sanitize workspace folder name
      const sanitizedWorkspaceName = workspaceName.trim()
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .replace(/_+/g, "_")
        .toLowerCase();

      // Sanitize new filename
      let sanitizedFileName = newFileName.trim()
        .replace(/[^a-zA-Z0-9-_.]/g, "_")
        .replace(/_+/g, "_");
      if (!sanitizedFileName) {
        sanitizedFileName = "README.md";
      }
      if (!path.extname(sanitizedFileName)) {
        sanitizedFileName += ".md";
      }

      // Library Workspaces path
      const libraryPath = getLibraryPath();
      const workspacesDir = path.join(libraryPath, "Workspaces").replace(/\\/g, "/");
      const targetWorkspacePath = path.join(workspacesDir, sanitizedWorkspaceName).replace(/\\/g, "/");

      if (fsSync.existsSync(targetWorkspacePath)) {
        return res.status(400).json({ success: false, error: "A workspace with this name already exists in your Library." });
      }

      // Create target directory
      await fs.mkdir(targetWorkspacePath, { recursive: true });

      // Copy all existing files in temp path
      if (fsSync.existsSync(tempPath)) {
        await copyDir(tempPath, targetWorkspacePath);
      }

      // Delete default README.md in destination if it was renamed
      if (sanitizedFileName !== "README.md") {
        const oldDefaultDest = path.join(targetWorkspacePath, "README.md").replace(/\\/g, "/");
        if (fsSync.existsSync(oldDefaultDest)) {
          await fs.unlink(oldDefaultDest);
        }
      }

      // Write active file content to the destination path
      const newFileDestPath = path.join(targetWorkspacePath, sanitizedFileName).replace(/\\/g, "/");
      await fs.writeFile(newFileDestPath, activeFileContent || "", "utf-8");

      // Generate list of files and folders in dest
      const listFolderContents = async (dir: string): Promise<string[]> => {
        const results: string[] = [];
        const items = await fs.readdir(dir, { withFileTypes: true });
        for (const item of items) {
          if (item.name === `${sanitizedWorkspaceName}.aws`) continue;
          if (item.isDirectory()) {
            results.push(`[Folder] ${item.name}/`);
            const sub = await listFolderContents(path.join(dir, item.name));
            results.push(...sub.map(s => `  ${s}`));
          } else {
            results.push(`[File] ${item.name}`);
          }
        }
        return results;
      };

      const folderStructure = await listFolderContents(targetWorkspacePath);

      // Create the .AWS file
      const awsData = {
        name: workspaceName,
        folderName: sanitizedWorkspaceName,
        created: new Date().toISOString(),
        originalTempPath: tempPath,
        location: targetWorkspacePath,
        primaryFile: sanitizedFileName,
        scaffoldingRef: scaffoldingRef || "Scaffolded Workspace",
        structure: folderStructure
      };

      const awsFilePath = path.join(targetWorkspacePath, `${sanitizedWorkspaceName}.aws`).replace(/\\/g, "/");
      await fs.writeFile(awsFilePath, JSON.stringify(awsData, null, 2), "utf-8");

      res.json({
        success: true,
        workspacePath: targetWorkspacePath,
        filePath: newFileDestPath,
        sanitizedWorkspaceName,
        sanitizedFileName
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create file or directory
  app.post("/api/workspace/file/create", async (req, res) => {
    try {
      const { parentPath, name, isDir } = req.body;
      if (!parentPath || !name) {
        return res.status(400).json({ success: false, error: "Missing parentPath or name" });
      }
      const targetPath = path.join(parentPath, name).replace(/\\/g, "/");
      if (isDir) {
        await fs.mkdir(targetPath, { recursive: true });
      } else {
        // Ensure parent directories exist recursively before writing the file
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, "", "utf-8");
      }
      res.json({ success: true, path: targetPath });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete file or directory recursively
  app.post("/api/workspace/file/delete", async (req, res) => {
    try {
      const { targetPath } = req.body;
      if (!targetPath) {
        return res.status(400).json({ success: false, error: "Missing targetPath" });
      }
      await fs.rm(targetPath, { recursive: true, force: true });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Rename or move file or directory
  app.post("/api/workspace/file/rename", async (req, res) => {
    try {
      const { oldPath, newName } = req.body;
      if (!oldPath || !newName) {
        return res.status(400).json({ success: false, error: "Missing oldPath or newName" });
      }
      const dir = path.dirname(oldPath);
      const newPath = path.join(dir, newName).replace(/\\/g, "/");
      await fs.rename(oldPath, newPath);
      res.json({ success: true, path: newPath });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Initialize git repository
  app.post("/api/workspace/git/init", async (req, res) => {
    try {
      const { dirPath } = req.body;
      if (!dirPath) {
        return res.status(400).json({ success: false, error: "Missing dirPath" });
      }
      exec("git init", { cwd: dirPath }, (err, stdout, stderr) => {
        if (err) {
          return res.status(500).json({ success: false, error: stderr || err.message });
        }
        res.json({ success: true, output: stdout });
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get git status and commit logs
  app.post("/api/workspace/git/status", async (req, res) => {
    try {
      const { dirPath } = req.body;
      if (!dirPath) {
        return res.status(400).json({ success: false, error: "Missing dirPath" });
      }
      exec("git status -s", { cwd: dirPath }, (err, statusStdout) => {
        const status = statusStdout || "";
        exec("git log -n 10 --oneline", { cwd: dirPath }, (errLog, logStdout) => {
          const log = logStdout || "";
          res.json({ success: true, status, log });
        });
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Stage and commit files
  app.post("/api/workspace/git/commit", async (req, res) => {
    try {
      const { dirPath, message } = req.body;
      if (!dirPath || !message) {
        return res.status(400).json({ success: false, error: "Missing dirPath or message" });
      }
      exec("git add .", { cwd: dirPath }, (errAdd, stdoutAdd, stderrAdd) => {
        if (errAdd) {
          return res.status(500).json({ success: false, error: stderrAdd || errAdd.message });
        }
        const cleanMessage = message.replace(/"/g, '\\"');
        exec(`git commit -m "${cleanMessage}"`, { cwd: dirPath }, (errCommit, stdoutCommit, stderrCommit) => {
          if (errCommit) {
            return res.status(500).json({ success: false, error: stderrCommit || errCommit.message });
          }
          res.json({ success: true, output: stdoutCommit });
        });
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/workspace/build-package", async (req, res) => {
    try {
      const { workspacePath } = req.body;
      if (!workspacePath) {
        return res.status(400).json({ success: false, error: "Missing workspacePath" });
      }

      const absoluteWorkspacePath = path.resolve(workspacePath).replace(/\\/g, "/");
      if (!fsSync.existsSync(absoluteWorkspacePath)) {
        return res.status(400).json({ success: false, error: "Workspace path does not exist" });
      }

      const workspaceFolderName = absoluteWorkspacePath.split("/").pop() || "Workspace";
      const sanitizedName = workspaceFolderName.replace(/[^a-zA-Z0-9_-]/g, "_");

      // Attempt to find version from SKILL.md / skill.md or package.json
      let version = "1.0.0";
      const skillMdPath = path.join(absoluteWorkspacePath, "SKILL.md");
      const skillMdPathLower = path.join(absoluteWorkspacePath, "skill.md");
      const packageJsonPath = path.join(absoluteWorkspacePath, "package.json");

      if (fsSync.existsSync(skillMdPath)) {
        const content = await fs.readFile(skillMdPath, "utf-8");
        const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
        if (match) {
          const versionMatch = match[1].match(/version:\s*["']?(\d+\.\d+\.\d+)["']?/);
          if (versionMatch) {
            version = versionMatch[1];
          }
        }
      } else if (fsSync.existsSync(skillMdPathLower)) {
        const content = await fs.readFile(skillMdPathLower, "utf-8");
        const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
        if (match) {
          const versionMatch = match[1].match(/version:\s*["']?(\d+\.\d+\.\d+)["']?/);
          if (versionMatch) {
            version = versionMatch[1];
          }
        }
      } else if (fsSync.existsSync(packageJsonPath)) {
        try {
          const content = await fs.readFile(packageJsonPath, "utf-8");
          const pkg = JSON.parse(content);
          if (pkg && pkg.version) {
            version = pkg.version;
          }
        } catch (e) {
          // ignore
        }
      }

      const zipName = `${sanitizedName}+${version}.skill`;
      const releasesDir = path.join(getLibraryPath(), "Releases").replace(/\\/g, "/");
      await fs.mkdir(releasesDir, { recursive: true });
      const targetZipPath = path.join(releasesDir, zipName).replace(/\\/g, "/");

      const zip = new JSZip();
      
      const excludePatterns = [
        'node_modules', '.git', '.github', 'dist', 'build', '.next', '.venv',
        'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', '.DS_Store', 'Thumbs.db'
      ];

      // Recursive function to add files to JSZip
      const addDirToZip = async (currentDirPath: string, zipFolderPath: string = "") => {
        const items = await fs.readdir(currentDirPath, { withFileTypes: true });
        for (const item of items) {
          if (excludePatterns.includes(item.name) || item.name.startsWith(".")) {
            continue;
          }
          const fullPath = path.join(currentDirPath, item.name);
          const zipPath = zipFolderPath ? `${zipFolderPath}/${item.name}` : item.name;

          if (item.isDirectory()) {
            await addDirToZip(fullPath, zipPath);
          } else {
            const fileData = await fs.readFile(fullPath);
            zip.file(zipPath, fileData);
          }
        }
      };

      await addDirToZip(absoluteWorkspacePath);

      // Generate zip archive as a nodebuffer
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 9 } });
      await fs.writeFile(targetZipPath, zipBuffer);

      res.json({ success: true, zipName, targetZipPath });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Parse YAML in SKILL.md and bump SemVer version
  app.post("/api/workspace/version/bump", async (req, res) => {
    try {
      const { filePath, bumpType } = req.body;
      if (!filePath || !bumpType) {
        return res.status(400).json({ success: false, error: "Missing filePath or bumpType" });
      }
      
      let content = await fs.readFile(filePath, "utf-8");
      const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
      const match = content.match(frontmatterRegex);
      
      if (!match) {
        return res.status(400).json({ success: false, error: "No YAML frontmatter found in file" });
      }
      
      const frontmatter = match[1];
      const versionMatch = frontmatter.match(/version:\s*["']?(\d+\.\d+\.\d+)["']?/);
      
      let currentVersion = "1.0.0";
      if (versionMatch) {
        currentVersion = versionMatch[1];
      }
      
      const parts = currentVersion.split(".").map(Number);
      if (bumpType === "major") {
        parts[0]++;
        parts[1] = 0;
        parts[2] = 0;
      } else if (bumpType === "minor") {
        parts[1]++;
        parts[2] = 0;
      } else {
        parts[2]++;
      }
      
      const newVersion = parts.join(".");
      let newFrontmatter = "";
      if (versionMatch) {
        newFrontmatter = frontmatter.replace(/version:\s*["']?(\d+\.\d+\.\d+)["']?/, `version: "${newVersion}"`);
      } else {
        newFrontmatter = frontmatter + `\nversion: "${newVersion}"`;
      }
      
      content = content.replace(match[0], `---\n${newFrontmatter}\n---\n`);
      await fs.writeFile(filePath, content, "utf-8");
      
      // Also update extension.json if it exists in the same folder
      let updatedExtensionJson = false;
      const dirPath = path.dirname(filePath);
      const extJsonPath = path.join(dirPath, "extension.json");
      try {
        const stats = await fs.stat(extJsonPath);
        if (stats.isFile()) {
          const extContent = await fs.readFile(extJsonPath, "utf-8");
          const extJson = JSON.parse(extContent);
          extJson.version = newVersion;
          await fs.writeFile(extJsonPath, JSON.stringify(extJson, null, 2), "utf-8");
          updatedExtensionJson = true;
        }
      } catch (e) {
        // extension.json doesn't exist or is invalid JSON; ignore and proceed
      }
      
      res.json({ success: true, oldVersion: currentVersion, newVersion, updatedExtensionJson });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all non-asset routes
  app.get("*", (req, res) => {
    // Return 404 for missing static asset resource requests to avoid MIME errors
    const isAsset = req.path.startsWith("/assets/") || 
                    /\.(js|css|png|jpg|jpeg|gif|svg|ico|json|map)$/i.test(req.path);
    if (isAsset) {
      return res.status(404).send("Not Found");
    }
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
