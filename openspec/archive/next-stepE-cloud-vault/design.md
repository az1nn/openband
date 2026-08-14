# Next Step E: Cloud Project Vault & S3 Asset Deduplication — Design

## Architecture
- **`src/lib/supabaseRemote.ts`**: Computes SHA-256 hash of audio blobs before upload; skips uploading if hash exists in remote asset manifest.
- **Backend Storage**: Presigned upload/download endpoints in `backend/src/routes/storage.ts`.
- **UI Integration**: Cloud sync modal indicating upload progress and deduplication savings.
