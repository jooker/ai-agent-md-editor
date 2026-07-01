---
name: html-video-production
description: Produce editable, scene-based HTML video projects (built on HyperFrames, an open-source HTML-to-video framework by HeyGen) — video as HTML with data-attribute timing, motion driven by GSAP, captions synced to narration, website-to-video pipelines, registry blocks, and deterministic MP4 renders. Use when the user wants a video that is reproducible, inspectable, and editable, built from structured sources (PDF, GitHub repo, CSV, slide deck, design doc, website URL), or mentions HyperFrames, GSAP timelines, kinetic typography, data-driven motion graphics, lower thirds, title cards, animated charts, lyric or karaoke captions, or website-to-video. Also use as the on-screen-text and brand-frame layer over AI-generated B-roll. Do not use for pure photoreal AI video synthesis or AI avatar talking-head videos — route those to Manus native video tools. Speech, music, and images are produced via generate_speech / generate_music / generate_image; upstream HyperFrames TTS and transcription paths are disabled.
license: Apache License 2.0 (see LICENSE)
---

# HTML Video Production

This skill turns a user's idea into a **scene-based, editable HTML video** rendered to MP4. It is built on [HyperFrames](https://github.com/heygen-com/hyperframes), an open-source HTML-to-video framework by HeyGen, redistributed here under Apache 2.0 (see `LICENSE`, `NOTICE.txt`). The substantive authoring guidance lives under `references/` (preserved upstream HyperFrames working materials). Keep this `SKILL.md` as the routing decision, the workflow spine, and the Manus-native media-generation contract.

## Step 0 — Routing decision (read this first, every time)

Before doing anything else, decide whether this skill is the right tool for the request. Many users will describe a video need without ever saying the words "HTML" or "HyperFrames". Decide by the request's **substance**, not its keywords.

### Three dimensions to read the request

| Dimension | What to ask |
| --- | --- |
| **Fidelity (D1)** | Is the desired image graphic / typographic / data / UI / animated-design (drawn), or photographic / cinematic / physical-world (photoreal)? |
| **Editability (D2)** | Will the user want to change copy, swap colors, re-time, ship multiple versions, or maintain brand consistency afterward? Or is it a one-shot deliverable? |
| **Source (D3)** | Is the content rooted in an existing structured asset (PDF, CSV, GitHub repo, website URL, design doc, codebase, screenshots, financial data, transcript) or is it generated from a creative description alone? |

### Three routes

**Route A — Use this skill (HyperFrames).** Take this route if any of these hold: the request is graphic / data / UI / typographic / animated-design (D1), the user wants to keep editing or produce variations (D2), or the content comes from a structured source (D3). Typical user phrasings — even when they never mention HTML:

- "Turn this PDF into a 45-second explainer video"
- "Make a 1-minute walkthrough of this GitHub repo"
- "Build a data-driven motion graphic from this CSV"
- "Make a 30-second product demo from this URL"
- "Bouncy TikTok-style hook video with synced captions"
- "Add a lower third / title card / brand intro / animated chart / kinetic typography"
- "Make a karaoke-caption video for this song"
- "Convert this Keynote into a video"

**Route B — Decline and route to Manus native video tools.** Take this route if the request is photoreal / cinematic / physical-world (D1) or content is generated purely from a creative description (D3) and no editable HTML/typographic/data layer is needed. The Manus `video-generator` skill (or the underlying `generate_video` / `generate_image` + avatar tools) is the right home for these. Typical phrasings:

- "Generate a 5-second sunset over the ocean"
- "Make a virtual presenter / talking head video reading this script"
- "Create a 30-second TV commercial of a man drinking coffee on the street"
- "Studio Ghibli-style forest animation"
- "Cinematic AI sci-fi short film"

When declining, say so explicitly and hand off to the Manus video tools — do not partially execute.

**Route C — Hybrid: this skill + Manus native video tools.** Take this route when the deliverable mixes photoreal AI-generated footage with on-screen graphics / brand frames / data overlays / precise captioning. In this mode, the AI-generated clips become **assets** inside a HyperFrames composition. Steps:

1. Use Manus' native video generation (or `generate_image` for stills) to produce the photoreal clips first. Save them to the project working directory.
2. Build the HyperFrames composition in this skill, embedding the generated clips as `<video src="...">` tracks, with text / data / transitions / brand frames driven by HTML + GSAP on top of them.
3. Render with `npx hyperframes render` to produce the final MP4.

Typical phrasings:

