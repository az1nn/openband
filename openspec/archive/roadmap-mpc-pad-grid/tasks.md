# Tasks: Roadmap MPC Pad Grid

- [ ] Inspect `src/components/` for an existing pad or grid component to match style; read `src/components/index.ts` export pattern; read one existing `tests/components*.test.tsx` to learn the RN testing harness (`render`, `fireEvent`, `act`, matchers).
- [ ] Create `src/components/MpcPadGrid.tsx` implementing the API and behavior from design.md. Use `react-native` `View`, `Pressable`, `useState`/`useEffect`. `className` based styling only (no StyleSheet.create).
- [ ] Export `MpcPadGrid` from `src/components/index.ts`.
- [ ] Create `tests/mpcPadGrid.test.tsx` with the cases in design.md. Reuse the same test imports as existing component tests.
- [ ] Run `npx tsc --noEmit` via WSL and fix type errors.
- [ ] Run `wsl -e bash -lc "cd /home/az1nn/openband && npx vitest run tests/mpcPadGrid.test.tsx"` and ensure it passes.
- [ ] No comments in code.
