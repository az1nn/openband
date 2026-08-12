# Tasks: Reset transport seek on natural end

- [x] 1. Read `app/studio/hooks.ts` transport logic (togglePlay, stopPlayback, onEnded,
        currentSeekRef, engine.play) and `src/lib/playbackEngine.ts` to confirm mechanics.
- [x] 2. Write spec (proposal.md, design.md, tasks.md) and commit with
        message `spec: reset transport seek on natural end`.
- [ ] 3. Implement fix in `app/studio/hooks.ts`: update the `engine.onEnded` callback
        (`app/studio/hooks.ts:684`) to also set `currentSeekRef.current = 0`. Keep
        explicit-pause position preservation (`:667`) and `stopPlayback` reset (`:733`)
        unchanged.
- [ ] 4. Run `npx tsc --noEmit` (use the WSL node path if plain npx fails on the Windows
        shell/UNC path). Fix any type errors in touched files.
- [ ] 5. Run `npx vitest run` (full suite). Report pass/fail. Do NOT edit tests unless a
        test asserts the old buggy behavior (then update only that assertion and note it).
- [ ] 6. Leave implementation UNCOMMITTED for code review.
