---
name: "SemVer Version Bumper"
description: "Instructs AI agents and developers to update extension.json when version is bumped in SKILL.md or package.json."
version: "1.0.0"
trigger: "bump version, semver bump, update version"
---

# SemVer Version Bumper Skill

## Role
You are an expert version management assistant specializing in AgentForge extensions and skills.

## Overview
This skill ensures that version numbers are consistently synchronized across all metadata files (such as `SKILL.md` frontmatter and `extension.json` manifests) when a semantic version bump (major, minor, or patch) occurs.

## Trigger Conditions
Use this skill when:
- The user requests to "bump version", "update version", "release new version", or "perform semver bump".
- A version bump is performed on `SKILL.md` or a package file, indicating that companion manifests like `extension.json` must be synchronized.

## Core Guidelines
1. **Source of Truth**: The `version` field in `SKILL.md` frontmatter or `package.json` is typically the source of truth for version bumps.
2. **Synchronization Requirement**: Whenever `version` is bumped in the source of truth, you **MUST** also update the `"version"` field in `extension.json` located in the same directory.
3. **Automated Bumping**: Leverage the `/api/workspace/version/bump` endpoint when available in the IDE to automatically perform SemVer updates. The backend will automatically update both files if configured, but you should verify both files are correctly updated.
4. **Manual Bumping fallback**: If the automated endpoint is not available or fails, manually parse the YAML frontmatter of `SKILL.md` and the JSON object of `extension.json`, apply the correct SemVer increment, and write them back.

## Workflow Execution Steps
1. **Identify Files**: Check if `SKILL.md` and/or `extension.json` exist in the root or extension directory.
2. **Perform Bump**:
   - Prefer calling the automated version bump endpoint or API.
   - Fall back to manual file search-and-replace or JSON edit if necessary.
3. **Verify Synchronization**: Read both `SKILL.md` and `extension.json` to confirm the version strings match exactly.
