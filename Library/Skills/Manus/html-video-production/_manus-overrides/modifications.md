# Manus Modifications to Upstream HyperFrames Skills

This document records every change Manus made to the upstream HyperFrames skill materials when packaging them as the `html-video-production` Manus skill (which is built on HyperFrames). Maintained per the requirements of Apache License 2.0 §4(b) ("modified files must carry prominent notices stating that You changed the files").

## Provenance

- **Upstream project:** [`heygen-com/hyperframes`](https://github.com/heygen-com/hyperframes)
- **Upstream license:** Apache License 2.0 (preserved verbatim in `../UPSTREAM_LICENSE_APACHE-2.0.txt`)
- **Pinned upstream commit:** `8d83d4f132d384de866da70cb286e4af71871dd5`
- **Pinned commit date:** 2026-05-04
- **Bundled upstream skills (from `skills/` of the upstream repo):**
  - `gsap`
  - `hyperframes`
  - `hyperframes-cli`
  - `hyperframes-registry`
  - `website-to-hyperframes`
- **Upstream skills intentionally not bundled:**
  - `animejs`, `css-animations`, `lottie`, `three`, `waapi` — additional animation-runtime adapters; the Manus build of the skill targets the GSAP path only.
  - `tailwind` — Tailwind v4 browser-runtime guidance; not needed for the default skill path.
  - `remotion-to-hyperframes` — Remotion → HyperFrames migration tooling; out of scope for the Manus build.

## Why these changes exist

The upstream skill ships with a number of third-party media-generation paths (Kokoro TTS engine, `npx hyperframes tts`, `npx hyperframes transcribe`, ElevenLabs, HeyGen TTS, Whisper). Inside Manus, those paths are replaced by Manus-native tools (`generate_speech`, `generate_music`, `generate_image`) and the OpenAI Whisper API for word-level timestamps. The contract for the Manus-native paths lives in [`media-generation.md`](media-generation.md).

The changes below are **only** the minimum required to (a) remove third-party-call instructions that would mislead Manus, (b) fix path references that assume the upstream monorepo directory structure, (c) resolve rule contradictions between standalone and sub-composition architectures, and (d) annotate every modified file per Apache 2.0 §4(b). All other upstream content is preserved verbatim from the pinned commit.

## Modified files (relative to skill package root)

### 1. `references/hyperframes/SKILL.md`

- **Description trimmed** — removed `transcribe, tts` from the `For CLI commands` enumeration; added a one-line pointer to `generate_speech`.
- **Routing-table entries adjusted** for `references/tts.md`, `references/transcript-guide.md`, and `references/narration.md` to reflect Manus-native routing.
- **Scene Transitions rules clarified** — distinguished standalone compositions (no exit animations except final scene) from sub-compositions loaded via `data-composition-src` (must handle their own exits and hard-kills). Original rule 3 ("NEVER use exit animations") was ambiguous when applied to multi-file projects.
- **Animation map script path fixed** — changed `node skills/hyperframes/scripts/animation-map.mjs` to `node references/hyperframes/scripts/animation-map.mjs` to match the Manus skill directory structure.

### 2. `references/hyperframes/references/tts.md`

- **Replaced in full** with a thin redirect skeleton (12 lines) pointing at `_manus-overrides/media-generation.md`. The original 75-line upstream file described Kokoro voice IDs, multilingual phonemization, the `npx hyperframes tts` CLI, speed tuning, and a TTS+captions workflow — all incompatible with the Manus runtime.
- File name preserved so that upstream cross-links from `references/hyperframes/SKILL.md` and any other skill referencing it remain valid.

### 3. `references/hyperframes/references/transcript-guide.md`

- **Replaced in full** with a thin redirect skeleton (~30 lines) describing two Manus-native paths: (a) `generate_speech`-produced audio is transcribed via OpenAI Whisper API for word-level timestamps; (b) external audio uses the same Whisper API approach. The original upstream file described `npx hyperframes transcribe`, whisper.cpp, OpenAI Whisper API, Groq Whisper API, and troubleshooting commands.
- File name preserved so that cross-links from `references/hyperframes/SKILL.md` and `references/hyperframes/references/captions.md` remain valid.

### 4. `references/hyperframes-cli/SKILL.md`

- **Frontmatter description revised** — removed `transcribe, tts` from the CLI command enumeration; added a one-line note that those subcommands are disabled in Manus.
- **`init` description trimmed** — removed the phrase "transcribes audio with Whisper" so that `init` is no longer documented as performing a transcription side effect.
- **`## Snapshot` section added** — documented the `snapshot` subcommand (`npx hyperframes snapshot <project-dir> --at <timestamps>`) which was present in the upstream CLI but undocumented in the upstream skill.
- **`## Transcription` and `## Text-to-Speech` sections replaced** with a single `## Transcription & Text-to-Speech (Disabled in Manus)` section that routes to `_manus-overrides/media-generation.md`. Updated to reference OpenAI Whisper API instead of `manus-speech-to-text`.
- All other CLI command documentation (lint, inspect, preview, render, doctor, browser, info, upgrade, compositions, docs, benchmark) preserved verbatim from upstream.

### 5. `references/website-to-hyperframes/SKILL.md`

- **Step 5 inlined** — the original `**Read:** [references/step-5-vo.md](references/step-5-vo.md)` reference was replaced with full inline guidance describing the Manus-native VO + timing-mapping workflow. The original `step-5-vo.md` file is **deleted** because it was referenced only from this `SKILL.md` and described three third-party TTS audition paths plus `npx hyperframes transcribe` mapping.
- **Step 5 updated** — replaced SSML `<mark>` timestamp assumption with OpenAI Whisper API transcription; added `transcript.json` to the gate artifacts.
- **Reference table entry for `step-5-vo.md` removed** to match the deletion.
- All other step references and content preserved verbatim from upstream.

### 6. `references/hyperframes/references/captions.md`

- **Whisper model selection rules removed** — the "Language Rule (Non-Negotiable)" section at the top (`.en` models, `--model small --language <code>` flags) was removed because it references Whisper CLI parameters not applicable in Manus. Transcription in Manus uses the OpenAI Whisper API via `_manus-overrides/media-generation.md`.
- **Stale cross-reference removed** — "For transcription commands, whisper models, external APIs, see transcript-guide.md" (line 24) and the Further References entry for `transcript-guide.md` were removed.
- All other caption content (style detection, per-word styling, grouping, timing, animation, constraints) preserved verbatim from upstream.

### 7. `references/website-to-hyperframes/references/step-4-storyboard.md`

- **TTS provider placeholder replaced** — `[TTS provider]` in the Global Direction template changed to `Manus generate_speech voiceover + generate_music background music + SFX`.

### 8. `references/website-to-hyperframes/references/step-6-build.md`

- **Shader transition README reference removed** — `Read packages/shader-transitions/README.md` removed (path does not exist in the Manus skill package).
- **Transition catalog path fixed** — changed `skills/hyperframes/references/transitions/catalog.md` to `references/hyperframes/references/transitions/catalog.md`.
- **Animation map path fixed** — changed `skills/hyperframes-animation-map/scripts/animation-map.mjs` to `references/hyperframes/scripts/animation-map.mjs`.

### 9. `references/website-to-hyperframes/references/step-7-validate.md`

- **Invalid fallback removed** — `npx tsx packages/cli/src/cli.ts snapshot` fallback removed (monorepo-internal path does not exist in Manus).
- **Handoff URL updated** — replaced `http://localhost:<port>` instructions with Manus `expose` tool guidance for exposing the preview port to the public internet.

## Deleted files

| Path | Reason |
| --- | --- |
| `references/website-to-hyperframes/references/step-5-vo.md` | Original 42-line file described Kokoro / ElevenLabs / HeyGen TTS audition and `npx hyperframes transcribe` — fully replaced by inline guidance in the parent `SKILL.md` (Step 5) and the `media-generation.md` contract. Was referenced only twice from a single file, so deletion is safe. |

## Added files

| Path | Purpose |
| --- | --- |
| `_manus-overrides/media-generation.md` | Single source of truth for Manus-native speech / music / image generation and audio transcription (via OpenAI Whisper API), replacing the upstream third-party paths. |
| `_manus-overrides/modifications.md` | This file. Records every change for Apache 2.0 §4(b) compliance. |
| `LICENSE` | Apache 2.0 license under which the entire skill package is redistributed. |
| `SKILL.md` (top-level) | Manus-authored entry point that routes Manus across the bundled upstream skills, applies use-case-based routing between this skill and Manus' native video generation tools, and pins the hard rules for media generation. Not derived from any single upstream file. |

### 10. `references/hyperframes/references/audio-reactive.md`

- **"Content, Not Medium" section clarified** — the original "Never add: equalizer bars, spectrum analyzers, waveform displays..." was an unscoped absolute prohibition that misled agents into avoiding Canvas-based audio visualizers even when the task was a music visualization (where those elements _are_ the content). Changed to two scoped paragraphs: (a) "When audio supports narrative content" preserves the original prohibition for product demos, brand films, and voiced pieces; (b) "When music IS the content" adds a positive routing statement directing to `effects.md § Audio Visualizer` for Canvas-based bars, waveforms, and circular spectrum patterns. No other content in the file was changed.

### 11. `references/gsap/references/effects.md`

- **Audio Visualizer scene-routing preamble added** — inserted a two-sentence preamble at the top of the `## Audio Visualizer` section: "Use this pattern when music is the primary content... For narrative videos where audio is background, see audio-reactive.md..." This gives agents a positive signal that the Canvas visualizer patterns are the correct choice for music visualization tasks, and cross-links to `audio-reactive.md` for the alternative content-driven approach. No other content in the file was changed.

## Unmodified upstream files

All files under `references/` other than the eleven listed above are byte-identical to upstream commit `8d83d4f`. Diffs against upstream may show only line-ending or whitespace artifacts introduced by the cp pipeline; if any substantive divergence is detected, treat it as a bug and re-sync from upstream.

## Re-syncing with future upstream releases

When a new upstream release is bundled:

1. Bump the pinned commit at the top of this file.
2. Re-copy the five bundled skills under `references/`.
3. Re-apply the eleven modifications listed above (they touch a small, predictable surface area; a `git diff` against the previous packaging makes the patch reusable).
4. Update the bundled / not-bundled lists if the upstream skill set has changed.
