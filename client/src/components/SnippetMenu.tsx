import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Search, Code, FileText, ChevronRight, Copy, Scissors, Clipboard, CheckCircle2, SpellCheck, PlusCircle, AlertCircle } from "lucide-react";
import { TEMPLATES } from "@/lib/templates";
import { MisspelledWordDetail } from "@/lib/spellChecker";

export interface SnippetItem {
  name: string;
  detail: string;
  content: string;
  category: string;
}

export const DEFAULT_SNIPPETS: SnippetItem[] = [
  // Markdown formatting
  {
    name: "Link",
    detail: "Markdown link - [text](url)",
    content: "[${1:text}](${2:url})",
    category: "Markdown"
  },
  {
    name: "Image",
    detail: "Markdown image - ![alt](url)",
    content: "![${1:alt}](${2:url})",
    category: "Markdown"
  },
  {
    name: "Code Block",
    detail: "Fenced code block",
    content: "```${1:language}\n${2:code}\n```",
    category: "Markdown"
  },
  {
    name: "Inline Code",
    detail: "Inline code backticks",
    content: "`${1:code}`",
    category: "Markdown"
  },
  {
    name: "Bold",
    detail: "Bold text",
    content: "**${1:text}**",
    category: "Markdown"
  },
  {
    name: "Italic",
    detail: "Italic text",
    content: "*${1:text}*",
    category: "Markdown"
  },
  {
    name: "Table",
    detail: "Markdown table",
    content: "| ${1:Header 1} | ${2:Header 2} |\n| :--- | :--- |\n| ${3:Value 1} | ${4:Value 2} |",
    category: "Markdown"
  },
  {
    name: "Task List Item",
    detail: "Task list checkbox",
    content: "- [ ] ${1:task}",
    category: "Markdown"
  },
  {
    name: "Header 1",
    detail: "Heading level 1",
    content: "# ${1:Heading}",
    category: "Markdown"
  },
  {
    name: "Header 2",
    detail: "Heading level 2",
    content: "## ${1:Heading}",
    category: "Markdown"
  },
  {
    name: "Header 3",
    detail: "Heading level 3",
    content: "### ${1:Heading}",
    category: "Markdown"
  },
  {
    name: "Blockquote",
    detail: "Blockquote block",
    content: "> ${1:text}",
    category: "Markdown"
  },
  // Add all app templates
  ...TEMPLATES.map(t => ({
    name: t.title,
    detail: t.description,
    content: t.content,
    category: t.category === "snippet" ? "Agent Snippet" : "Agent Template"
  }))
];

interface SnippetMenuProps {
  x: number;
  y: number;
  open: boolean;
  onClose: () => void;
  onSelect: (snippet: SnippetItem) => void;
  initialSearch?: string;
  misspelledWord?: string;
  suggestions?: string[];
  onSelectSuggestion?: (suggestion: string) => void;
  onAddToDictionary?: (word: string) => void;
  onCheckFullDocument?: () => void;
  documentSpellingIssues?: MisspelledWordDetail[];
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
}

