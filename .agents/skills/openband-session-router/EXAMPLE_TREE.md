# OpenBand `siga` — Agent Tree Example

This example is illustrative. Live values must always be reconstructed from canonical GitHub/Git/Spec Kit state.

```text
OPENBAND AGENT TREE
az1nn/openband @ <master-sha>
└─ SessionRouter
   ├─ RepoProbe ............ PASS
   ├─ GitHubProbe .......... PASS
   ├─ SpecKitProbe ......... PASS
   ├─ EvidenceProbe ........ FAIL
   ├─ DependencyProbe ...... #80 blocked_by #82
   ├─ Active work
   │  ├─ #82 / PR #82 [ACTIVE] owner=<foreign-session>
   │  │  ├─ Governance/spec read ........ PASS
   │  │  └─ CI evidence analysis ........ FAIL:web-launch-e2e
   │  └─ #80 / PR #80 [WAITING] owner=<foreign-session>
   │     └─ blocked_by #82
   └─ Route ................ ACTIVE/OBSERVER
```

Observer mode may expand read-only evidence branches, but it cannot take over or mutate the foreign-owned task.
