export interface SuggestedPrompt {
  label: string;
  prompt: string;
}

export const SUGGESTED_PROMPTS_DB: Record<string, SuggestedPrompt[]> = {
  "Prompt Expert": [
    {
      label: "Optimize Prompt Phrasing",
      prompt: "Review this prompt for clarity and suggest improvements using the role-instruction-context-constraint (RICC) framework: [insert your prompt here]"
    },
    {
      label: "Convert to Few-Shot",
      prompt: "Transform this zero-shot prompt into a few-shot prompt by writing 2 structured, high-quality input-output examples."
    },
    {
      label: "Enforce JSON Schema",
      prompt: "Design a system prompt that enforces outputting strictly in clean, valid JSON with a specific TypeScript schema."
    },
    {
      label: "Persona for Feynman Tutor",
      prompt: "Create a system instruction for an AI tutor that teaches complex topics using the Feynman Technique and asks interactive questions."
    },
    {
      label: "Implement Chain of Thought",
      prompt: "Optimize this reasoning prompt to enforce step-by-step thinking using <thinking> tags before the final output."
    },
    {
      label: "Block Placeholders/TBDs",
      prompt: "Construct a prompt for a code generation agent that strictly forbids using placeholders, comments as implementations, or TBDs."
    },
    {
      label: "Steve Jobs Tone Guide",
      prompt: "Draft a prompt that directs the AI to write copywriting in the exact tone of Steve Jobs, utilizing short, impact-focused sentences."
    }
  ],
  "Instruction Architect": [
    {
      label: "Draft API Skill Package",
      prompt: "Draft a complete SKILL.md template for a TypeScript API generation skill package conforming to the agentskills standard."
    },
    {
      label: "YAML Header Validation",
      prompt: "Review this SKILL.md frontmatter header for semver compliance and check if the description is optimal for agent routing."
    },
    {
      label: "Task Decomposition Guide",
      prompt: "Provide a comprehensive guide on how an agent should break down a large coding task into atomic implementation phases."
    },
    {
      label: "LLM-Readable Markdown Rules",
      prompt: "Create a checklist for writing clean markdown instructions that are highly readable by agentic LLMs."
    },
    {
      label: "WordPress Auditor Triggers",
      prompt: "Generate a collection of targeted triggers and description keys for a WordPress plugin auditor skill package."
    },
    {
      label: "Context Maintenance Guide",
      prompt: "Explain best practices for using system prompts to maintain agent state across multi-turn developer sessions."
    }
  ],
  "Code Architect": [
    {
      label: "Markdown Link Validator",
      prompt: "Write a Node.js script to parse markdown files and check if all relative file links point to files that actually exist."
    },
    {
      label: "Pytest Result Formatter",
      prompt: "Write a Python script that runs tests using pytest, captures failures, and formats them into a clean markdown report."
    },
    {
      label: "TypeScript CI Workflow",
      prompt: "Draft a GitHub Actions workflow YAML file that automatically runs the project's linter and TypeScript type-check on pull requests."
    },
    {
      label: "CLI Dependency Verifier",
      prompt: "Create a lightweight bash script to verify if required CLI dependencies (node, npm, git, gh) are installed in the workspace."
    },
    {
      label: "Multi-Stage Dockerfile",
      prompt: "Write a minimal multi-stage Dockerfile optimized for a Vite/Node.js application to keep production image sizes tiny."
    },
    {
      label: "CRLF to LF Line Ending Fixer",
      prompt: "Write a Python script to recursively find all text files in a directory and fix their line endings (CRLF to LF)."
    }
  ],
  "New Project": [
    {
      label: "SaaS Landing Page Setup",
      prompt: "Scaffold a complete modern responsive web landing page for a SaaS startup using CSS and vanilla JS."
    },
    {
      label: "Next.js App Router Structure",
      prompt: "Draft a modern Next.js project layout with TypeScript, shadcn/ui components, and route handlers."
    },
    {
      label: "Rust CLI Scaffolding",
      prompt: "Plan and scaffold a Rust command-line tool directory layout with a clap-based parser and unit tests."
    },
    {
      label: "Chrome Extension Setup",
      prompt: "Create a project structure for a Chrome manifest v3 extension with background service worker and content script."
    },
    {
      label: "Express GraphQL API",
      prompt: "Draft an Express GraphQL server setup with Apollo Server, custom query resolvers, and type definitions."
    },
    {
      label: "Python Data Pipeline Setup",
      prompt: "Plan a modular Python ETL data pipeline directory with pandas, sqlalchemy, and unit test suites."
    }
  ]
};
