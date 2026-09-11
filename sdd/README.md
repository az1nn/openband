# OpenBand SDD

T2+ work uses two Spec Kit runs so design and implementation keep separate OpenCode permissions.

```bash
SPECKIT_INTEGRATION_OPENCODE_EXTRA_ARGS="--agent speckit" \
  specify workflow run ./sdd/openband-design.yml \
  -i spec="<bounded change>"

SPECKIT_INTEGRATION_OPENCODE_EXTRA_ARGS="--agent build" \
  specify workflow run ./sdd/openband-build.yml
```

Use `-i run_clarify=true` or `-i run_checklist=true` only when needed. If convergence appends tasks, run the build pass again after completing them.

T2+ product implementation starts only after the design workflow's human gate. The verified PR HEAD is merged by a human.
