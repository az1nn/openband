# OpenBand `siga` — Agent Tree Example

This example is illustrative. Live values must always be reconstructed from canonical GitHub/Git/Spec Kit state.

```text
OPENBAND AGENT TREE
az1nn/openband @ <master-sha>
└─ SessionRouter
   ├─ RepoProbe ............ PASS
   ├─ GitHubProbe .......... PASS
   ├─ SpecKitProbe ......... PASS
   ├─ EvidenceProbe ........ PASS
   ├─ DependencyProbe ...... #80 blocked_by #82
   ├─ Active work
   │  ├─ #82 / PR #82 [ACTIVE] owner=<foreign-session> occupied
   │  └─ #80 / PR #80 [WAITING] owner=<foreign-session> occupied
   │     └─ blocked_by #82
   ├─ Candidate work
   │  └─ #95 [READY] owner=<none>
   │     └─ independent_of #82/#80
   └─ Route ................ NEXT -> #95
```

Default `siga` does not attach itself to #82 or #80. Foreign branches stay visible and immutable while the router selects independent work. After #95 receives this chat's own lease/SESSION_KEY, its route becomes `ACTIVE/OWNED`.

`ACTIVE/OBSERVER` is still available when the user explicitly asks to inspect a foreign-owned task; observer mode remains read-only.