export function SnippetMenu({
  x,
  y,
  open,
  onClose,
  onSelect,
  initialSearch = "",
  misspelledWord,
  suggestions,
  onSelectSuggestion,
  onAddToDictionary,
  onCheckFullDocument,
  documentSpellingIssues,
  onCut,
  onCopy,
  onPaste
}: SnippetMenuProps) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearch(initialSearch);
      setSelectedIndex(0);
      // Auto-focus input on open
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [open, initialSearch]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  const filteredSnippets = DEFAULT_SNIPPETS.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.detail.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (filteredSnippets.length > 0 ? (prev + 1) % filteredSnippets.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (filteredSnippets.length > 0 ? (prev - 1 + filteredSnippets.length) % filteredSnippets.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSnippets[selectedIndex]) {
        onSelect(filteredSnippets[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // Adjust menu position to keep it on-screen
  const adjustPosition = () => {
    const width = 360;
    const height = 340;
    let adjustedX = x;
    let adjustedY = y;

    if (window.innerWidth && adjustedX + width > window.innerWidth) {
      adjustedX = window.innerWidth - width - 16;
    }
    if (window.innerHeight && adjustedY + height > window.innerHeight) {
      adjustedY = window.innerHeight - height - 16;
    }

    return {
      left: Math.max(16, adjustedX),
      top: Math.max(16, adjustedY),
    };
  };

  const pos = adjustPosition();

  // Scroll active item into view
  const activeItemRef = (el: HTMLButtonElement | null, index: number) => {
    if (index === selectedIndex && el) {
      el.scrollIntoView({ block: "nearest" });
    }
  };

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        left: `${pos.left}px`,
        top: `${pos.top}px`,
        zIndex: 9999,
      }}
      className="w-[360px] max-h-[380px] bg-background/95 border border-border/80 rounded-xl shadow-2xl backdrop-blur-md flex flex-col overflow-hidden text-foreground animate-in fade-in zoom-in-95 duration-100"
      onKeyDown={handleKeyDown}
    >
      {/* Spell Checker Section */}
      {misspelledWord ? (
        <div className="border-b border-border/50 bg-amber-500/5 px-2.5 py-2 shrink-0 select-none space-y-1">
          <div className="text-[10px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <SpellCheck className="h-3.5 w-3.5 text-amber-500" />
              Spelling: "{misspelledWord}"
            </span>
            <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-400 font-mono">
              {suggestions && suggestions.length > 0 ? `${suggestions.length} suggestions` : "No matches"}
            </span>
          </div>

          {suggestions && suggestions.length > 0 && (
            <div className="flex flex-col gap-0.5 pt-0.5">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onSelectSuggestion && onSelectSuggestion(suggestion)}
                  className="w-full text-left px-2 py-1 rounded text-xs font-semibold text-foreground hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center justify-between border-none outline-none cursor-pointer"
                >
                  <span className="font-mono">{suggestion}</span>
                  <span className="text-[9px] text-muted-foreground font-normal">Replace</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 pt-1 border-t border-border/40">
            {onAddToDictionary && (
              <button
                type="button"
                onClick={() => onAddToDictionary(misspelledWord)}
                className="flex-1 text-left px-2 py-1 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1 border-none outline-none cursor-pointer"
              >
                <PlusCircle className="h-3 w-3 text-amber-500" />
                Add to Dictionary
              </button>
            )}
            {onCheckFullDocument && (
              <button
                type="button"
                onClick={onCheckFullDocument}
                className="text-left px-2 py-1 rounded text-[10px] font-medium text-muted-foreground hover:text-amber-500 hover:bg-muted/50 transition-colors flex items-center gap-1 border-none outline-none shrink-0 cursor-pointer"
              >
                <SpellCheck className="h-3 w-3" />
                Scan Full Doc
              </button>
            )}
          </div>
        </div>
      ) : (
        onCheckFullDocument && (
          <div className="border-b border-border/50 bg-muted/10 px-2.5 py-1.5 shrink-0 select-none flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Spell Checker
            </span>
            <button
              type="button"
              onClick={onCheckFullDocument}
              className="text-[10px] font-semibold text-amber-500 hover:text-amber-600 px-2 py-0.5 rounded hover:bg-amber-500/10 transition-colors flex items-center gap-1 border-none outline-none cursor-pointer"
            >
              <SpellCheck className="h-3 w-3" />
              Scan Document
            </button>
          </div>
        )
      )}

      {/* Full Document Spelling Issues List */}
      {documentSpellingIssues && documentSpellingIssues.length > 0 && (
        <div className="border-b border-border/50 bg-amber-500/10 px-2.5 py-2 max-h-36 overflow-y-auto shrink-0 select-none space-y-1">
          <div className="text-[9px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3 text-amber-500" />
            Document Misspellings ({documentSpellingIssues.length}):
          </div>
          <div className="space-y-1">
            {documentSpellingIssues.map(issue => (
              <div key={issue.word + issue.start} className="bg-background/80 p-1.5 rounded border border-border/60 text-xs">
                <div className="flex items-center justify-between font-mono font-semibold text-destructive text-[11px]">
                  <span>"{issue.word}"</span>
                  {onAddToDictionary && (
                    <button
                      type="button"
                      onClick={() => onAddToDictionary(issue.word)}
                      className="text-[9px] text-muted-foreground hover:text-amber-500 font-normal cursor-pointer"
                    >
                      + Add
                    </button>
                  )}
                </div>
                {issue.suggestions.length > 0 ? (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {issue.suggestions.map(sug => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => onSelectSuggestion && onSelectSuggestion(sug)}
                        className="text-[10px] font-mono bg-muted/60 hover:bg-amber-500/20 hover:text-amber-500 px-1.5 py-0.5 rounded text-foreground transition-colors cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-[9px] text-muted-foreground italic">No suggestions</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Actions Section */}
      <div className="border-b border-border/50 px-1 py-1 shrink-0 select-none grid grid-cols-3 gap-0.5 bg-muted/20">
        <button
          type="button"
          onClick={() => { onCut && onCut(); }}
          className="px-2 py-1.5 rounded text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5 border-none outline-none"
        >
          <Scissors className="h-3 w-3" /> Cut
        </button>
        <button
          type="button"
          onClick={() => { onCopy && onCopy(); }}
          className="px-2 py-1.5 rounded text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5 border-none outline-none"
        >
          <Copy className="h-3 w-3" /> Copy
        </button>
        <button
          type="button"
          onClick={() => { onPaste && onPaste(); }}
          className="px-2 py-1.5 rounded text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5 border-none outline-none"
        >
          <Clipboard className="h-3 w-3" /> Paste
        </button>
      </div>

      {/* Search Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-muted/30 shrink-0">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search snippets (Enter to insert)..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setSelectedIndex(0);
          }}
          className="w-full bg-transparent border-none outline-none text-xs focus:ring-0 placeholder:text-muted-foreground/50 py-1"
        />
      </div>

      {/* Snippet List */}
      <div className="flex-1 overflow-y-auto py-1">
        {filteredSnippets.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">
            No matching snippets found
          </div>
        ) : (
          filteredSnippets.map((item, index) => {
            const isSelected = index === selectedIndex;
            const isMarkdown = item.category === "Markdown";
            return (
              <button
                key={item.name}
                ref={el => activeItemRef(el, index)}
                onClick={() => onSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors border-none outline-none ${
                  isSelected ? "bg-amber-500/15 text-foreground" : "hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1 rounded ${isSelected ? "bg-amber-500/20 text-amber-500" : "bg-muted text-muted-foreground"}`}>
                    {isMarkdown ? <Code className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate flex items-center gap-1.5">
                      {item.name}
                      {isSelected && (
                        <span className="text-[9px] bg-amber-500/25 text-amber-600 dark:text-amber-400 px-1 py-0.2 rounded font-normal font-mono">
                          Tab-stops
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                      {item.detail}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                    isMarkdown 
                      ? "bg-blue-500/10 text-blue-500 border border-blue-500/15" 
                      : item.category === "Agent Snippet" 
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/15"
                        : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/15"
                  }`}>
                    {item.category}
                  </span>
                  <ChevronRight className={`h-3 w-3 transition-transform ${isSelected ? "opacity-100 translate-x-0.5" : "opacity-0"}`} />
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="px-3 py-1.5 bg-muted/40 border-t border-border/40 text-[9px] text-muted-foreground/80 flex items-center justify-between shrink-0 font-mono">
        <span>Use Tab / Shift+Tab to jump between placeholders</span>
        <span>Esc to close</span>
      </div>
    </div>,
    document.body
  );
}
