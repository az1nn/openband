# Design: Roadmap MPC Pad Grid

## Component API
```ts
interface MpcPadGridProps {
  pads?: number;               // default 16
  columns?: number;            // default 4
  baseNote?: number;           // MIDI note for pad 0, default 36 (C2)
  velocity?: number;           // fallback velocity when pressure unavailable, default 100
  padColors?: string[];        // Tailwind bg classes per pad (cycle if shorter)
  onPadDown?: (padIndex: number, velocity: number, note: number) => void;
  onPadUp?: (padIndex: number, note: number) => void;
  enableKeyboard?: boolean;    // default true on web
}
```

## Behavior
- Grid laid out with `View` + `className="grid"` using inline `gridTemplateColumns: repeat(columns, 1fr)` style (allowed; it's layout not a static style file).
- Each pad is a `Pressable` (from react-native) with `onPointerDown`/`onPointerUp`/`onPointerCancel`. On down: compute velocity = `typeof e.pressure === 'number' && e.pressure > 0 ? Math.round(e.pressure*127) : velocity`. Call `onPadDown(i, v, baseNote+i)`, set active state for that pad. On up/cancel: `onPadUp(i, baseNote+i)`, clear active.
- Active pad gets an `active` ring/opacity via `className` toggle (e.g., `opacity-100` vs `opacity-80` + `ring-2`).
- Keyboard: when `enableKeyboard`, map keys `[1,2,3,4,q,w,e,r,a,s,d,f,z,x,c,v]` (first `pads` of them) to pad indices; `keydown` (no repeat) → `onPadDown` with `velocity`, `keyup` → `onPadUp`. Guard with `useEffect` add/remove listeners and clean up on unmount.
- No external deps; pure RN + hooks.

## Files
- New: `src/components/MpcPadGrid.tsx`
- New: `tests/mpcPadGrid.test.tsx`
- `src/components/index.ts`: export `MpcPadGrid`.

## Tests (`tests/mpcPadGrid.test.tsx`)
Use the repo's existing React Native testing setup (check `tests/components2.test.tsx` or similar for the imported `render`/`fireEvent`/`act` helpers and jest-dom matchers). Cover:
- Renders `pads` (16) pad elements.
- Pressing a pad fires `onPadDown` with correct index, note (`baseNote+i`), and a velocity > 0.
- Releasing fires `onPadUp`.
- When a `PointerEvent` with `pressure` is simulated, velocity reflects pressure (clamp 1..127).
- `enableKeyboard` keydown triggers `onPadDown` for the mapped pad; keyup triggers `onPadUp`.
- No comments; follow existing component/test conventions.
