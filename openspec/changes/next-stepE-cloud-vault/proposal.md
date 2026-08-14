# Next Step E: Cloud Project Vault & S3 Asset Deduplication — Proposal

## Context
OpenBand supports local and Supabase project saves, but syncing large multi-gigabyte audio asset bundles without duplication requires content-hashed S3/R2 storage pointers.

## Objectives
- Implement S3/R2 presigned URL asset synchronization engine (`supabaseRemote.ts` / `stateAssetSeparation.ts`).
- Verify SHA-256 commit hashing for asset deduplication.
- Add unit tests for cloud vault sync and hash checks.
