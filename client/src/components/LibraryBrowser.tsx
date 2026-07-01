import React, { useState, useEffect } from "react";
import { 
  FolderOpen, 
  BookOpen, 
  Search, 
  Folder, 
  ArrowRight,
  ExternalLink,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LibraryBrowserProps {
  open: boolean;
  onClose: () => void;
  onOpenWorkspace: (dirPath: string) => void;
}

export function LibraryBrowser({ open, onClose, onOpenWorkspace }: LibraryBrowserProps) {
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  const [libraryPath, setLibraryPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/library");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        setLibraryPath(data.path);
        
        // Auto-select the first tab that has items, prioritizing "Skills"
        const tabs = Object.keys(data.categories);
        if (tabs.length > 0) {
          const skillsTab = tabs.find(t => t.toLowerCase() === "skills");
          setActiveTab(skillsTab || tabs[0]);
        }
      } else {
        toast.error("Failed to load library: " + data.error);
      }
    } catch (err: any) {
      toast.error("Error loading library: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadLibrary();
    }
  }, [open]);

  const handleOpenFolder = (category: string, folderName: string) => {
    const fullPath = `${libraryPath}/${category}/${folderName}`;
    onOpenWorkspace(fullPath);
    onClose();
    toast.success(`Opened workspace: ${folderName}`);
  };

  const categoriesList = Object.keys(categories);
  const currentItems = categories[activeTab] || [];
  
  const filteredItems = currentItems.filter(item => 
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden bg-background border border-border/80">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-500" />
            <DialogTitle className="text-lg font-bold text-foreground">
              AgentForgeMD Library Browser
            </DialogTitle>
          </div>
          <div className="text-xs text-muted-foreground mt-1 truncate" title={libraryPath}>
            Source Directory: <span className="font-mono text-foreground/80">{libraryPath}</span>
          </div>
        </DialogHeader>

        {/* Tab Selection Row */}
        <div className="px-6 py-2 border-b border-border/20 bg-muted/20 flex flex-wrap gap-1 shrink-0">
          {loading && categoriesList.length === 0 ? (
            <div className="text-xs text-muted-foreground">Loading categories...</div>
          ) : (
            categoriesList.map(tab => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                size="sm"
                onClick={() => { setActiveTab(tab); setSearchQuery(""); }}
                className={`text-xs h-8 ${activeTab === tab ? "bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {tab}
                <Badge variant="secondary" className="ml-1.5 text-[9px] py-0 px-1 bg-muted-foreground/10 text-muted-foreground font-mono">
                  {categories[tab]?.length || 0}
                </Badge>
              </Button>
            ))
          )}
        </div>

        {/* Search Toolbar */}
        <div className="px-6 py-3 border-b border-border/25 flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search items in ${activeTab || "category"}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-background">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-2">
              <div className="h-6 w-6 border-2 border-amber-500 border-t-transparent animate-spin rounded-full"></div>
              <span className="text-xs text-muted-foreground">Scanning skill repository...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border/60 rounded-lg p-6">
              <FolderOpen className="h-8 w-8 text-muted-foreground/45 mb-2" />
              <span className="text-sm font-semibold text-muted-foreground">No folders found</span>
              <span className="text-xs text-muted-foreground/75 mt-1">
                {searchQuery ? "Try refining your search query" : `Drop folders into Library/${activeTab} to see them here`}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map(item => (
                <Card 
                  key={item}
                  onClick={() => handleOpenFolder(activeTab, item)}
                  className="group cursor-pointer hover:border-amber-500/40 hover:bg-amber-500/5 dark:hover:bg-amber-500/5 transition-all duration-200 border-border/80"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Folder className="h-5 w-5 text-amber-500 shrink-0 fill-amber-500/10" />
                        <CardTitle className="text-sm font-semibold text-foreground truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {item}
                        </CardTitle>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-[11px] text-muted-foreground flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                      <span>Standard Skill Package</span>
                      <Badge variant="outline" className="text-[9px] py-0 px-1 border-border/40 font-normal">
                        Ready to load
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
