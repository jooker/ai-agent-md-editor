---
name: ai-prompt-expert
description: Expert prompt engineer and instruction designer. Use this skill when you need to write, edit, or optimize AI agent instructions, system prompts, or Markdown files used by AI. It helps make instructions clear, concise, token-efficient (saving credits), and structured using the best design patterns.
license: Complete terms in LICENSE.txt
---

# AI Prompt Expert

This skill package equips you with the tools and guidelines to write high-performance, credit-saving AI agent prompts and Markdown instructions.

## The Core Philosophy: "Clear, Concise, and Credit-Saving"

AI agent instructions often suffer from context bloat—verbose explanations, repetitive constraints, and unstructured rules that waste tokens and increase operational costs (credits). 

**Key Rule:** Write prompts for *AI agents*, not humans. AI models are highly capable pattern matchers. They do not need verbose introductions, polite filler, or repetitive reinforcement. They need precise, structured constraints.

### Core Workflows

1. **Create New Prompts**: Use the standard template in [agent-prompt-template.md](templates/agent-prompt-template.md) to structure the agent's role, task flow, and rules.
2. **Optimize Existing Prompts**: Use the automated analysis script [analyze_prompt.py](scripts/analyze_prompt.py) to measure token density and detect wordy anti-patterns.
3. **Refine Content**: Apply credit-saving strategies to condense rules and constraints.

---

## Workspace Navigation

To keep the main instructions lean and preserve context window tokens, the detailed design guides are split into separate reference files. Load them only when relevant to your current task:

- **Credit Saving & Efficiency**: See [credit-saving-strategies.md](references/credit-saving-strategies.md) for techniques on trimming filler text, consolidating redundant rules, and optimizing examples.
- **Markdown Layout for AI**: See [markdown-layout.md](references/markdown-layout.md) for structural layout standards (headings, list nesting, XML tags wrapping) optimized for AI parsing.
- **Boilerplate Template**: See [agent-prompt-template.md](templates/agent-prompt-template.md) for a ready-to-use, minimal, token-efficient agent prompt.
- **Case Study (Before & After)**: See [prompt-before-after.md](examples/prompt-before-after.md) to see how a verbose prompt was optimized to save 75% in token costs while maintaining identical performance.

---

## Step-by-Step Optimization Process

Follow these steps to analyze and refine any AI agent prompt or instruction file:

### Step 1: Run the Automated Analyzer
Run the Python analyzer on the target markdown or text file to identify potential improvements:
```bash
python scripts/analyze_prompt.py <path-to-prompt-file.md>
```
The script will output:
* File stats (lines, words, characters, estimated tokens)
* List of detected verbose patterns (e.g., "please try to", "you should make sure to")
* Recommendations for refactoring specific sections

### Step 2: Refine Constraints (ALWAYS / NEVER)
Group unstructured rules into explicit, absolute categories. Replace paragraphs of text with short bullet points:
* **ALWAYS**: Critical instructions the model must follow.
* **NEVER**: Hard restrictions and negative guardrails.
* **ASK FIRST**: Checkpoints that require human intervention.

### Step 3: Remove Redundant Rules
Scan the prompt for instructions that repeat the same concept in different ways. Merge them into a single, concise constraint.

### Step 4: Verify & Compare
Save the optimized prompt, recalculate the token usage, and verify that all core objectives are preserved. The optimized file should ideally be **30% to 70% smaller** in token size.
