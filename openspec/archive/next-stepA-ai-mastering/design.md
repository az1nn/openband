# Next Step A: AI-Powered Stem Mastering & Dynamic EQ Analyzer — Design

## Architecture
- **`src/lib/aiStemMastering.ts`**: Analyzes FFT spectrum per stem, computes spectral centroid and masking collision points, and outputs per-track EQ curve adjustments.
- **UI Integration**: Add an "AI Mix Doctor" panel inside `MasteringSuite.tsx`.
- **Backend API**: POST `/api/master/analyze-stems` for server-side spectral analysis.
