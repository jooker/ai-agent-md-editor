import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import * as yaml from "js-yaml";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Lightbulb, AlertCircle, AlertTriangle, AlertOctagon, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import Prism from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-php";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-docker";
import "prismjs/components/prism-powershell";
import "prismjs/components/prism-ini";
import "prismjs/components/prism-toml";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-dart";
import "prismjs/components/prism-zig";
import "prismjs/components/prism-diff";
import "prismjs/components/prism-regex";

interface MarkdownRendererProps {
  content: string;
}

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  cs: "csharp",
  "c#": "csharp",
  "c++": "cpp",
  h: "c",
  hpp: "cpp",
  rs: "rust",
  rb: "ruby",
  kt: "kotlin",
  kts: "kotlin",
  ps1: "powershell",
  dockerfile: "docker",
  html: "markup",
  xml: "markup",
  svg: "markup",
  md: "markdown",
  json5: "json"
};

// Helper to render YAML values beautifully
const renderValue = (val: any): React.ReactNode => {
  if (val === null || val === undefined) {
    return <span className="text-muted-foreground italic font-normal text-xs">null</span>;
  }
  if (typeof val === "boolean") {
    return (
      <Badge variant={val ? "default" : "secondary"} className="text-[11px] font-mono py-0 px-1.5 h-5">
        {val ? "true" : "false"}
      </Badge>
    );
  }
  if (Array.isArray(val)) {
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {val.map((item, idx) => (
          <Badge key={idx} variant="outline" className="text-[11px] py-0.5 px-2 font-normal">
            {String(item)}
          </Badge>
        ))}
      </div>
    );
  }
  if (typeof val === "object") {
    return (
      <pre className="text-[11px] font-mono bg-muted/50 p-2 rounded border border-border/50 max-h-32 overflow-y-auto whitespace-pre-wrap leading-tight mt-1 text-foreground">
        {JSON.stringify(val, null, 2)}
      </pre>
    );
  }
  return <span className="font-sans break-all">{String(val)}</span>;
};

