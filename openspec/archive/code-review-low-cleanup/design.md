# Design: Code Review LOW-Severity Cleanup

## Status: SHIPPED
> Each section gives Current vs New with a code sketch and a file-change table.

## 1. Clock worker blob URL leak guard (L1 — AUDIO)

### Current
`src/lib/clockManager.ts` (`~53-56`) has a terminate branch:

```ts
if (workerInstance) {
  workerInstance.terminate();
  workerInstance = null;
}
```

The previously-created `workerBlobUrl` (held at module scope) is not revoked here.
The normal stop path already does `if (workerBlobUrl) { URL.revokeObjectURL(workerBlobUrl); workerBlobUrl = null; }`, but this branch can be reached via a refactor/edge path that leaves the blob URL orphaned for the page lifetime.

### New
Add the same revoke block inside the terminate branch (defensive; idempotent even
if the normal path already cleared it):

```ts
if (workerInstance) {
  workerInstance.terminate();
  workerInstance = null;
  if (workerBlobUrl) {
    URL.revokeObjectURL(workerBlobUrl);
    workerBlobUrl = null;
  }
}
```

| File | Change |
| --- | --- |
| `src/lib/clockManager.ts` | revoke + null `workerBlobUrl` in the `if (workerInstance)` terminate branch (`:53-56`) |

## 2. Remove dead `reconnectOnLineRef` (L2 — STATE)

### Current
`src/lib/presence.ts` declares `reconnectOnLineRef` (`~116`), assigns it on the
`online` handler (`~230`), and nulls it (`~235`). It is never read anywhere — dead
code. The `window` `online`/`offline` listeners are registered separately and must
stay.

### New
Delete the declaration `const reconnectOnLineRef = ...` (`:116`), the assignment at
the `online` handler (`:230`), and the nulling at `:235`. No `ref` wiring is
removed; only the unused variable and its assignments go away. The
`window.addEventListener("online", ...)` / `window.addEventListener("offline", ...)`
calls remain unchanged.

```ts
// before (dead):
const reconnectOnLineRef = ...;
window.addEventListener("online", () => { reconnectOnLineRef = ...; /* ... */ });
// ...
reconnectOnLineRef = null;

// after: variable and assignments removed; listeners kept exactly as-is
```

| File | Change |
| --- | --- |
| `src/lib/presence.ts` | remove `reconnectOnLineRef` declaration (`:116`), its assignment (`:230`), and nulling (`:235`); keep `online`/`offline` listeners |

## 3. Bind and log backend `catch {}` errors (L3 — BACKEND)

### Current
The following blocks swallow errors with no binding:

- `backend/src/routes/collab.ts` `catch {}` (`~69`, `~185`)
- `backend/src/routes/presence.ts` `catch {}` (`~67`, `~181`)
- `backend/src/services/queue.ts` `catch {}` (`~118`)

Repo rule: every `catch` must capture `e` and log it.

### New
Convert each bare `catch {}` to `catch (e) { console.error("<context>", e); }`.
Behavior is otherwise identical — only observability improves. Use a short,
specific context string per site (e.g. `"[collab] sse write failed"`, `"[presence]
sse write failed"`, `"[queue] job processing failed"`).

```ts
// before
} catch {
  // swallowed
}

// after
} catch (e) {
  console.error("[collab] sse write failed", e);
}
```

| File | Change |
| --- | --- |
| `backend/src/routes/collab.ts` | `catch {}` → `catch (e) { console.error(...) }` at `:69` and `:185` |
| `backend/src/routes/presence.ts` | `catch {}` → `catch (e) { console.error(...) }` at `:67` and `:181` |
| `backend/src/services/queue.ts` | `catch {}` → `catch (e) { console.error(...) }` at `:118` |

## 4. Test Requirements

No new functional behavior is introduced, so no new behavioral tests are
required. The existing backend/unit suites must continue to pass unchanged. Type
checking covers the removed-variable and added-binding changes.

## 5. Verification

1. `npx tsc --noEmit`
2. `cd backend && npx tsc --noEmit`
3. `npx vitest run`
4. `npm run graph:ci`
