<!-- Modified by Manus: original upstream content (`npx hyperframes transcribe`, whisper.cpp, OpenAI Whisper API, Groq Whisper API examples, troubleshooting) replaced with a redirect to Manus-native paths. Original upstream: heygen-com/hyperframes@8d83d4f / skills/hyperframes/references/transcript-guide.md. See ../../../_manus-overrides/modifications.md. -->

# Transcription (Manus override)

In Manus, transcription is handled in two clearly distinct cases. **Do not call `npx hyperframes transcribe`, whisper.cpp, the OpenAI Whisper API, or the Groq Whisper API** — those upstream paths are disabled in this environment.

## Case 1: Audio produced by `generate_speech` (the common case)

When the narration was synthesized by Manus' `generate_speech` tool — which is the default per the routing in [tts.md](tts.md) and [../../../_manus-overrides/media-generation.md](../../../_manus-overrides/media-generation.md) — **a separate transcription pass is not required**. `generate_speech` exposes word-level timing through one of two mechanisms:

1. **SSML `<mark name="...">` boundaries** placed around words or phrases that need to drive caption / beat timing.
2. **Returned alignment metadata** alongside the produced `.wav` file (per-word `start` / `end` in seconds).

Both are described in `_manus-overrides/media-generation.md`. Use those values directly as `transcript.json`-equivalent input for caption grouping and beat mapping.

## Case 2: External audio supplied by the user

When the user uploads a pre-existing `.mp3`, `.wav`, `.mp4`, or extracts audio from a third-party video, transcribe it using the sandbox utility:

```bash
manus-speech-to-text path/to/audio.mp3
```

Parse the JSON output to obtain word-level `[{ "text", "start", "end" }]` entries. Treat that JSON as the canonical `transcript.json` for downstream caption / beat work.

## Importing existing subtitles (`.srt`, `.vtt`)

Read the file directly and convert each cue into the same `[{ "text", "start", "end" }]` shape; no upstream CLI is needed. For lyric-heavy or music-vocal cases, prefer importing user-supplied SRT/VTT over running speech-to-text — automated transcription mis-detects musical content.

## Cross-references

- [tts.md](tts.md) — how narration audio is produced in Manus
- [captions.md](captions.md) — word grouping, timing windows, caption animation
