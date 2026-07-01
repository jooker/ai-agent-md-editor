---
name: hyperframes-cli
description: HyperFrames CLI tool — hyperframes init, lint, inspect, preview, render, doctor, browser, info, upgrade, compositions, docs, benchmark. Use when scaffolding a project, linting, validating, inspecting visual layout in compositions, previewing in the studio, rendering to video, or troubleshooting the HyperFrames environment. (In Manus, the CLI's `transcribe` and `tts` subcommands are disabled — see ../_manus-overrides/media-generation.md.)
---

<!-- Modified by Manus: description revised; init Whisper side-effect note removed; Transcription and TTS sections replaced with disabled-in-Manus notice. Original upstream: heygen-com/hyperframes@8d83d4f / skills/hyperframes-cli/SKILL.md. See ../_manus-overrides/modifications.md. -->

# HyperFrames CLI

Everything runs through `npx hyperframes`. Requires Node.js >= 22 and FFmpeg.

## Workflow

1. **Scaffold** — `npx hyperframes init my-video`
2. **Write** — author HTML composition (see the `hyperframes` skill)
3. **Lint** — `npx hyperframes lint`
4. **Visual inspect** — `npx hyperframes inspect`
5. **Preview** — `npx hyperframes preview`
6. **Render** — `npx hyperframes render`

Lint and inspect before preview. `lint` catches missing `data-composition-id`, overlapping tracks, and unregistered timelines. `inspect` opens the rendered composition in headless Chrome, seeks through the timeline, and reports text spilling out of bubbles/containers or off the canvas.

## Scaffolding

```bash
npx hyperframes init my-video                        # interactive wizard
npx hyperframes init my-video --example warm-grain   # pick an example
npx hyperframes init my-video --video clip.mp4        # with video file
npx hyperframes init my-video --audio track.mp3       # with audio file
npx hyperframes init my-video --example blank --tailwind # with Tailwind v4 browser runtime
npx hyperframes init my-video --non-interactive       # skip prompts (CI/agents)
```

Templates: `blank`, `warm-grain`, `play-mode`, `swiss-grid`, `vignelli`, `decision-tree`, `kinetic-type`, `product-promo`, `nyt-graph`.

<!-- Modified by Manus: removed Whisper transcription side-effect from init description; transcription is handled separately via Manus-native paths. See ../_manus-overrides/modifications.md. -->

`init` creates the right file structure, copies media, and installs AI coding skills. Use it instead of creating files by hand. Audio transcription is **not** performed by `init` in Manus — see [Transcription](#transcription) below.

When using `--tailwind`, invoke the `tailwind` skill before editing classes or theme tokens. The scaffold uses Tailwind v4.2 via the browser runtime, not Studio's Tailwind v3 setup.

## Linting

```bash
npx hyperframes lint                  # current directory
npx hyperframes lint ./my-project     # specific project
npx hyperframes lint --verbose        # info-level findings
npx hyperframes lint --json           # machine-readable
```

Lints `index.html` and all files in `compositions/`. Reports errors (must fix), warnings (should fix), and info (with `--verbose`).

## Visual Inspect

```bash
npx hyperframes inspect                 # inspect rendered layout over the timeline
npx hyperframes inspect ./my-project    # specific project
npx hyperframes inspect --json          # agent-readable findings
npx hyperframes inspect --samples 15    # denser timeline sweep
npx hyperframes inspect --at 1.5,4,7.25 # explicit hero-frame timestamps
```

Use this after `lint` and `validate`, especially for compositions with speech bubbles, cards, captions, or tight typography. It reports:

- Text extending outside the nearest visual container or bubble
- Text clipped by its own fixed-width/fixed-height box
- Text extending outside the composition canvas
- Children escaping clipping containers

Errors should be fixed before rendering. Warnings are surfaced for agent review; add `--strict` to fail on warnings too. Repeated static issues are collapsed by default so JSON output stays compact for LLM context windows. If overflow is intentional for an entrance/exit animation, mark the element or ancestor with `data-layout-allow-overflow`. If a decorative element should never be audited, mark it with `data-layout-ignore`.

`npx hyperframes layout` remains available as a compatibility alias for the same visual inspection pass.

## Previewing

```bash
npx hyperframes preview                   # serve current directory
npx hyperframes preview --port 4567       # custom port (default 3002)
```

Hot-reloads on file changes. Opens the studio in your browser automatically.

When handing a project back to the user, use the Studio project URL, not the
source `index.html` path:

```text
http://localhost:<port>/#project/<project-name>
```

Use the actual port from the preview output and the project directory name. For
example, after `npx hyperframes preview --port 3017` in `codex-openai-video`,
report `http://localhost:3017/#project/codex-openai-video`.

Treat `index.html` as source-code context only. It is fine to link it as an
implementation file, but do not label it as the project or preview surface.

## Rendering

```bash
npx hyperframes render                                # standard MP4
npx hyperframes render --output final.mp4             # named output
npx hyperframes render --quality draft                # fast iteration
npx hyperframes render --fps 60 --quality high        # final delivery
npx hyperframes render --format webm                  # transparent WebM
npx hyperframes render --docker                       # byte-identical
```

| Flag           | Options               | Default                    | Notes                       |
| -------------- | --------------------- | -------------------------- | --------------------------- |
| `--output`     | path                  | renders/name_timestamp.mp4 | Output path                 |
| `--fps`        | 24, 30, 60            | 30                         | 60fps doubles render time   |
| `--quality`    | draft, standard, high | standard                   | draft for iterating         |
| `--format`     | mp4, webm             | mp4                        | WebM supports transparency  |
| `--workers`    | 1-8 or auto           | auto                       | Each spawns Chrome          |
| `--docker`     | flag                  | off                        | Reproducible output         |
| `--gpu`        | flag                  | off                        | GPU-accelerated encoding    |
| `--strict`     | flag                  | off                        | Fail on lint errors         |
| `--strict-all` | flag                  | off                        | Fail on errors AND warnings |

**Quality guidance:** `draft` while iterating, `standard` for review, `high` for final delivery.

## Snapshot

<!-- Added by Manus: snapshot command was undocumented in the upstream CLI skill but is a valid HyperFrames CLI subcommand. See ../../_manus-overrides/modifications.md. -->

```bash
npx hyperframes snapshot <project-dir> --at <timestamps>
```

Capture key frames as PNG screenshots. Use this after `lint` and `validate` to visually verify the rendered layout at specific timestamps.

| Flag           | Description               |
| -------------- | ------------------------- |
| `--at`         | Comma-separated list of timestamps in seconds (e.g., `1.5,4,7.25`) |

Output lands in `<project-dir>/snapshots/` with filenames like `frame-00-at-2.9s.png`.

## Transcription & Text-to-Speech (Disabled in Manus)

<!-- Modified by Manus: `npx hyperframes transcribe` and `npx hyperframes tts` blocks removed; routed to Manus-native tools. Original upstream: heygen-com/hyperframes@8d83d4f. See ../_manus-overrides/modifications.md. -->

In Manus, the upstream `npx hyperframes transcribe` and `npx hyperframes tts` subcommands are **disabled**. Use these Manus-native paths instead:

- **Narration / voiceover** — call the Manus `generate_speech` tool (returns `.wav`).
- **Word-level timestamps** — transcribe any audio (including `generate_speech` output) via the OpenAI Whisper API with `timestamp_granularities=["word"]`.
- **Importing existing `.srt` / `.vtt`** — read the file directly and parse cues into `[{ text, start, end }]`; no CLI required.

The full contract is in [../_manus-overrides/media-generation.md](../_manus-overrides/media-generation.md).

## Troubleshooting

```bash
npx hyperframes doctor       # check environment (Chrome, FFmpeg, Node, memory)
npx hyperframes browser      # manage bundled Chrome
npx hyperframes info         # version and environment details
npx hyperframes upgrade      # check for updates
```

Run `doctor` first if rendering fails. Common issues: missing FFmpeg, missing Chrome, low memory.

## Other

```bash
npx hyperframes compositions   # list compositions in project
npx hyperframes docs           # open documentation
npx hyperframes benchmark .    # benchmark render performance
```