// Custom component for code blocks with Mermaid support and Prism syntax highlighting
const CodeBlock = ({ inline, className, children }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const rawLang = match ? match[1].toLowerCase() : "";
  const language = LANGUAGE_ALIASES[rawLang] || rawLang;
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (language === "mermaid" && codeRef.current) {
      mermaid.contentLoaded();
    }
  }, [language]);

  if (inline) {
    return (
      <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px] text-amber-600 dark:text-amber-400 border border-border/40">
        {children}
      </code>
    );
  }

  if (language === "mermaid") {
    return (
      <div
        ref={codeRef}
        className="mermaid my-4 flex justify-center bg-muted/20 p-4 rounded-lg overflow-x-auto border border-border/40"
      >
        {String(children).replace(/\n$/, "")}
      </div>
    );
  }

  const codeText = String(children).replace(/\n$/, "");
  let highlightedHtml = "";
  let hasHighlight = false;

  const targetLang = language && Prism.languages[language] ? language : "javascript";
  if (Prism.languages[targetLang]) {
    try {
      highlightedHtml = Prism.highlight(
        codeText,
        Prism.languages[targetLang],
        targetLang
      );
      hasHighlight = true;
    } catch (e) {
      console.error("Prism syntax highlighting error:", e);
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-xl border border-border/60 overflow-hidden shadow-sm bg-slate-950 text-slate-100">
      {/* Code Header Bar */}
      <div className="bg-slate-900/90 px-3 py-1.5 border-b border-border/40 flex items-center justify-between text-[11px] font-mono select-none">
        <span className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">
          {rawLang || "code"}
        </span>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-100 transition-colors bg-slate-800/80 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-700/50 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="p-4 overflow-x-auto font-mono text-xs leading-relaxed">
        {hasHighlight ? (
          <code
            className={`prism-code language-${targetLang}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <code className={className}>{codeText}</code>
        )}
      </pre>
    </div>
  );
};

// Custom heading component with proper hierarchy
const Heading1 = ({ children }: any) => (
  <h1 className="text-3xl sm:text-4xl font-bold mt-6 mb-4 text-foreground">
    {children}
  </h1>
);

const Heading2 = ({ children }: any) => (
  <h2 className="text-2xl sm:text-3xl font-bold mt-5 mb-3 text-foreground border-b border-border pb-2">
    {children}
  </h2>
);

const Heading3 = ({ children }: any) => (
  <h3 className="text-xl sm:text-2xl font-bold mt-4 mb-2 text-foreground">
    {children}
  </h3>
);

const Heading4 = ({ children }: any) => (
  <h4 className="text-lg sm:text-xl font-semibold mt-3 mb-2 text-foreground">
    {children}
  </h4>
);

const Heading5 = ({ children }: any) => (
  <h5 className="text-base sm:text-lg font-semibold mt-2 mb-1 text-foreground">
    {children}
  </h5>
);

const Heading6 = ({ children }: any) => (
  <h6 className="text-sm sm:text-base font-semibold mt-2 mb-1 text-muted-foreground">
    {children}
  </h6>
);

// Custom paragraph component
const Paragraph = ({ children }: any) => (
  <p className="my-3 leading-relaxed text-foreground">
    {children}
  </p>
);

// Custom list components
const UnorderedList = ({ children }: any) => (
  <ul className="list-disc list-inside my-3 space-y-1 text-foreground">
    {children}
  </ul>
);

const OrderedList = ({ children }: any) => (
  <ol className="list-decimal list-inside my-3 space-y-1 text-foreground">
    {children}
  </ol>
);

const ListItem = ({ children }: any) => (
  <li className="ml-2 text-foreground">
    {children}
  </li>
);

// Custom blockquote component with GFM Alert/Callout support
const Blockquote = ({ children }: any) => {
  const getElementText = (node: any): string => {
    if (!node) return "";
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(getElementText).join("");
    if (node.props && node.props.children) return getElementText(node.props.children);
    return "";
  };

  const stripAlertPrefix = (node: any): any => {
    let stripped = false;
    
    const recurse = (n: any): any => {
      if (!n) return null;
      
      if (typeof n === "string") {
        if (!stripped) {
          const clean = n.replace(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\r?\n?/i, "");
          if (clean !== n) {
            stripped = true;
          }
          return clean;
        }
        return n;
      }
      
      if (Array.isArray(n)) {
        return n.map(item => {
          if (stripped) return item;
          return recurse(item);
        });
      }
      
      if (n.props && n.props.children) {
        return {
          ...n,
          props: {
            ...n.props,
            children: recurse(n.props.children)
          }
        };
      }
      
      return n;
    };
    
    return recurse(node);
  };

  const text = getElementText(children);
  const match = text.trim().match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);

  if (match) {
    const alertType = match[1].toUpperCase();
    const cleanChildren = stripAlertPrefix(children);

    let styles = {
      border: "border-l-4 border-blue-500 dark:border-blue-400",
      bg: "bg-blue-500/5 dark:bg-blue-500/5",
      text: "text-blue-700 dark:text-blue-300",
      title: "Note",
      icon: <Info className="h-4 w-4" />
    };

    if (alertType === "TIP") {
      styles = {
        border: "border-l-4 border-emerald-500 dark:border-emerald-400",
        bg: "bg-emerald-500/5 dark:bg-emerald-500/5",
        text: "text-emerald-700 dark:text-emerald-300",
        title: "Tip",
        icon: <Lightbulb className="h-4 w-4" />
      };
    } else if (alertType === "IMPORTANT") {
      styles = {
        border: "border-l-4 border-violet-500 dark:border-violet-400",
        bg: "bg-violet-500/5 dark:bg-violet-500/5",
        text: "text-violet-700 dark:text-violet-300",
        title: "Important",
        icon: <AlertCircle className="h-4 w-4" />
      };
    } else if (alertType === "WARNING") {
      styles = {
        border: "border-l-4 border-amber-500 dark:border-amber-400",
        bg: "bg-amber-500/5 dark:bg-amber-500/5",
        text: "text-amber-700 dark:text-amber-300",
        title: "Warning",
        icon: <AlertTriangle className="h-4 w-4" />
      };
    } else if (alertType === "CAUTION") {
      styles = {
        border: "border-l-4 border-rose-500 dark:border-rose-400",
        bg: "bg-rose-500/5 dark:bg-rose-500/5",
        text: "text-rose-700 dark:text-rose-300",
        title: "Caution",
        icon: <AlertOctagon className="h-4 w-4" />
      };
    }

    return (
      <div className={`my-4 p-4 rounded-r-md ${styles.border} ${styles.bg} transition-all duration-200`}>
        <div className={`flex items-center gap-2 mb-2 font-mono text-xs font-bold uppercase tracking-wider ${styles.text}`}>
          {styles.icon}
          <span>{styles.title}</span>
        </div>
        <div className="text-sm leading-relaxed text-foreground">
          {cleanChildren}
        </div>
      </div>
    );
  }

  return (
    <blockquote className="border-l-4 border-amber-500 pl-4 my-3 italic text-muted-foreground bg-muted/20 py-2 rounded-r">
      {children}
    </blockquote>
  );
};

// Custom strikethrough component
const Strikethrough = ({ children }: any) => (
  <del className="line-through text-muted-foreground/75 bg-muted/25 px-0.5 rounded">
    {children}
  </del>
);

// Custom input component (for checklists)
const Input = (props: any) => {
  if (props.type === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={props.checked}
        readOnly
        className="h-3.5 w-3.5 rounded border-gray-300 text-amber-500 focus:ring-amber-500 mr-2 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800 accent-amber-500 cursor-default"
      />
    );
  }
  return <input {...props} />;
};

// Custom link component
const Link = ({ href, children }: any) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-500 dark:text-blue-400 hover:underline"
  >
    {children}
  </a>
);

// Custom table component
const Table = ({ children }: any) => (
  <div className="overflow-x-auto my-4">
    <table className="w-full border-collapse border border-border">
      {children}
    </table>
  </div>
);

const TableHead = ({ children }: any) => (
  <thead className="bg-muted">
    {children}
  </thead>
);

const TableBody = ({ children }: any) => (
  <tbody>
    {children}
  </tbody>
);

const TableRow = ({ children }: any) => (
  <tr className="border-b border-border hover:bg-muted/50">
    {children}
  </tr>
);

const TableCell = ({ children }: any) => (
  <td className="border border-border px-4 py-2 text-left text-foreground">
    {children}
  </td>
);

const TableHeaderCell = ({ children }: any) => (
  <th className="border border-border px-4 py-2 text-left text-foreground font-semibold bg-muted/50">
    {children}
  </th>
);

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  useEffect(() => {
    mermaid.initialize({ startOnLoad: true, theme: "dark" });
    mermaid.contentLoaded();
  }, [content]);

  // Extract and parse YAML frontmatter
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = content.match(frontmatterRegex);

  let frontmatter: Record<string, any> | null = null;
  let markdownContent = content;
  let yamlError: string | null = null;

  if (match) {
    const rawYaml = match[1];
    markdownContent = content.substring(match[0].length);
    try {
      const parsed = yaml.load(rawYaml);
      if (typeof parsed === "object" && parsed !== null) {
        frontmatter = parsed as Record<string, any>;
      }
    } catch (err: any) {
      yamlError = err.message || "Failed to parse YAML";
    }
  }

  return (
    <div className="space-y-4">
      {/* YAML Frontmatter UI Panel */}
      {frontmatter && (
        <Card className="border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/5 overflow-hidden backdrop-blur-sm shadow-sm transition-all duration-200">
          <CardHeader className="bg-amber-500/10 border-b border-amber-500/15 py-2 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Agent Metadata (YAML)
            </CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-600 dark:text-amber-400 py-0 px-1.5 h-4.5 bg-amber-500/10 hover:bg-amber-500/20">
              Parsed
            </Badge>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(frontmatter).map(([key, val]) => (
                <div key={key} className="flex flex-col gap-1 border-b border-border/20 pb-2 sm:border-none sm:pb-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80 font-bold">{key}</span>
                  <div className="text-sm font-medium text-foreground">
                    {renderValue(val)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* YAML Parsing Error Panel */}
      {yamlError && (
        <Card className="border-destructive/30 bg-destructive/5 overflow-hidden shadow-sm">
          <CardHeader className="bg-destructive/10 border-b border-destructive/15 py-2 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-destructive flex items-center gap-1.5 font-mono">
              YAML Parsing Error
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 font-mono text-xs text-destructive bg-destructive/5 whitespace-pre-wrap">
            {yamlError}
          </CardContent>
        </Card>
      )}

      {/* Main Markdown Content */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[]}
        components={{
          h1: Heading1,
          h2: Heading2,
          h3: Heading3,
          h4: Heading4,
          h5: Heading5,
          h6: Heading6,
          p: Paragraph,
          ul: UnorderedList,
          ol: OrderedList,
          li: ListItem,
          blockquote: Blockquote,
          a: Link,
          code: CodeBlock,
          table: Table,
          thead: TableHead,
          tbody: TableBody,
          tr: TableRow,
          td: TableCell,
          th: TableHeaderCell,
          del: Strikethrough,
          input: Input,
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
}
