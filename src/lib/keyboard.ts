import { useEffect, useRef } from "react";
import { Platform } from "react-native";

interface ShortcutMap {
  [key: string]: (() => void) | undefined;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handler = (e: KeyboardEvent) => {
      const s = shortcutsRef.current;
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      if (ctrl && !shift && key === "z") {
        s.undo?.();
        e.preventDefault();
        return;
      }
      if (ctrl && shift && key === "z") {
        s.redo?.();
        e.preventDefault();
        return;
      }
      if (ctrl && !shift && key === "y") {
        s.redo?.();
        e.preventDefault();
        return;
      }
      if (ctrl && key === "s") {
        s.save?.();
        e.preventDefault();
        return;
      }
      if (ctrl && key === "b") {
        s.bounce?.();
        e.preventDefault();
        return;
      }

      if (key === " ") {
        s.play?.();
        e.preventDefault();
        return;
      }
      if (key === "m") {
        s.toggleMute?.();
        e.preventDefault();
        return;
      }
      if (key === "s") {
        s.toggleSolo?.();
        e.preventDefault();
        return;
      }
      if (key === "r") {
        s.record?.();
        e.preventDefault();
        return;
      }
      if (key === "delete" || key === "backspace") {
        s.delete?.();
        e.preventDefault();
        return;
      }
      if (key === "escape") {
        s.escape?.();
        e.preventDefault();
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
