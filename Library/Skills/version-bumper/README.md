# SemVer Version Bumper

A complete skill package to keep extension and skill versions in sync.

## Structure
- `extension.json`: Manifest file containing metadata and current version.
- `SKILL.md`: The agent instruction file containing YAML frontmatter with the version.
- `README.md`: This documentation.

## Features
- **Auto-Sync**: The backend `/api/workspace/version/bump` route automatically synchronizes the version bump to both `SKILL.md` and `extension.json`.
- **Consistency**: Prevents mismatched versions between the IDE extension system and the agent skill registry.
