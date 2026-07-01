import React, { useState } from "react";
import { 
  Puzzle, CheckCircle2, XCircle, Settings2, Key, Sparkles, 
  HelpCircle, Eye, ShieldAlert, Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface Extension {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  enabled: boolean;
  category: string;
  icon: string;
}

interface ExtensionsManagerProps {
  extensions: Extension[];
  onToggleExtension: (id: string) => void;
}

export function ExtensionsManager({ extensions, onToggleExtension }: ExtensionsManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"extensions" | "settings">("extensions");

  // API Config settings (stored in localStorage)
  const [openaiKey, setOpenaiKey] = useState(() => localStorage.getItem("ai_agent_md_openai_key") || "");
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("ai_agent_md_gemini_key") || "");
  const [defaultAuthor, setDefaultAuthor] = useState(() => localStorage.getItem("ai_agent_md_default_author") || "Forge");

  const saveSettings = () => {
    localStorage.setItem("ai_agent_md_openai_key", openaiKey);
    localStorage.setItem("ai_agent_md_gemini_key", geminiKey);
    localStorage.setItem("ai_agent_md_default_author", defaultAuthor);
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="flex-grow h-full flex flex-col overflow-hidden bg-background">
      {/* Header Tabs */}
      <div className="p-6 border-b border-border bg-sidebar/30 shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/30 text-amber-500">
              <Puzzle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">IDE Configuration & Extensions</h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Toggle active modules and configure your API keys or default preferences.
              </p>
            </div>
          </div>

          <div className="flex border border-border/80 rounded-lg p-0.5 bg-muted/30">
            <button
              onClick={() => setActiveSubTab("extensions")}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1.5 ${activeSubTab === "extensions" ? "bg-amber-500 text-black shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Puzzle className="h-3.5 w-3.5" /> Extensions ({extensions.length})
            </button>
            <button
              onClick={() => setActiveSubTab("settings")}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1.5 ${activeSubTab === "settings" ? "bg-amber-500 text-black shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Settings2 className="h-3.5 w-3.5" /> General Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-grow overflow-y-auto p-6 bg-muted/10">
        <div className="max-w-4xl mx-auto">
          {activeSubTab === "extensions" ? (
            <div className="space-y-6">
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex gap-3 text-xs text-amber-700 dark:text-amber-300">
                <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <span className="font-bold">Visual Studio Extension Manager</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Disabling extensions will dynamically remove their panels, widgets, and buttons from the main sidebar and editor menus to provide a custom workspace setup.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extensions.map((ext) => (
                  <div 
                    key={ext.id} 
                    className={`border rounded-xl p-4 flex flex-col justify-between transition-all bg-card ${ext.enabled ? "border-border hover:border-amber-500/20" : "border-border/30 opacity-70 bg-card/40"}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wide px-1.5 py-0.2">
                          {ext.category}
                        </Badge>
                        <Badge className={`text-[9px] font-semibold ${ext.enabled ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-muted text-muted-foreground"}`}>
                          {ext.enabled ? "Active" : "Disabled"}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          {ext.name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground leading-normal mt-1 min-h-[35px]">
                          {ext.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-4">
                      <span className="text-[9px] font-mono text-muted-foreground">
                        v{ext.version} • by {ext.author}
                      </span>

                      <Button
                        size="sm"
                        variant={ext.enabled ? "outline" : "default"}
                        onClick={() => onToggleExtension(ext.id)}
                        className={`h-7 text-[10px] font-semibold rounded-md min-w-[80px] ${ext.enabled ? "border-red-500/20 text-red-500 hover:bg-red-500/5 hover:text-red-600" : "bg-amber-500 hover:bg-amber-600 text-black"}`}
                      >
                        {ext.enabled ? (
                          <>
                            <XCircle className="h-3.5 w-3.5 mr-1 shrink-0" /> Disable
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1 shrink-0" /> Enable
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border/60 rounded-xl p-6 space-y-6 shadow-sm">
              <h2 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-1.5">
                <Settings2 className="h-4.5 w-4.5 text-amber-500" />
                IDE System Preferences
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Key className="h-3.5 w-3.5 text-amber-500" /> Gemini API Key
                    </label>
                    <Input
                      type="password"
                      value={geminiKey}
                      onChange={e => setGeminiKey(e.target.value)}
                      placeholder="AI_... (gemini api key)"
                      className="h-9 text-xs font-mono focus-visible:ring-amber-500/40"
                    />
                    <span className="text-[9px] text-muted-foreground block">
                      Enables the AI Assistant panel to call Google Gemini API models.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Key className="h-3.5 w-3.5 text-amber-500" /> OpenAI API Key
                    </label>
                    <Input
                      type="password"
                      value={openaiKey}
                      onChange={e => setOpenaiKey(e.target.value)}
                      placeholder="sk-proj-... (openai api key)"
                      className="h-9 text-xs font-mono focus-visible:ring-amber-500/40"
                    />
                    <span className="text-[9px] text-muted-foreground block">
                      Enables the AI Assistant panel to call OpenAI GPT-4o models.
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 max-w-md">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Default Skill Author
                  </label>
                  <Input
                    value={defaultAuthor}
                    onChange={e => setDefaultAuthor(e.target.value)}
                    placeholder="Enter author name..."
                    className="h-9 text-xs focus-visible:ring-amber-500/40"
                  />
                  <span className="text-[9px] text-muted-foreground block">
                    Automatically fills the 'author' YAML key when running the Skill Scaffolding Wizard.
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
                <Button 
                  onClick={saveSettings} 
                  className="h-9 text-xs bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-md shadow-amber-500/10 px-4 rounded-md"
                >
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
