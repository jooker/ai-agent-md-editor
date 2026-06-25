import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import mermaid from "mermaid";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
}

// Custom component for code blocks with Mermaid support
const CodeBlock = ({ inline, className, children }: any) => {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (language === "mermaid" && codeRef.current) {
      mermaid.contentLoaded();
    }
  }, [language]);

  if (language === "mermaid") {
    return (
      <div
        ref={codeRef}
        className="mermaid my-4 flex justify-center bg-muted/20 p-4 rounded-lg overflow-x-auto"
      >
        {String(children).replace(/\n$/, "")}
      </div>
    );
  }

  return (
    <pre className="bg-muted text-muted-foreground p-4 rounded-lg overflow-x-auto my-3 border border-border">
      <code className={className}>
        {children}
      </code>
    </pre>
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

// Custom blockquote component
const Blockquote = ({ children }: any) => (
  <blockquote className="border-l-4 border-amber-500 pl-4 my-3 italic text-muted-foreground bg-muted/20 py-2 rounded-r">
    {children}
  </blockquote>
);

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

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
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
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
