# Agent Skill: agentimportmemory

## Overview
This document outlines the `agentimportmemory` skill, designed to facilitate the import and management of various types of memory within an agent's operational context. This skill enhances the agent's ability to learn, recall, and utilize information efficiently by providing standardized mechanisms for memory ingestion and retrieval.

## Purpose
The primary purpose of this skill is to:
*   Standardize the import process for different memory formats (e.g., text, JSON, code snippets, contextual embeddings).
*   Provide an interface for agents to add new information to their long-term or short-term memory stores.
*   Enable contextual memory import based on specific triggers or directives.
*   (Add more specific purposes related to `agentimportmemory`)

## Capabilities
This skill offers the following key capabilities:
*   **`import_text_memory(content: str, context: Optional[str] = None)`**: Imports raw text content into the agent's memory. Optional context can be provided for better organization.
*   **`import_json_memory(data: dict, schema: Optional[dict] = None)`**: Imports structured JSON data. A schema can be optionally provided for validation.
*   **`import_code_snippet(code: str, language: str, description: Optional[str] = None)`**: Imports code snippets, tagging them with language and an optional description.
*   **`import_file_content(file_path: str, encoding: str = 'utf-8')`**: Reads content from a specified file path and imports it as memory.
*   **(Add other specific functions your skill provides)**

## Configuration (`skill.json`)
The `skill.json` file defines the metadata and entry point for this skill. Key parameters include:
*   `name`: `agentimportmemory`
*   `version`: `0.1.0` (or current version)
*   `description`: A brief summary of the skill.
*   `entrypoint`: `scripts/main.js` (or your chosen entry file)
*   `capabilities`: A list of functions this skill exposes, including their parameters and descriptions.

## Usage

### Prerequisites
*   Node.js environment (assuming JavaScript implementation).
*   Any specific dependencies listed in `package.json` (if applicable).

### Integrating with an Agent
To use this skill, an agent system should:
1.  **Discover the skill:** Read `skill.json` to understand its capabilities.
2.  **Invoke the skill:** Call the appropriate function (e.g., `import_text_memory`) via the defined `entrypoint` with the required arguments.

### Example Invocation (Conceptual)
```javascript
// From an agent's main script or orchestrator
const agentimportmemory = require('./Library/Skills/agentimportmemory/scripts/main');

async function processNewInformation(textData) {
    console.log("Importing new text memory...");
    const result = await agentimportmemory.import_text_memory(textData, "recent_conversation");
    console.log("Memory import result:", result);
}

// Example usage
processNewInformation("User said: 'Please summarize the last meeting notes for me.'");
Development
Setup
Navigate to the skill directory:
cd E:/Node/Manus Projects/ai-agent-md-editor/ai-agent-md-editor/Library/Skills/agentimportmemory
Install dependencies (if any):
npm install
(if you add a
package.json
)
Running Tests
(If you add a `tests/ directory and testing framework)

npm test
Roadmap
Implement advanced memory indexing and search capabilities.
Support for different memory backends (e.g., vector databases, knowledge graphs).
Error handling and robust logging.
(Add more future plans)
License
(Specify your license here, e.g., MIT, Apache 2.0, etc.)

Contributing
We welcome contributions! Please see our
CONTRIBUTING.md
(if applicable) for guidelines.


***