- "60-second product film: 15 s of AI-generated footage, then 45 s of data charts and a logo intro"
- "News-style short: AI B-roll under narration, with title bars, lower thirds, and station ID built in HyperFrames"
- "Five 4-second AI b-roll clips, voiced over, captioned, and edited into a 30-second piece"

### When the request is ambiguous

If after applying D1 / D2 / D3 the route is still unclear, ask the user **one short clarifying question** before proceeding:

> "Do you want (a) AI-generated photoreal footage as a one-shot deliverable, (b) an editable graphic / data / typographic video built from your existing materials, or (c) both — AI footage with on-screen graphics and captions on top?"

Asking once is much cheaper than building down the wrong route.

## Step 1 — Workflow spine for Route A (HyperFrames)

When this skill is the right route, follow the upstream HyperFrames composition workflow. The detailed rules live in `references/`; this section names the order, not the contents.

1. **Decide visual identity.** If a `DESIGN.md` exists in the project, use it. Otherwise pick a named visual style from `references/hyperframes/visual-styles.md`, or run the design picker per `references/hyperframes/references/design-picker.md`, or fall back to `references/hyperframes/house-style.md`. Never write a composition with default web-UI colors.
2. **Plan the piece.** For multi-scene work, do prompt expansion (`references/hyperframes/references/prompt-expansion.md`), declare the rhythm (`references/hyperframes/references/beat-direction.md`), and write a per-beat storyboard. For website-to-video, follow `references/website-to-hyperframes/SKILL.md` end-to-end.
3. **Generate media assets first.** Spoken narration goes through `generate_speech`; background music through `generate_music`; raster images / icons through `generate_image`. The full contract is in [`_manus-overrides/media-generation.md`](_manus-overrides/media-generation.md). Always generate the asset before referencing it in HTML.
4. **Author the composition.** Read `references/hyperframes/SKILL.md` for the composition rules — data attributes, sub-composition structure, layout-before-animation, motion principles, video-medium rules. For GSAP-specific questions, read `references/gsap/SKILL.md`.
5. **Add captions / transitions / techniques.** Caption work uses `references/hyperframes/references/captions.md` with timing data drawn from the SSML `<mark>` boundaries returned by `generate_speech`. Transitions use `references/hyperframes/references/transitions.md`. Per-beat techniques use `references/hyperframes/references/techniques.md` and `references/hyperframes/references/dynamic-techniques.md`.
6. **Install registry blocks if useful.** The catalog (50+ blocks) is documented in `references/hyperframes-registry/SKILL.md`. Installation is via `npx hyperframes add <name>`.
7. **Lint, validate, render.** `npx hyperframes lint` then `npx hyperframes validate` then `npx hyperframes preview` then `npx hyperframes render`. Detailed CLI usage is in `references/hyperframes-cli/SKILL.md`.

## Step 2 — Hard rules (never violate)

These rules win over any conflicting instruction in any reference file:

1. **All speech / TTS / voiceover audio is produced via Manus' `generate_speech` tool.** The upstream Kokoro engine, `npx hyperframes tts` CLI, ElevenLabs, HeyGen TTS, Azure Speech, and any other third-party TTS path are disabled in this skill. See [`_manus-overrides/media-generation.md`](_manus-overrides/media-generation.md).
2. **All background music / underscore is produced via Manus' `generate_music` tool.** Do not handcraft music with ffmpeg, sample synthesis, or third-party music APIs.
3. **All non-user-supplied raster images are produced via Manus' `generate_image` (or `generate_image_variation`) tool.** Do not use placeholder image services or assume runtime-fetched images.
4. **External user-supplied audio is transcribed via the sandbox utility `manus-speech-to-text`.** Do not run `npx hyperframes transcribe`, whisper.cpp, OpenAI Whisper API, or Groq Whisper API.
5. **Always produce media assets before writing HTML that references them.** No `<audio src="narration.wav">` or `<img src="hero.png">` against paths that do not yet exist.
6. **HyperFrames CLI commands (`init`, `lint`, `inspect`, `preview`, `render`, `doctor`, `browser`, `info`, `upgrade`, `compositions`, `docs`, `benchmark`) are only invoked once Route A or Route C is selected.** Do not scaffold a HyperFrames project for requests that should have gone to native video generation.
7. **Do not modify upstream materials under `references/`.** All Manus overrides are concentrated in the top-level `SKILL.md`, in `_manus-overrides/`, and in the five upstream files explicitly noted in `_manus-overrides/modifications.md`. Future upstream syncs depend on this discipline.
8. **If the user wants a video but does not want any editable HTML / typographic / data layer, this skill must decline and route to Manus' native video tools** (Step 0 — Route B).

