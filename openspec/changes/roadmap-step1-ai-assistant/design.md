# Roadmap Step 1: AI Audio Assistant & Voice Command Integration — Design

## Architecture
- **`src/lib/aiAssistant.ts`**: Centralized AI prompt router connecting voice transcriptions and text prompts to DAW command registry (`commandRegistry.ts`) and chord generator (`chordTrackState.ts`).
- **UI Component**: Floating or docked `AIAssistantPanel` accessible via Command Palette (`Cmd+K`).
- **API Endpoint**: Backend POST `/api/ai/assistant` handling intent classification and response streaming.
