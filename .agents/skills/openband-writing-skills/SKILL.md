---
name: openband-writing-skills
description: Guide for authoring and refining portable, high-value OpenBand SKILL.md files.
---

# OpenBand Writing Agent Skills

Guidelines for authoring and maintaining high-value Agent Skills under `.agents/skills/`.

## Frontmatter Requirements

Every skill file MUST begin with valid YAML frontmatter:

```yaml
---
name: openband-<skill-name>
description: A concise, clear summary of what this skill accomplishes.
---
```

- **`name`**: MUST match the exact containing folder name under `.agents/skills/`.
- **`description`**: Clear, active-voice sentence describing when and why to invoke the skill.

## Content Structure Guidelines

1. **Title & Purpose**: High-level objective of the skill.
2. **Cognitive Workflow**: Step-by-step numbered instructions for execution.
3. **Rules & Constraints**: Concrete repository constraints (e.g., bridge isolation, AudioContext handling, OpenSpec flow).
4. **Actionable Examples**: Short code or workflow snippets illustrating expected usage.
