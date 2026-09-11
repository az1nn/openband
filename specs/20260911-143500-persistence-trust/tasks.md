# Tasks

- [x] T001 Confirm #48 identity, T3 classification, branch isolation and persistence contract.
- [x] T002 Run Graph validation/impact for project state, Studio persistence, local assets, object storage and archive format.
- [x] T003 Trace current Web recording, audio import, hydrate and save-success semantics.
- [x] T004 Define compatible state/asset persistence strategy, non-goals, rollback posture and verification plan.
- [x] T005 Create ADR and proposed architecture/contract reconciliation for the Design Baseline.
- [x] T006 Analyze scope boundaries against #47, #49 and #53; no implementation dependency required.
- [ ] T007 Obtain human Design Gate approval for the exact Design Baseline SHA.
- [ ] T008 Harden `assetStore` so durable Web asset writes fail explicitly and existing `asset://` reads remain compatible.
- [ ] T009 Harden `projectStore` save/index recovery semantics without replacing its synchronous public boundary.
- [ ] T010 Make Studio manual/autosave status truthful and flush the latest state on browser lifecycle exit.
- [ ] T011 Persist Web imported audio bytes before adding imported tracks/regions.
- [ ] T012 Surface missing/corrupt persisted audio assets non-destructively during Studio hydration/playback.
- [ ] T013 Add targeted persistence, quota/failure, reload and compatibility tests.
- [ ] T014 Implement browser behavioral persistence smoke with persistent storage and failure injection.
- [ ] T015 Run convergence; append and implement any remediation within the approved envelope.
- [ ] T016 Run full system verification and reconcile normative knowledge against the implementation.
- [ ] T017 Obtain human Merge Gate approval on the exact verified PR HEAD.
