#!/usr/bin/env python3
import sys
import os
import re

# Common verbose patterns in AI prompts and suggestions for replacement
VERBOSE_PATTERNS = [
    (r"(?i)\bplease make sure to\b", "make sure to (or just the verb directly)"),
    (r"(?i)\bmake sure you\b", "imperative verb directly"),
    (r"(?i)\byou should try to\b", "try to (or just the verb directly)"),
    (r"(?i)\byou should always\b", "ALWAYS:"),
    (r"(?i)\bunder no circumstances should you ever\b", "NEVER:"),
    (r"(?i)\bit is important to note that\b", "Note: (or remove entirely)"),
    (r"(?i)\bplease note that\b", "Note: (or remove entirely)"),
    (r"(?i)\bi would appreciate if you could\b", "imperative verb directly"),
    (r"(?i)\bwould be appreciated if you could\b", "imperative verb directly"),
    (r"(?i)\bin order to\b", "to"),
    (r"(?i)\bso that you can\b", "to"),
    (r"(?i)\byou are requested to\b", "must (or imperative verb)"),
    (r"(?i)\bplease try to\b", "try to"),
    (r"(?i)\bensure that you\b", "ensure (or imperative verb)"),
    (r"(?i)\bkeep in mind that\b", "Note:"),
]

def analyze_prompt(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        sys.exit(1)

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.splitlines()
    word_count = len(content.split())
    char_count = len(content)
    line_count = len(lines)
    
    # Rough token estimation (standard rule of thumb: ~4 characters per token or 1.3 words per token)
    est_tokens = int(max(char_count / 4.0, word_count * 1.3))

    print("=" * 60)
    print(f" Prompt Analysis: {os.path.basename(file_path)}")
    print("=" * 60)
    print(f" Lines:       {line_count}")
    print(f" Words:       {word_count}")
    print(f" Characters:  {char_count}")
    print(f" Est. Tokens: {est_tokens}")
    print("-" * 60)

    # Scan for verbose patterns
    issues = []
    for line_idx, line in enumerate(lines, 1):
        for pattern, replacement in VERBOSE_PATTERNS:
            matches = re.finditer(pattern, line)
            for m in matches:
                issues.append({
                    "line": line_idx,
                    "phrase": m.group(0),
                    "suggest": replacement,
                    "text": line.strip()
                })

    if issues:
        print(f" Found {len(issues)} verbose or redundant phrases:")
        print("-" * 60)
        for issue in issues:
            print(f" Line {issue['line']}: Found '{issue['phrase']}'")
            print(f"   Context:   \"{issue['text']}\"")
            print(f"   Suggest:   Replace with '{issue['suggest']}'")
            print()
    else:
        print(" Perfect! No verbose or redundant phrases detected.")
        print("-" * 60)

    # Concise Rating
    density = word_count / max(line_count, 1)
    print(" Conciseness Evaluation:")
    if est_tokens < 150:
        print(" Rating: Highly Concise (Excellent token efficiency!)")
    elif est_tokens < 350:
        print(" Rating: Moderately Concise (Good, but check for redundancies.)")
    else:
        print(" Rating: High Token Count (Consider using Progressive Disclosure / reference files.)")
    print("=" * 60)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_prompt.py <path_to_prompt.md>")
        sys.exit(1)
    
    analyze_prompt(sys.argv[1])
