import { describe, it, expect } from "vitest";
import {
  createUndoStack,
  pushUndoCommand,
  executeUndo,
  executeRedo,
  type UndoCommand,
} from "../src/lib/history";

function makeCommand(id: string, validate: (s: Record<string, unknown>) => boolean): UndoCommand {
  return {
    id,
    userId: "local",
    timestamp: 0,
    description: id,
    execute: (s) => ({ ...s, v: ((s.v as number) ?? 0) + 1 }),
    inverse: (s) => ({ ...s, v: ((s.v as number) ?? 0) - 1 }),
    validate,
  };
}

describe("history validation surfacing (L4)", () => {
  it("executeUndo returns applied:false and an error when validate fails", () => {
    const stack = pushUndoCommand(createUndoStack(), makeCommand("c1", () => false));
    const res = executeUndo(stack, { v: 0 });
    expect(res.applied).toBe(false);
    expect(res.error).toBeTruthy();
  });

  it("executeRedo returns applied:false and an error when validate fails", () => {
    const stack = {
      undoStack: [] as UndoCommand[],
      redoStack: [makeCommand("c2", () => false)],
      maxHistory: 100,
    };
    const res = executeRedo(stack, { v: 0 });
    expect(res.applied).toBe(false);
    expect(res.error).toBeTruthy();
  });

  it("still applies when validate passes", () => {
    const stack = pushUndoCommand(createUndoStack(), makeCommand("c3", () => true));
    const res = executeUndo(stack, { v: 5 });
    expect(res.applied).toBe(true);
    expect(res.state.v).toBe(4);
    expect(res.error).toBeUndefined();
  });
});
