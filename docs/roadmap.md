# OpenBand Roadmap

**Last updated:** August 6, 2026

---

## ✅ Shipped (41 features)

### Core DAW
- ✅ Multi-track DAW with responsive layout (mobile/tablet/desktop)
- ✅ Audio recording (expo-audio, high quality preset)
- ✅ MIDI import + MIDI synth (Web Audio API)
- ✅ Piano roll MIDI editor (note add/move/resize/delete, snap, scale)
- ✅ Time-stretch / pitch-shift (±12 semitones, phase vocoder + granular)
- ✅ Automation lanes (volume + pan, linear/exponential curves)
- ✅ VU meters per track (green/yellow/red zones, peak hold)
- ✅ Waveform visualization (Canvas 2D with viewport culling)
- ✅ Track grouping (shared volume/mute)
- ✅ Sidechain routing (per-track source selector)
- ✅ Looper / overdub (4 independent slots)
- ✅ Standalone "Add Clip" action in Studio (appends region to selected track)
- ✅ Recorded URL persistence across reloads (durable `asset://` pointers)

### Instruments
- ✅ Synth (16-voice polyphonic, 25 presets, OSC/FLT/ENV/LFO/ARP)
- ✅ Sampler (velocity, melodic keyboard, transient slicing, stereo slicing)
- ✅ Chord track (10 presets, Markov suggestions, MIDI generation)
- ✅ CodeSampler (token-based beat sequencer)
- ✅ MIDI Learn (map hardware CC to plugin/track parameters)

### Effects & Processing
- ✅ Plugin system (19 types: EQ, comp, limiter, reverb, delay, etc.)
- ✅ Guitar pedalboard (16 famous pedals, 20 amps, 10 cabs)
- ✅ Mastering suite (10 presets, VisualEQ, LUFS meter, A/B versions)
- ✅ AutoMix (11 genres, role classification, LUFS targets)
- ✅ Multi-band EQ display (20Hz-20kHz curve, draggable bands, spectrum analyzer)
- ✅ Wasm plugin binary (assets/openband-plugin.wasm)

### AI
- ✅ AI Cover Generation (BYOK providers)
- ✅ AI Voice Cleaner (SNR/RMS metrics)

### Export & Performance
- ✅ Video export (MP4)
- ✅ Vercel performance (cache headers, preload/preconnect, deferred feed previews)

### Collaboration & Sharing
- ✅ CRDT + SSE collaboration (real-time sync, presence cursors, project branching)
- ✅ Social feed (posts, likes, remix, favorites)
- ✅ Project export/import (JSON, cross-platform download)
- ✅ Commit/push-to-cloud (version history, selective merge)
- ✅ Cloud sync (Supabase push/pull, SHA-256 dedup)

### Platform
- ✅ Web (Expo Router, HTML5 Audio fallback)
- ✅ Desktop (Electron with swappable bridge)
- ✅ Android (EAS build, APK)
- ✅ MiniPlayer (persistent transport controls, shared state)
- ✅ i18n (pt-BR default, en/pt/es dictionaries, useT hook)
- ✅ 3D mixing console (spatial studio rooms, VU meter groups)
- ✅ Project starter templates (setupProjectStarter)
- ✅ CI pipeline (GitHub Actions frontend + backend)

---

## 🎯 Phase 1: Stabilize & Polish (Work on these first)

These are the highest-impact items that improve the core experience.

### 1.1 Pan interpolation in automation
**Files:** `src/components/AutomationLane.tsx`, `app/studio/[id].tsx`
**What:** Add interpolation modes (linear, exponential, logarithmic) for pan automation, matching volume automation.
**Effort:** Low

### 1.2 Track color picker
**Files:** `app/studio/[id].tsx`, `src/components/`
**What:** Per-track color picker (12 presets + custom) replacing the hardcoded `bg-*` colors.
**Effort:** Low

### 1.3 Undo/redo for automation edits
**Files:** `app/studio/[id].tsx`, `src/lib/history.ts`
**What:** Include automation point changes in the undo/redo history graph.
**Effort:** Medium

### 1.4 MiniPlayer seek interaction
**Files:** `src/components/MiniPlayer.tsx`
**What:** Make progress bar draggable for seeking (currently click-to-seek is broken on web).
**Effort:** Low

### 1.5 Stem-to-project workflow
**Files:** `app/extractor.tsx`, `app/studio/[id].tsx`
**What:** After stem separation, auto-create a project with 4 tracks (drums/bass/vocals/other) and open in studio.
**Effort:** Medium

---

## 🚀 Phase 2: Feature Expansion (After Phase 1)

These add new capabilities that users frequently request.

### 2.1 One Knob simplifiers
**Files:** `src/components/OneKnob.tsx`
**What:** Single-dial effects (Warmth, Presence, Bass Boost, Air, Room, Punch, Lo-Fi, Telephone) that map to multi-effect chains.
**Effort:** Medium

### 2.2 Vocal Verb + Shimmer
**Files:** `src/lib/types.ts`, `src/components/PluginEditor.tsx`
**What:** Two new reverb types matching BandLab's signature effects.
**Effort:** Medium

---

## 🔮 Phase 3: Advanced (Long-term)

These are ambitious features that require significant architecture.

### 3.1 Audio Units (AUv3) support
**What:** Load third-party iOS audio unit plugins in Cubasis-style plugin rack.
**Effort:** Very High

### 3.2 FX Preset Generator (text → chain)
**What:** Type "warm vintage vocal" → AI generates a plugin chain with settings.
**Effort:** High

### 3.3 MCU Control Surface
**What:** Mackie Control Universal protocol for hardware mixer control.
**Effort:** High

---

## Effort Summary

| Phase | Items | Total Effort | User Impact |
|-------|-------|-------------|-------------|
| 1 | 5 items | Low-Medium | **High** — polish core workflow |
| 2 | 2 items | Medium | **High** — new capabilities |
| 3 | 3 items | High-Very High | **Medium** — advanced features |

---

## What NOT to work on

These are explicitly deferred per user decisions:

- ❌ Backend route TypeScript errors (pre-existing, don't block deployment)
- ❌ `any` types in test files (acceptable in test context)
