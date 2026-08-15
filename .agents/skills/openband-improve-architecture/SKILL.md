---
name: openband-improve-architecture
description: Analyze module boundaries, graph toolchain findings, and identify deep module opportunities.
---

# OpenBand Architecture Improvement

Uses the zero-dependency architecture-graph toolchain under `graph/` to identify structural debt, rule violations, and deep module refactoring opportunities.

## Graph Verification Process

1. **Run Architecture Graph Validation**:
   - `npm run graph:validate`
   - `npm run graph:ci`

2. **Rule Violation Inspection**:
   - **`OB-GRAPH-001` (Error)**: Direct Node/Electron/Tauri imports in frontend (must route through `@bridge`).
   - **`OB-GRAPH-002` (Error)**: Dependency cycles across import/require graphs.
   - **`OB-GRAPH-003` (Warning)**: OpenSpec markdown citations referencing non-existent file paths.
   - **`OB-GRAPH-004` (Warning/Error)**: Orphaned code modules with zero inbound imports.
   - **`OB-GRAPH-005` (Warning/Error)**: Test coverage gaps lacking test references.

3. **Refactor Design**:
   - Consolidate shallow modules into deep interfaces with hidden implementation details.
   - Resolve dependency cycles by elevating shared models or using event delegation.
