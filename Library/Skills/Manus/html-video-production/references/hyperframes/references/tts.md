<!-- Modified by Manus: original upstream content (Kokoro-82M voice catalog, `npx hyperframes tts` CLI, multilingual phonemization, speed tuning) replaced with a redirect to Manus-native speech generation. Original upstream: heygen-com/hyperframes@8d83d4f / skills/hyperframes/references/tts.md (75 lines). See ../../../_manus-overrides/modifications.md. -->

# Text-to-Speech (Manus override)

In Manus, **all narration / voiceover audio is produced via the native `generate_speech` tool**, not via the upstream Kokoro engine, the `npx hyperframes tts` CLI, ElevenLabs, HeyGen TTS, Azure Speech, or any other third-party TTS path. Those upstream paths are disabled in this environment.

For the full speech generation contract — voice selection, SSML for pacing and duration, obtaining word-level timestamps for caption alignment, and integrating the produced `.wav` into a HyperFrames `<audio>` element — read [../../../_manus-overrides/media-generation.md](../../../_manus-overrides/media-generation.md).

For narration writing style (pacing, tone, script structure, number pronunciation, opening line patterns) the upstream guide is still authoritative: see [narration.md](narration.md).

For caption-side alignment of the generated audio (word grouping, timing windows), see [captions.md](captions.md).
