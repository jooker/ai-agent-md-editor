---
# Mandatory YAML Frontmatter for Skill Definition
# This section provides structured metadata for the skill.
skill_id: template-skill-name # Unique identifier for the skill (lowercase, kebab-case)
name: Template Skill Name # Human-readable name
version: 0.1.0 # Semantic versioning (major.minor.patch)
description: A brief, concise description of what this skill does.
tags: [core, utility, example] # Keywords for categorization and search
author: Your Name/Team # Author of the skill
created_at: YYYY-MM-DD # Date of creation
updated_at: YYYY-MM-DD # Last update date
status: draft # Options: draft, active, deprecated, archived
required_context: # List of essential context variables this skill needs
  - user_query
  - current_task_id
parameters: # Define expected input parameters for the skill
  - name: param1 # Name of the parameter
    type: string # Data type (string, integer, boolean, array, object, enum)
    description: Description of param1.
    required: true # Is this parameter mandatory? (true/false)
    default: "" # Default value if not provided
  - name: param2
    type: integer
    description: An optional integer parameter.
    required: false
    default: 0
output: # Describe the expected output of the skill
  type: object # Or string, array, boolean, etc.
  properties: # If type is object, define its properties
    result_status:
      type: string
      description: "Status of the skill execution (success, failure, partial)."
    payload:
      type: object
      description: "The main data returned by the skill."
      properties:
        key_name:
          type: string
          description: "Description of the key_name property."
    error_message:
      type: string
      description: "Error message if the skill fails."
---

# SKILL: Template Skill Name

## Overview
This document defines the structure and usage of the `Template Skill Name` skill. This skill is designed to [elaborate on the skill's primary function and purpose in more detail than the YAML description]. It serves as a foundational example for creating new agent skills within our system.

## Purpose
The main purpose of this skill is to demonstrate how to structure a `SKILL.md` file, including its mandatory YAML frontmatter, detailed parameter definitions, output specifications, and workflow integration guidance. Functionally, it could, for example, simulate a data retrieval operation or a simple calculation.

## Usage and Invocation

### Direct Invocation (API/CLI Example)
To invoke this skill directly, you would typically use a command-line interface or an API call that routes to the skill's underlying implementation.

```bash
# Example CLI invocation
agent-cli skill invoke template-skill-name --param1 "value1" --param2 123