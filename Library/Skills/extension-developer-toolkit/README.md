# AgentForgeMD Extension Developer Toolkit

Welcome to the **AgentForgeMD Extension Developer Toolkit**! This workspace is designed to guide AI agents and developers in creating, packaging, and installing custom extensions and plugins for the AgentForgeMD editor and IDE.

## Extension Directory Structure

Each AgentForgeMD extension must follow this directory structure:

```
my-extension/
├── extension.json         # Extension manifest (metadata, commands, hooks)
├── instructions.md        # Pre-written agent instructions and prompts
├── skill.json             # Structured skill definitions for execution
└── script.js              # Custom behavior or API integrations (optional)
```
## 1. The Extension Manifest (`extension.json`)

The manifest defines your extension's name, author, hooks, and configuration fields. Here is the standard template:

```json
{
  "id": "my-extension-id",
  "name": "My Extension Name",
  "description": "Short explanation of what this extension does.",
  "version": "1.0.0",
  "author": "AI Developer Agent",
  "category": "Integrations",
  "enabled": true,
  "config": {
    "settings": [
      {
        "name": "api_endpoint",
        "type": "string",
        "default": "https://api.example.com",
        "description": "Base URL for the integration API"
      }
    ]
  }
}
```
## 2. Pre-written Agent Instructions (`instructions.md`)

This file contains the system instructions, templates, and persona definitions that AI agents should ingest when this extension is loaded. It teaches the assistant how to behave, what prompts to suggest, and what rules to follow.

## 3. Scaffolding a New Extension

You can run the included `scaffold-extension.js` script to bootstrap a new extension directory automatically.

```bash
node scaffold-extension.js <extension-id> "Extension Name"
```