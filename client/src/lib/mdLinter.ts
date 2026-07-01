export interface Diagnostic {
  id: string;
  line: number;
  rule: string;
  severity: "warning" | "error" | "info";
  message: string;
  suggestion?: string;
  fixText?: string; // Content to replace the line with (for quick fix)
}

export function lintMarkdown(content: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (!content) return diagnostics;

  const lines = content.split(/\r?\n/);
  
  // ── Rule 1: YAML Frontmatter Position (MD041-YAML) ─────────────────────
  const hasYamlStart = lines[0]?.trim() === "---";
  if (hasYamlStart) {
    let closed = false;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "---") {
        closed = true;
        break;
      }
    }
    if (!closed) {
      diagnostics.push({
        id: `md-yaml-unclosed`,
        line: 1,
        rule: "MD041-YAML",
        severity: "error",
        message: "YAML frontmatter is opened but never closed with '---'",
        suggestion: "Add a closing '---' line."
      });
    }
  } else {
    // Check if YAML exists somewhere else in the file
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "---") {
        diagnostics.push({
          id: `md-yaml-position-${i}`,
          line: i + 1,
          rule: "MD041-YAML",
          severity: "warning",
          message: "YAML frontmatter block found but it is not at the very top of the file",
          suggestion: "Move the YAML block to the first line."
        });
        break;
      }
    }
  }

  let lastHeadingLevel = 0;
  let insideCodeBlock = false;
  let consecutiveEmptyLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Track code block toggle
    if (trimmed.startsWith("```")) {
      insideCodeBlock = !insideCodeBlock;
      continue;
    }

    if (insideCodeBlock) continue;

    // ── Rule 2: Multiple Consecutive Blank Lines (MD012) ───────────────────
    if (trimmed === "") {
      consecutiveEmptyLines++;
      if (consecutiveEmptyLines >= 2) {
        diagnostics.push({
          id: `md-empty-lines-${i}`,
          line: i + 1,
          rule: "MD012",
          severity: "info",
          message: "Multiple consecutive blank lines",
          suggestion: "Remove redundant empty lines.",
          fixText: "" // Delete line
        });
      }
    } else {
      consecutiveEmptyLines = 0;
    }

    // ── Rule 3: Trailing Spaces (MD009) ──────────────────────────────────
    // In markdown, two spaces at the end of a line is a valid hard break.
    // However, more than 2 spaces, tabs, or single trailing spaces are considered formatting slop.
    const trailingSpaceMatch = line.match(/(\s+)$/);
    if (trailingSpaceMatch && trimmed !== "") {
      const spaces = trailingSpaceMatch[1];
      if (spaces !== "  " || line.endsWith("\t")) {
        diagnostics.push({
          id: `md-trailing-space-${i}`,
          line: i + 1,
          rule: "MD009",
          severity: "warning",
          message: "Trailing spaces found at the end of the line",
          suggestion: "Trim trailing spaces.",
          fixText: line.trimEnd()
        });
      }
    }

    // ── Rule 4: Headings Level Hierarchy (MD001) ──────────────────────────
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      
      // Check surrounding blank lines (MD022)
      if (i > 0 && lines[i - 1].trim() !== "" && lines[i - 1].trim() !== "---") {
        diagnostics.push({
          id: `md-heading-spacing-before-${i}`,
          line: i + 1,
          rule: "MD022",
          severity: "info",
          message: "Headings should be preceded by a blank line",
          suggestion: "Insert a blank line before the heading."
        });
      }

      if (lastHeadingLevel > 0 && level > lastHeadingLevel + 1) {
        diagnostics.push({
          id: `md-heading-hierarchy-${i}`,
          line: i + 1,
          rule: "MD001",
          severity: "warning",
          message: `Heading level skips from H${lastHeadingLevel} directly to H${level}`,
          suggestion: `Change heading to H${lastHeadingLevel + 1} or adjust nesting.`
        });
      }
      lastHeadingLevel = level;
    }

    // ── Rule 5: Empty Links or Placeholders (MD042) ──────────────────────
    const emptyLinkMatch = line.match(/\[([^\]]+)\]\((|\s*|url)\)/);
    if (emptyLinkMatch) {
      diagnostics.push({
        id: `md-empty-link-${i}`,
        line: i + 1,
        rule: "MD042",
        severity: "warning",
        message: `Link placeholder or empty destination URL found: "${emptyLinkMatch[0]}"`,
        suggestion: "Provide a valid URL address."
      });
    }

    // ── Rule 6: GFM Alert Case Sensitivity ───────────────────────────────
    const alertMatch = line.match(/^(>\s*\[!)(note|tip|important|warning|caution)(\])/i);
    if (alertMatch) {
      const exactType = alertMatch[2];
      if (exactType !== exactType.toUpperCase()) {
        diagnostics.push({
          id: `md-alert-case-${i}`,
          line: i + 1,
          rule: "GFM-ALERT-CASE",
          severity: "info",
          message: `GFM Alert tags should be uppercase (e.g. [!${exactType.toUpperCase()}])`,
          suggestion: `Convert [!${exactType}] to uppercase.`,
          fixText: line.replace(`[!${exactType}]`, `[!${exactType.toUpperCase()}]`)
        });
      }
    }

    // ── Rule 7: Unclosed Inline Backticks ─────────────────────────────────
    const backtickCount = (line.match(/`/g) || []).length;
    if (backtickCount % 2 !== 0 && !line.includes("```")) {
      diagnostics.push({
        id: `md-unclosed-inline-${i}`,
        line: i + 1,
        rule: "MD-BACKTICK-BALANCE",
        severity: "warning",
        message: "Line has an unbalanced number of inline backticks",
        suggestion: "Ensure all code snippets are enclosed with matching backticks."
      });
    }
  }

  // ── Rule 8: Missing H1 Heading (MD041-H1) ──────────────────────────────
  if (!hasYamlStart) {
    let hasH1 = false;
    for (const line of lines) {
      if (line.startsWith("# ")) {
        hasH1 = true;
        break;
      }
    }
    if (!hasH1 && lines.length > 0) {
      diagnostics.push({
        id: `md-missing-h1`,
        line: 1,
        rule: "MD041-H1",
        severity: "warning",
        message: "Document does not contain any H1 heading (e.g. '# Document Title')",
        suggestion: "Add a top-level H1 heading to serve as the document title."
      });
    }
  }

  return diagnostics;
}
