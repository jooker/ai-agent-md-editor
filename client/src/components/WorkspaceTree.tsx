import React, { useState, useEffect } from "react";
import { 
  Folder, 
  FolderOpen, 
  File, 
  FileText, 
  Plus, 
  FolderPlus, 
  Trash2, 
  Edit3, 
  GitBranch, 
  Tag, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight, 
  X, 
  Check,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  children?: FileNode[];
  size?: number;
}

interface WorkspaceTreeProps {
  dirPath: string;
  onOpenFile: (filePath: string) => void;
  activeFilePath?: string;
  refreshTrigger?: number;
  gitEnabled?: boolean;
}

export function WorkspaceTree({ dirPath, onOpenFile, activeFilePath, refreshTrigger, gitEnabled }: WorkspaceTreeProps) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  
  // Git state
  const [isGit, setIsGit] = useState(false);
  const [gitStatus, setGitStatus] = useState<string>("");
  const [gitLog, setGitLog] = useState<string>("");
  const [commitMessage, setCommitMessage] = useState("");
  const [showGitPanel, setShowGitPanel] = useState(false);
  
  // File creation state
  const [newItemPath, setNewItemPath] = useState<{ parent: string; isDir: boolean } | null>(null);
  const [newItemName, setNewItemName] = useState("");
  
  // Rename state
  const [renameItem, setRenameItem] = useState<FileNode | null>(null);
  const [renameName, setRenameName] = useState("");

  // Delete confirmation
  const [deleteItem, setDeleteItem] = useState<FileNode | null>(null);

  // Load directory tree
  const loadTree = async () => {
    if (!dirPath) return;
    setLoading(true);
    try {
      const res = await fetch("/api/workspace/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dirPath })
      });
      const data = await res.json();
      if (data.success) {
        setTree(data.tree);
        setIsGit(data.isGit);
        if (data.isGit) {
          loadGitStatus();
        }
      } else {
        toast.error("Failed to load workspace tree: " + data.error);
      }
    } catch (err: any) {
      toast.error("Error connecting to server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadGitStatus = async () => {
    try {
      const res = await fetch("/api/workspace/git/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dirPath })
      });
      const data = await res.json();
      if (data.success) {
        setGitStatus(data.status);
        setGitLog(data.log);
      }
    } catch (err) {}
  };

  useEffect(() => {
    loadTree();
  }, [dirPath, refreshTrigger]);

  const toggleExpand = (path: string) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Create file/folder
  const handleCreateItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItemName.trim() || !newItemPath) return;

    try {
      const res = await fetch("/api/workspace/file/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentPath: newItemPath.parent,
          name: newItemName.trim(),
          isDir: newItemPath.isDir
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Created ${newItemPath.isDir ? "folder" : "file"} successfully`);
        setNewItemPath(null);
        setNewItemName("");
        loadTree();
        if (!newItemPath.isDir) {
          onOpenFile(data.path);
        }
      } else {
        toast.error("Creation failed: " + data.error);
      }
    } catch (err: any) {
      toast.error("Error creating item: " + err.message);
    }
  };

  // Rename item
  const handleRename = async () => {
    if (!renameItem || !renameName.trim()) return;
    try {
      const res = await fetch("/api/workspace/file/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPath: renameItem.path,
          newName: renameName.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Renamed successfully");
        setRenameItem(null);
        setRenameName("");
        loadTree();
      } else {
        toast.error("Rename failed: " + data.error);
      }
    } catch (err: any) {
      toast.error("Error renaming item: " + err.message);
    }
  };

  // Delete item
  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      const res = await fetch("/api/workspace/file/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPath: deleteItem.path })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Deleted successfully");
        setDeleteItem(null);
        loadTree();
      } else {
        toast.error("Deletion failed: " + data.error);
      }
    } catch (err: any) {
      toast.error("Error deleting item: " + err.message);
    }
  };

  // Initialize Git
  const handleGitInit = async () => {
    try {
      const res = await fetch("/api/workspace/git/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dirPath })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Initialized Git repository");
        loadTree();
      } else {
        toast.error("Git init failed: " + data.error);
      }
    } catch (err: any) {
      toast.error("Error initializing Git: " + err.message);
    }
  };

  // Commit Git
  const handleGitCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;

    try {
      const res = await fetch("/api/workspace/git/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dirPath, message: commitMessage })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Staged and committed all changes");
        setCommitMessage("");
        loadGitStatus();
      } else {
        toast.error("Commit failed: " + data.error);
      }
    } catch (err: any) {
      toast.error("Error committing: " + err.message);
    }
  };

  // SemVer Bump
  const handleVersionBump = async (bumpType: "major" | "minor" | "patch") => {
    // Look for SKILL.md in tree
    const skillFile = tree.find(n => n.name.toLowerCase() === "skill.md");
    if (!skillFile) {
      toast.error("SKILL.md not found in the root directory to bump version");
      return;
    }
    
    try {
      const res = await fetch("/api/workspace/version/bump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: skillFile.path, bumpType })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Bumped version from ${data.oldVersion} to ${data.newVersion}`);
        loadTree();
        // If it's open, reload it in the tabs
        onOpenFile(skillFile.path);
      } else {
        toast.error("Version bump failed: " + data.error);
      }
    } catch (err: any) {
      toast.error("Error bumping version: " + err.message);
    }
  };

  // Determine Git status colors
  const getGitColorClass = (filePath: string) => {
    if (!gitStatus) return "";
    const relPath = filePath.replace(dirPath, "").replace(/^\//, "");
    
    const lines = gitStatus.split("\n");
    for (const line of lines) {
      if (line.includes(relPath)) {
        const code = line.trim().substring(0, 2);
        if (code.includes("M")) return "text-amber-500 font-medium"; // Modified
        if (code.includes("A") || code.includes("?")) return "text-emerald-500 font-medium"; // Untracked/Added
        if (code.includes("D")) return "line-through text-rose-500 opacity-60"; // Deleted
      }
    }
    return "";
  };

  // Recursive Tree Node Renderer
  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expanded[node.path];
    const isFileActive = activeFilePath === node.path;
    const gitColorClass = getGitColorClass(node.path);

    if (node.isDir) {
      return (
        <div key={node.path} className="select-none">
          <div 
            style={{ paddingLeft: `${depth * 12 + 6}px` }}
            className={`flex items-center justify-between py-1.5 hover:bg-muted/50 rounded group cursor-pointer text-sm transition-colors duration-150`}
          >
            <div 
              className="flex items-center gap-1.5 flex-1 min-w-0"
              onClick={() => toggleExpand(node.path)}
            >
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
              {isExpanded ? <FolderOpen className="h-4 w-4 text-amber-500 fill-amber-500/20" /> : <Folder className="h-4 w-4 text-amber-500 fill-amber-500/20" />}
              <span className="truncate font-medium text-foreground">{node.name}</span>
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-1 transition-opacity duration-150">
              <button 
                title="New File"
                onClick={() => setNewItemPath({ parent: node.path, isDir: false })}
                className="hover:bg-muted p-0.5 rounded text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" />
              </button>
              <button 
                title="New Folder"
                onClick={() => setNewItemPath({ parent: node.path, isDir: true })}
                className="hover:bg-muted p-0.5 rounded text-muted-foreground hover:text-foreground"
              >
                <FolderPlus className="h-3 w-3" />
              </button>
              <button 
                title="Rename"
                onClick={() => { setRenameItem(node); setRenameName(node.name); }}
                className="hover:bg-muted p-0.5 rounded text-muted-foreground hover:text-foreground"
              >
                <Edit3 className="h-3 w-3" />
              </button>
              <button 
                title="Delete"
                onClick={() => setDeleteItem(node)}
                className="hover:bg-muted p-0.5 rounded text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
          
          {/* Create new item input inside folder */}
          {newItemPath?.parent === node.path && (
            <div style={{ paddingLeft: `${(depth + 1) * 12 + 6}px` }} className="py-1">
              <form onSubmit={handleCreateItem} className="flex items-center gap-1">
                {newItemPath.isDir ? <Folder className="h-3.5 w-3.5 text-amber-500/80" /> : <File className="h-3.5 w-3.5 text-muted-foreground/80" />}
                <Input
                  autoFocus
                  placeholder={newItemPath.isDir ? "Folder name..." : "File name..."}
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="h-6 text-xs py-0.5 px-1 bg-background border-border/80"
                />
                <Button type="submit" size="icon" className="h-6 w-6 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  onClick={() => setNewItemPath(null)} 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          )}

          {isExpanded && node.children && (
            <div className="border-l border-border/20 ml-2">
              {node.children.map(child => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={node.path}>
        <div 
          style={{ paddingLeft: `${depth * 12 + 6}px` }}
          className={`flex items-center justify-between py-1 hover:bg-muted/50 rounded group cursor-pointer text-sm transition-colors duration-150 ${isFileActive ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium" : ""}`}
        >
          <div 
            className="flex items-center gap-1.5 flex-1 min-w-0"
            onClick={() => onOpenFile(node.path)}
          >
            <FileText className={`h-3.5 w-3.5 shrink-0 ${isFileActive ? "text-amber-500" : "text-muted-foreground"}`} />
            <span className={`truncate ${gitColorClass}`}>{node.name}</span>
          </div>

          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-1 transition-opacity duration-150 shrink-0">
            <button 
              title="Rename"
              onClick={() => { setRenameItem(node); setRenameName(node.name); }}
              className="hover:bg-muted p-0.5 rounded text-muted-foreground hover:text-foreground"
            >
              <Edit3 className="h-3 w-3" />
            </button>
            <button 
              title="Delete"
              onClick={() => setDeleteItem(node)}
              className="hover:bg-muted p-0.5 rounded text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border select-none">
      {/* Workspace Header */}
      <div className="p-3 border-b border-sidebar-border flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground font-bold">Workspace Project</div>
          <div className="text-xs font-semibold text-foreground truncate mt-0.5" title={dirPath}>
            {dirPath.split("/").pop() || "Project"}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            title="Refresh Files" 
            onClick={loadTree}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            title="New File at Root" 
            onClick={() => setNewItemPath({ parent: dirPath, isDir: false })}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Root level create input */}
      {newItemPath?.parent === dirPath && (
        <div className="p-2 border-b border-sidebar-border bg-background/50">
          <form onSubmit={handleCreateItem} className="flex items-center gap-1.5">
            {newItemPath.isDir ? <Folder className="h-3.5 w-3.5 text-amber-500/80" /> : <File className="h-3.5 w-3.5 text-muted-foreground/80" />}
            <Input
              autoFocus
              placeholder={newItemPath.isDir ? "Folder name..." : "File name..."}
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              className="h-7 text-xs py-0.5 px-1 bg-background border-border/80"
            />
            <Button type="submit" size="icon" className="h-7 w-7 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button 
              onClick={() => setNewItemPath(null)} 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      )}

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && tree.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-8">Scanning workspace...</div>
        ) : tree.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-8 px-4">
            Workspace is empty. Create a file to get started.
          </div>
        ) : (
          tree.map(node => renderNode(node))
        )}
      </div>

      {/* SemVer Version Bumper Panel */}
      {tree.some(n => n.name.toLowerCase() === "skill.md") && (
        <div className="p-3 border-t border-sidebar-border bg-background/25">
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            <Tag className="h-3 w-3" />
            <span>SemVer AI Bumper</span>
          </div>
          <div className="flex gap-1.5">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleVersionBump("patch")}
              className="flex-1 text-[10px] h-6 py-0 font-mono hover:border-amber-500/40"
            >
              +Patch
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleVersionBump("minor")}
              className="flex-1 text-[10px] h-6 py-0 font-mono hover:border-amber-500/40"
            >
              +Minor
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleVersionBump("major")}
              className="flex-1 text-[10px] h-6 py-0 font-mono hover:border-amber-500/40"
            >
              +Major
            </Button>
          </div>
        </div>
      )}

      {/* Git Version Control Panel */}
      {gitEnabled !== false && (
        <div className="border-t border-sidebar-border bg-background/40">
          <button 
            onClick={() => setShowGitPanel(!showGitPanel)}
            className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              <GitBranch className="h-3.5 w-3.5 text-amber-500" />
              <span>Git Integration</span>
            </div>
            <span className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded font-mono border border-border/20">
              {isGit ? "ACTIVE" : "UNTRACKED"}
            </span>
          </button>

          {showGitPanel && (
            <div className="p-3 pt-0 border-t border-sidebar-border/50 space-y-2">
              {!isGit ? (
                <div className="space-y-2 py-2">
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Initialize local git version control inside this workspace directory.
                  </p>
                  <Button 
                    size="sm" 
                    onClick={handleGitInit} 
                    className="w-full text-xs h-7 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  >
                    Initialize Git Repository
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleGitCommit} className="space-y-2 pt-2">
                  {gitStatus ? (
                    <div className="bg-background/80 border border-border/30 rounded p-2 text-[10px] font-mono max-h-32 overflow-y-auto">
                      <div className="font-bold text-muted-foreground border-b border-border/20 pb-0.5 mb-1">UNCOMMITTED CHANGES</div>
                      {gitStatus.split("\n").filter(Boolean).map((s, idx) => (
                        <div key={idx} className="truncate text-foreground">
                          {s}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-500 font-medium py-1 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Working directory clean
                    </div>
                  )}
                  
                  <Input
                    placeholder="Stage & commit message..."
                    value={commitMessage}
                    onChange={e => setCommitMessage(e.target.value)}
                    className="h-7 text-xs bg-background"
                    required
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={!gitStatus}
                    className="w-full text-xs h-7 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  >
                    Stage & Commit Changes
                  </Button>

                  {gitLog && (
                    <div className="pt-2 border-t border-border/10">
                      <div className="text-[9px] font-mono font-bold text-muted-foreground mb-1">VERSION LOGS (RECENT COMMITS)</div>
                      <pre className="text-[9px] font-mono text-muted-foreground bg-background/30 p-1.5 rounded max-h-24 overflow-y-auto leading-normal whitespace-pre-wrap">
                        {gitLog}
                      </pre>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={!!renameItem} onOpenChange={(open) => !open && setRenameItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Rename Item</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameName}
              onChange={e => setRenameName(e.target.value)}
              className="text-sm"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameItem(null)} className="h-8 text-xs">Cancel</Button>
            <Button onClick={handleRename} className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-black font-semibold">Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" /> Delete Warning
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs text-muted-foreground leading-normal">
            Are you sure you want to permanently delete <strong className="text-foreground">{deleteItem?.name}</strong>?
            This action will delete all nested files and cannot be undone.
          </div>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setDeleteItem(null)} className="h-8 text-xs">Cancel</Button>
            <Button onClick={handleDelete} className="h-8 text-xs bg-destructive hover:bg-destructive/90 text-white font-semibold">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
