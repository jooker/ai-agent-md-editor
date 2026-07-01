# Markdown Layout Guidelines for AI Parsing

AI models parse and comprehend structured Markdown much more effectively than raw blocks of paragraph text. Using consistent layouts improves model adherence to instructions and reduces syntax confusion.

---

## 1. Strict Heading Hierarchy
Maintain a clean, linear heading hierarchy (`#`, `##`, `###`, `####`). Never skip levels (e.g., going from `#` directly to `###`).
* `#` - Main document title/goal (use only one per document).
* `##` - Main sections (Role, Task Flow, Rules, Examples).
* `###` - Sub-sections or specific step phases.
* `####` - File-level actions or fine-grained constraints.

---

## 2. Structured Lists over Paragraphs
Whenever describing a multi-step sequence or a set of rules, use bullet points or numbered lists. This allows the model's self-attention mechanism to focus on discrete instructions.

* **Avoid**: "First you should look for the files in the directory and make sure you list them all. After listing them, you should open the main file and read it, and then check for any bugs that might be there."
* **Use**:
  1. List all files in the target directory.
  2. Open and inspect the main code file.
  3. Identify and document any bugs or syntax errors.

---

## 3. Demarcating Inputs and Outputs with XML Tags
XML tags are highly readable for LLMs. They prevent content mixing (where the user's input leaks into the model's instruction context).

```xml
Use these tags to wrap user data and reasoning:

<context>
[System or environmental context]
</context>

<thinking>
[Internal reasoning and steps]
</thinking>

<response>
[User-facing output]
</response>
```

---

## 4. Bold Text for Key Elements
Use **bolding** to draw the model's attention to critical keywords, command names, variables, or outcomes. This improves adherence during execution.
* E.g., "The script **MUST** be run in the background."
* E.g., "If the user input contains **sensitive credentials**, immediately abort execution."
