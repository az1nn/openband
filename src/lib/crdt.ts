export interface CrdtOperation {
  id: string;
  userId: string;
  timestamp: number;
  type: "track.add" | "track.remove" | "track.update" | "bus.add" | "bus.remove" | "bus.update" | "note.add" | "note.remove" | "note.update" | "mix.update" | "chord.update";
  path: string;
  value: unknown;
  clientId: string;
}

export interface CrdtState {
  vectorClock: Record<string, number>;
  operations: CrdtOperation[];
  pending: CrdtOperation[];
}

let localClock = 0;
let clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function getClientId(): string {
  return clientId;
}

export function createOperation(
  userId: string,
  type: CrdtOperation["type"],
  path: string,
  value: unknown,
): CrdtOperation {
  localClock++;
  return {
    id: `${clientId}-${localClock}-${Date.now()}`,
    userId,
    timestamp: localClock,
    type,
    path,
    value,
    clientId,
  };
}

function isAddType(type: CrdtOperation["type"]): boolean {
  return type === "track.add" || type === "bus.add" || type === "note.add";
}

function getValueId(value: unknown): string | null {
  if (value && typeof value === "object" && "id" in (value as object)) {
    const id = (value as { id: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}

export function compareLamport(a: CrdtOperation, b: CrdtOperation): number {
  if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
  if (a.clientId < b.clientId) return -1;
  if (a.clientId > b.clientId) return 1;
  return 0;
}

export function mergeOperations(
  existing: CrdtOperation[],
  incoming: CrdtOperation[],
): CrdtOperation[] {
  const merged = [...existing];

  for (const op of incoming) {
    const existingIdx = merged.findIndex((e) => e.id === op.id);
    if (existingIdx >= 0) continue;

    if (isAddType(op.type)) {
      const vid = getValueId(op.value);
      const dupIdx = merged.findIndex(
        (e) =>
          e.path === op.path &&
          e.type === op.type &&
          vid !== null &&
          getValueId(e.value) === vid,
      );
      if (dupIdx >= 0) {
        if (compareLamport(op, merged[dupIdx]) > 0) merged[dupIdx] = op;
      } else {
        merged.push(op);
      }
    } else {
      const conflictIdx = merged.findIndex(
        (e) => e.path === op.path && e.type === op.type && e.userId !== op.userId,
      );

      if (conflictIdx >= 0) {
        if (compareLamport(op, merged[conflictIdx]) > 0) {
          merged[conflictIdx] = op;
        }
      } else {
        merged.push(op);
      }
    }

    if (op.timestamp > localClock) {
      localClock = op.timestamp;
    }
  }

  localClock = Math.max(localClock, ...merged.map((o) => o.timestamp));

  return merged.sort(compareLamport);
}

export function applyOperation(
  state: Record<string, unknown>,
  op: CrdtOperation,
): Record<string, unknown> {
  const parts = op.path.split(".");
  const result = { ...state };

  let current: Record<string, unknown> = result;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (Array.isArray(current[key])) {
      current[key] = [...(current[key] as unknown[])];
    } else {
      current[key] = { ...(current[key] as Record<string, unknown>) };
    }
    current = current[key] as Record<string, unknown>;
  }

  const lastKey = parts[parts.length - 1];

  switch (op.type) {
    case "track.add":
    case "bus.add":
    case "note.add":
    case "chord.update":
      if (Array.isArray(current[lastKey])) {
        current[lastKey] = [...(current[lastKey] as unknown[]), op.value];
      } else {
        current[lastKey] = op.value;
      }
      break;
    case "track.remove":
    case "bus.remove":
    case "note.remove":
      if (Array.isArray(current[lastKey])) {
        const arr = current[lastKey] as { id: string }[];
        current[lastKey] = arr.filter(
          (item) => (item as { id: string }).id !== (op.value as { id: string }).id,
        );
      }
      break;
    case "track.update":
    case "bus.update":
    case "note.update":
    case "mix.update":
      if (Array.isArray(current[lastKey])) {
        const arr = current[lastKey] as { id: string }[];
        const val = op.value as { id: string; [key: string]: unknown };
        current[lastKey] = arr.map((item) =>
          item.id === val.id ? { ...item, ...val } : item,
        );
      } else {
        current[lastKey] = {
          ...(current[lastKey] as Record<string, unknown>),
          ...(op.value as Record<string, unknown>),
        };
      }
      break;
  }

  return result;
}

export function encodeState(operations: CrdtOperation[]): string {
  return JSON.stringify({ clock: localClock, clientId, operations });
}

export function decodeState(
  data: string,
): { clock: number; clientId: string; operations: CrdtOperation[] } {
  try {
    const parsed = JSON.parse(data);
    localClock = Math.max(localClock, parsed.clock ?? 0);
    return {
      clock: parsed.clock ?? 0,
      clientId: parsed.clientId ?? "unknown",
      operations: parsed.operations ?? [],
    };
  } catch (e) {
    console.warn("Failed to decode CRDT state:", e);
    return { clock: 0, clientId: "unknown", operations: [] };
  }
}

export function createState(): CrdtState {
  return {
    vectorClock: {},
    operations: [],
    pending: [],
  };
}

export function compactOperations(
  operations: CrdtOperation[],
  maxHistory: number = 1000,
): CrdtOperation[] {
  if (operations.length <= maxHistory) return operations;
  return operations.slice(operations.length - maxHistory);
}
