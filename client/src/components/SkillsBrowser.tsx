import React, { useState, useEffect } from "react";
import { 
  Search, Star, Download, CheckCircle2, FolderOpen, 
  ExternalLink, Compass, Library, Info, BookOpen, AlertCircle,
  FileText, X, Maximize2, Minimize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface RegistrySkill {
  id: string;
  skillId: string;
  name: string;
  installs: number;
  source: string;
  description?: string;
  version?: string;
  files?: Array<{ path: string; contents: string }>;
}

interface SkillsBrowserProps {
  activeWorkspaceDir: string;
  onOpenWorkspace: (dir: string) => void;
}

// Simple helper to parse frontmatter from markdown files
function parseFrontmatter(markdown: string) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)/);
  if (!match) {
    return { metadata: {} as Record<string, string>, content: markdown };
  }
  const yamlText = match[1];
  const bodyText = match[2];
  
  const metadata: Record<string, string> = {};
  yamlText.split("\n").forEach(line => {
    const partMatch = line.match(/^\s*([^:]+?)\s*:\s*["']?([\s\S]*?)["']?\s*$/);
    if (partMatch) {
      metadata[partMatch[1].trim()] = partMatch[2].trim();
    }
  });
  
  return { metadata, content: bodyText };
}

export function SkillsBrowser({ activeWorkspaceDir, onOpenWorkspace }: SkillsBrowserProps) {
  const [search, setSearch] = useState("");
  const [activeQuery, setActiveQuery] = useState("agent");
  const [skillsList, setSkillsList] = useState<RegistrySkill[]>([]);
  const [installedList, setInstalledList] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewSkill, setPreviewSkill] = useState<RegistrySkill | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string>("SKILL.md");
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch installed skills from the server to check installation status
  const fetchInstalledSkills = async () => {
    try {
      const res = await fetch("/api/library");
      const data = await res.json();
      if (data.success && data.categories) {
        // Flatten all installed subfolder names in categories
        const flattened = Object.values(data.categories).flat() as string[];
        setInstalledList(flattened);
      }
    } catch (err) {
      console.error("Failed to load installed list:", err);
    }
  };

  // Fetch search results from skills.sh proxy
  const fetchRegistrySkills = async (queryText: string) => {
    if (!queryText || queryText.trim().length < 2) {
      return;
    }
    setLoadingSearch(true);
    try {
      const res = await fetch(`/api/library/search?q=${encodeURIComponent(queryText)}`);
      const data = await res.json();
      if (data.success && data.data && data.data.skills) {
        setSkillsList(data.data.skills);
      }
    } catch (err) {
      console.error("Failed to fetch registry skills:", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim().length >= 2) {
        fetchRegistrySkills(search);
      } else if (search.trim().length === 0) {
        fetchRegistrySkills(activeQuery);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [search, activeQuery]);

  useEffect(() => {
    fetchInstalledSkills();
    fetchRegistrySkills(activeQuery);
  }, []);

  const handlePreview = async (skill: RegistrySkill) => {
    setLoadingPreview(true);
    try {
      const dlRes = await fetch(`/api/library/download?id=${encodeURIComponent(skill.id)}`);
      const dlData = await dlRes.json();
      if (dlData.success && dlData.data && dlData.data.files) {
        const files = dlData.data.files;
        
        // Find default file: default to README.md or readme.md if it exists, otherwise SKILL.md or skill.md
        const readmeFile = files.find((f: any) => f.path.toLowerCase() === "readme.md");
        const skillFile = files.find((f: any) => f.path.toLowerCase() === "skill.md");
        
        let initialPath = "SKILL.md";
        if (readmeFile) {
          initialPath = readmeFile.path;
        } else if (skillFile) {
          initialPath = skillFile.path;
        } else if (files.length > 0) {
          initialPath = files[0].path;
        }
        
        setSelectedFilePath(initialPath);

        // Parse metadata from SKILL.md
        let description = "";
        let version = "1.0.0";
        const metaSkillFile = files.find((f: any) => f.path === "SKILL.md");
        if (metaSkillFile) {
          const parsed = parseFrontmatter(metaSkillFile.contents);
          description = parsed.metadata.description || "";
          version = parsed.metadata.version || "1.0.0";
        }
        
        setPreviewSkill({
          ...skill,
          description,
          version,
          files
        });
      } else {
        toast.error("Failed to load skill details from skills.sh");
      }
    } catch (err: any) {
      toast.error(`Error loading preview: ${err.message}`);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleInstall = async (pkg: RegistrySkill) => {
    setLoading(pkg.id);
    try {
      let files = pkg.files;
      let description = pkg.description;
      let version = pkg.version;
      
      // 1. If files are not loaded yet (e.g. clicked install directly from list)
      if (!files) {
        const dlRes = await fetch(`/api/library/download?id=${encodeURIComponent(pkg.id)}`);
        const dlData = await dlRes.json();
        if (dlData.success && dlData.data && dlData.data.files) {
          const fetchedFiles = dlData.data.files;
          files = fetchedFiles;
          
          const skillFile = fetchedFiles.find((f: any) => f.path === "SKILL.md");
          if (skillFile) {
            const parsed = parseFrontmatter(skillFile.contents);
            description = parsed.metadata.description || "";
            version = parsed.metadata.version || "1.0.0";
          }
        } else {
          throw new Error("Failed to download skill files from registry");
        }
      }
      
      // 2. Call local installer with complete files snapshot
      const res = await fetch("/api/library/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId: pkg.id,
          name: pkg.name,
          description: description || "",
          version: version || "1.0.0",
          category: "Skills",
          files: files
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully installed ${pkg.name}!`);
        fetchInstalledSkills();
      } else {
        toast.error(`Installation failed: ${data.error}`);
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  const handleOpenFolder = (pkg: RegistrySkill) => {
    fetch("/api/library")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const folderName = (pkg.id.includes('/') || pkg.id.includes('@')) ? (pkg.skillId || pkg.name) : pkg.id;
          const targetPath = `${data.path}/Skills/${folderName}`.replace(/\\/g, "/");
          onOpenWorkspace(targetPath);
          toast.success(`Opened ${pkg.name} workspace!`);
        }
      });
  };

  const categories = [
    { label: "Top Skills", query: "agent" },
    { label: "React & UI", query: "react" },
    { label: "Git & DevOps", query: "git" },
    { label: "Testing & QA", query: "test" },
    { label: "AI & LLM", query: "ai" },
    { label: "Database", query: "postgres" }
  ];

  return (
    <div className="flex-grow h-full flex flex-col overflow-hidden bg-background">
      {/* Search Header */}
      <div className="p-6 border-b border-border bg-sidebar/30 shrink-0">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/30 text-amber-500">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground">skills.sh Registry Browser</h1>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Search and install premium agentic skill packages directly into your global library.
                </p>
              </div>
            </div>
            <a 
              href="https://skills.sh" 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1 hover:underline bg-amber-500/5 px-2.5 py-1 rounded-md border border-amber-500/15"
            >
              skills.sh Hub <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search prompt templates, scripts, packages..."
                className="pl-9 h-9 text-xs focus-visible:ring-amber-500/40"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { setSearch(""); setActiveQuery("agent"); }}
              className="h-9 text-xs"
            >
              Reset Filters
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1 select-none">
            {categories.map(cat => {
              const isActive = (search === "" && activeQuery === cat.query) || (search === cat.query);
              return (
                <button
                  key={cat.label}
                  onClick={() => { setSearch(""); setActiveQuery(cat.query); }}
                  className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-md border transition-all ${isActive ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Package Grid List */}
      <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
        <div className="max-w-4xl mx-auto">
          {loadingSearch ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="h-8 w-8 animate-spin border-4 border-amber-500 border-t-transparent rounded-full mb-3" />
              <p className="text-xs text-muted-foreground">Searching skills.sh registry...</p>
            </div>
          ) : skillsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl bg-card">
              <AlertCircle className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <h3 className="text-xs font-bold text-foreground">No Packages Found</h3>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
                Could not find any skill packages matching "{search || activeQuery}". Try searching with other terms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillsList.map((pkg) => {
                const isInstalled = installedList.includes(pkg.id);
                const folderName = (pkg.id.includes('/') || pkg.id.includes('@')) ? (pkg.skillId || pkg.name) : pkg.id;
                const isWorkspaceActive = activeWorkspaceDir?.replace(/\\/g, "/").endsWith(`/Skills/${folderName}`);
                
                return (
                  <div 
                    key={pkg.id} 
                    className="group relative border border-border/60 hover:border-amber-500/40 bg-card hover:bg-amber-500/[0.01] transition-all rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground px-1.5 py-0.5 border-border/50">
                          {pkg.source.split("/")[0]}
                        </Badge>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/30" />
                          <span className="font-bold text-foreground">{(pkg.installs > 1000 ? `${(pkg.installs / 1000).toFixed(1)}k` : pkg.installs)} installs</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          {pkg.name}
                          {isInstalled && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          )}
                        </h3>
                        <p className="text-[10px] text-muted-foreground leading-normal mt-1 min-h-[40px]">
                          Agentic skill package from {pkg.source}. Click Preview to view contents and documentation.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-4">
                      <div className="text-[9px] font-mono text-muted-foreground truncate max-w-[150px]">
                        by <span className="text-foreground/80">{pkg.source}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handlePreview(pkg)}
                          title="Preview skill snapshot"
                          className="h-7 px-2 text-[10px] hover:text-amber-500 hover:bg-muted font-semibold flex items-center gap-1"
                        >
                          <BookOpen className="h-3.5 w-3.5" /> Preview
                        </Button>

                        {isInstalled ? (
                          isWorkspaceActive ? (
                            <Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                              Active Workspace
                            </Badge>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => handleOpenFolder(pkg)}
                              className="h-7 text-[10px] bg-amber-500 hover:bg-amber-600 text-black font-semibold flex items-center gap-1 rounded-md"
                            >
                              <FolderOpen className="h-3.5 w-3.5" /> Open
                            </Button>
                          )
                        ) : (
                          <Button 
                            size="sm" 
                            disabled={loading === pkg.id}
                            onClick={() => handleInstall(pkg)}
                            className="h-7 text-[10px] bg-amber-500 hover:bg-amber-600 text-black font-semibold flex items-center gap-1 rounded-md min-w-[70px]"
                          >
                            {loading === pkg.id ? (
                              <div className="h-3.5 w-3.5 animate-spin border-2 border-black border-t-transparent rounded-full" />
                            ) : (
                              <>
                                <Download className="h-3.5 w-3.5" /> Install
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Live Package Explorer Preview Modal */}
      <Dialog open={!!previewSkill || loadingPreview} onOpenChange={() => { if (!loadingPreview) { setPreviewSkill(null); setIsExpanded(false); } }}>
        <DialogContent className={`bg-card border border-border text-foreground flex flex-col p-0 overflow-hidden shadow-xl rounded-xl transition-all duration-300 ${isExpanded ? "w-[8.5in] max-w-[8.5in] h-[75vh] max-h-[75vh]" : "max-w-4xl max-h-[85vh] h-[85vh]"}`}>
          <DialogTitle className="sr-only">Skill Preview</DialogTitle>
          <DialogDescription className="sr-only">Detailed preview of raw skill markdown files.</DialogDescription>
          {loadingPreview && (
            <div className="flex flex-col items-center justify-center p-20 min-h-[300px] flex-grow">
               <div className="h-8 w-8 animate-spin border-4 border-amber-500 border-t-transparent rounded-full mb-3" />
              <p className="text-xs text-muted-foreground">Downloading skill files from skills.sh registry...</p>
            </div>
          )}

          {!loadingPreview && previewSkill && (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-sidebar shrink-0">
                <div>
                  <h2 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <BookOpen className="h-4.5 w-4.5" />
                    Preview: {previewSkill.name}
                  </h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-lg">
                    {previewSkill.description || `Explore code and templates inside ${previewSkill.id}.`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? "Restore Dialog Size" : "Expand to 8.5\" x 75vh"}
                    className="text-muted-foreground hover:text-foreground h-7 w-7"
                  >
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setPreviewSkill(null);
                      setIsExpanded(false);
                    }}
                    className="text-muted-foreground hover:text-foreground h-7 w-7"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Explorer Layout */}
              <div className="flex-grow overflow-hidden flex min-h-0">
                {/* Left Explorer Panel */}
                <div className="w-64 border-r border-border bg-sidebar/10 overflow-y-auto p-3 flex flex-col justify-between shrink-0">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground mb-2">Package Files</h4>
                      <div className="space-y-1">
                        {previewSkill.files?.map(file => {
                          const isSelected = selectedFilePath === file.path;
                          return (
                            <button
                              key={file.path}
                              onClick={() => setSelectedFilePath(file.path)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-mono flex items-center gap-2 transition-all ${
                                isSelected 
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border-l-2 border-amber-500" 
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                              }`}
                            >
                              <FileText className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{file.path}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Metadata Specs */}
                  <div className="border-t border-border pt-3 mt-4 space-y-2 text-[10px] text-muted-foreground shrink-0">
                    <div className="flex justify-between">
                      <span>Publisher:</span>
                      <span className="font-semibold text-foreground/80 truncate max-w-[130px]">{previewSkill.source.split("/")[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Installs:</span>
                      <span className="font-semibold text-foreground/80">{previewSkill.installs.toLocaleString()}</span>
                    </div>
                    {previewSkill.version && (
                      <div className="flex justify-between">
                        <span>Version:</span>
                        <span className="font-semibold text-foreground/80">v{previewSkill.version}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Code Viewer / Markdown HTML Preview */}
                <div className="flex-grow overflow-y-auto p-5 bg-background font-sans text-xs leading-relaxed text-foreground border-l border-border min-h-0">
                  {(() => {
                    const activeFile = previewSkill.files?.find(f => f.path === selectedFilePath);
                    const contents = activeFile?.contents || "";
                    const isMd = selectedFilePath.toLowerCase().endsWith(".md") || selectedFilePath.toLowerCase().endsWith(".skill");

                    if (isMd) {
                      return (
                        <div className="max-w-3xl mx-auto py-2 leading-relaxed">
                          {contents.trim() === "" ? (
                            <p className="text-muted-foreground font-mono italic">No content to preview.</p>
                          ) : (
                            <MarkdownRenderer content={contents} />
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-foreground p-4 bg-muted/40 rounded-lg border border-border/50">
                          {contents || `// File ${selectedFilePath} is empty.`}
                        </pre>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border flex justify-end gap-2 shrink-0 bg-sidebar/20">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setPreviewSkill(null);
                    setIsExpanded(false);
                  }} 
                  className="text-xs h-8"
                >
                  Close
                </Button>
                
                {!installedList.includes(previewSkill.id) && (
                  <Button 
                    size="sm" 
                    disabled={loading === previewSkill.id}
                    onClick={() => {
                      handleInstall(previewSkill);
                      setPreviewSkill(null);
                      setIsExpanded(false);
                    }}
                    className="text-xs h-8 bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-md shadow-amber-500/10 min-w-[100px]"
                  >
                    {loading === previewSkill.id ? (
                      <div className="h-3.5 w-3.5 animate-spin border-2 border-black border-t-transparent rounded-full mx-auto" />
                    ) : (
                      "Install Package"
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
