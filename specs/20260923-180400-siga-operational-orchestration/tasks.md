# Tasks — Repository-local SIGA Operational Orchestration

- [x] T001 Reconcile canonical SIGA, current session routing, handoff persistence and real CI gate names.
- [x] T002 Add the portable repository-local SIGA orchestration contract.
- [x] T003 Add OpenBand's capability/adapter manifest with only verified local capabilities and gates.
- [x] T004 Update the canonical session router to map OpenBand routes to RESUME/WATCH/ADVANCE and require idempotent mutation/error/WATCH semantics.
- [x] T005 Update durable handoff semantics so the minimal operational checkpoint can be reconstructed without creating a new source of truth.
- [x] T006 Add regression tests for single canonical SIGA, authority ordering, classifications, manifest validity and anti-centralization guarantees.
- [ ] T007 Run SDD/Graph/governance verification and reconcile any failures without weakening policy.
- [ ] T008 Re-read canonical SIGA surfaces, confirm no duplicate implementation, persist closeout handoff and verify exact HEAD.
