import { Platform, Pressable, Text, View } from "react-native";
import { useEffect, useRef, useState } from "react";

interface MpcPadGridProps {
  pads?: number;
  columns?: number;
  baseNote?: number;
  velocity?: number;
  padColors?: string[];
  onPadDown?: (padIndex: number, velocity: number, note: number) => void;
  onPadUp?: (padIndex: number, note: number) => void;
  enableKeyboard?: boolean;
  testID?: string;
}

const DEFAULT_PADS = 16;
const DEFAULT_COLUMNS = 4;
const DEFAULT_BASE_NOTE = 36;
const DEFAULT_VELOCITY = 100;

const KEY_MAP = ["1", "2", "3", "4", "q", "w", "e", "r", "a", "s", "d", "f", "z", "x", "c", "v"];

const DEFAULT_PAD_CLASS = "bg-dark-elevated border border-dark-border";

export function MpcPadGrid({
  pads = DEFAULT_PADS,
  columns = DEFAULT_COLUMNS,
  baseNote = DEFAULT_BASE_NOTE,
  velocity = DEFAULT_VELOCITY,
  padColors,
  onPadDown,
  onPadUp,
  enableKeyboard = true,
  testID,
}: MpcPadGridProps) {
  const [active, setActive] = useState<Record<number, boolean>>({});
  const velocityRef = useRef(velocity);
  velocityRef.current = velocity;

  useEffect(() => {
    if (!enableKeyboard || Platform.OS !== "web" || typeof window === "undefined") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const idx = KEY_MAP.indexOf(e.key.toLowerCase());
      if (idx < 0 || idx >= pads) return;
      setActive((prev) => ({ ...prev, [idx]: true }));
      onPadDown?.(idx, velocityRef.current, baseNote + idx);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const idx = KEY_MAP.indexOf(e.key.toLowerCase());
      if (idx < 0 || idx >= pads) return;
      setActive((prev) => ({ ...prev, [idx]: false }));
      onPadUp?.(idx, baseNote + idx);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [enableKeyboard, pads, baseNote, onPadDown, onPadUp]);

  const handleDown = (index: number, pressure?: number) => {
    const resolved =
      typeof pressure === "number" && pressure > 0
        ? Math.max(1, Math.min(127, Math.round(pressure * 127)))
        : velocity;
    setActive((prev) => ({ ...prev, [index]: true }));
    onPadDown?.(index, resolved, baseNote + index);
  };

  const handleUp = (index: number) => {
    setActive((prev) => ({ ...prev, [index]: false }));
    onPadUp?.(index, baseNote + index);
  };

  const indices = Array.from({ length: pads }, (_, i) => i);

  return (
    <View
      testID={testID}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` } as any}
      className="grid gap-2 w-full"
    >
      {indices.map((i) => {
        const colorClass = padColors && padColors.length ? padColors[i % padColors.length] : DEFAULT_PAD_CLASS;
        const isActive = !!active[i];
        return (
          <Pressable
            key={i}
            testID={`pad-${i}`}
            aria-pressed={isActive}
            onPointerDown={(e: { pressure?: number }) => handleDown(i, e.pressure)}
            onPointerUp={() => handleUp(i)}
            onPointerCancel={() => handleUp(i)}
            className={`aspect-square rounded-xl flex items-center justify-center ${colorClass} ${
              isActive ? "opacity-100 ring-2 ring-brand-primary" : "opacity-80"
            }`}
          >
            <Text className="text-xs text-gray-400">{String(baseNote + i)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