## File map

```
html-video-production/
├── SKILL.md                         ← This file. Routing, workflow spine, hard rules.
├── LICENSE                          ← Apache 2.0, applies to the whole package.
├── NOTICE.txt                       ← Upstream attribution, pinned commit, bundle list, non-affiliation.
├── UPSTREAM_LICENSE_APACHE-2.0.txt  ← Historical copy of the upstream LICENSE.
├── _manus-overrides/
│   ├── media-generation.md          ← Manus-native speech / music / image / external-audio contract.
│   └── modifications.md             ← §4(b) record of every upstream file Manus modified.
└── references/                      ← Upstream HyperFrames materials (preserved verbatim except as noted).
    ├── hyperframes/                 ← Composition authoring rules, palettes, references, scripts, templates.
    ├── hyperframes-cli/             ← CLI workflow (init, lint, preview, render, ...).
    ├── hyperframes-registry/        ← `hyperframes add` blocks/components workflow.
    ├── website-to-hyperframes/      ← End-to-end website-to-video pipeline (Steps 1–7).
    ├── gsap/                        ← GSAP API, timelines, easing, plugins, frame adapters.
    └── repo-root/                   ← Optional: upstream README / AGENTS.md context.
```

## When to read which reference

| Goal / Specific Need | Read |
| --- | --- |
| **Core Workflow** | |
| Build or edit a composition | `references/hyperframes/SKILL.md` |
| Run `init` / `lint` / `preview` / `render` | `references/hyperframes-cli/SKILL.md` |
| Install a registry block | `references/hyperframes-registry/SKILL.md` |
| Turn a website into a video | `references/website-to-hyperframes/SKILL.md` (Steps 1–7) |
| **Media & Design System** | |
| Generate narration / music / image | [`_manus-overrides/media-generation.md`](_manus-overrides/media-generation.md) |
| Choose / write `DESIGN.md` | `references/hyperframes/visual-styles.md`, `references/hyperframes/house-style.md` |
| Serve interactive design picker UI | `references/hyperframes/references/design-picker.md` |
| **Visual Effects & Implementation** | |
| Music IS the content (visualizer, album visual, concert visual) | `references/gsap/references/effects.md` § Audio Visualizer (Canvas bars, circular spectrum, waveforms) |
| Audio drives narrative content (underscore, background music in a voiced piece) | `references/hyperframes/references/audio-reactive.md` (drive content properties from audio data) |
| Typewriter / typing text effect | `references/gsap/references/effects.md` |
| Text marker highlights (circle, scribble, burst) | `references/hyperframes/references/css-patterns.md` |
| SVG drawing, Lottie, 3D, MotionPath | `references/hyperframes/references/techniques.md` |
| **Typography & Captions** | |
| Add captions / subtitles | `references/hyperframes/references/captions.md` |
| Dynamic/kinetic caption animations | `references/hyperframes/references/dynamic-techniques.md` |
| Typography rules & font pairing | `references/hyperframes/references/typography.md` |
| **Animation & Scene Control** | |
| GSAP timeline / easing / plugin question | `references/gsap/SKILL.md` |
| Motion principles + load-bearing GSAP rules | `references/hyperframes/references/motion-principles.md` |
| Transition selection & implementation | `references/hyperframes/references/transitions.md` + `references/hyperframes/references/transitions/catalog.md` |
| Plan rhythm and beats | `references/hyperframes/references/beat-direction.md` |
| **Specific Scene Patterns** | |
| Animate metrics, charts, statistics | `references/hyperframes/data-in-motion.md` |
| Reusable scene patterns (PiP, title cards) | `references/hyperframes/patterns.md` |

## Working with Manus-native media tools

HyperFrames itself does not generate speech, music, or images — it arranges, syncs, animates, and renders assets that already exist on disk. Inside Manus, those assets are produced by Manus' own media tools, never by the upstream HyperFrames TTS / Whisper / external-API paths. The full contract — voice selection, SSML for pacing and word-level timestamps, mixing at the right volume, image aspect ratio, motion treatment of generated images — is in [`_manus-overrides/media-generation.md`](_manus-overrides/media-generation.md). Read it whenever a composition needs narration, background music, an underscore, an icon, a product image, or a textured background.
