import {
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';

// One arrow key press on the grip moves the dock this far.
const KEY_STEP = 16;

export interface DockOffset {
  x: number;
  y: number;
}

/**
 * Where the reader moved the step dock, as its top left in canvas coordinates, or null while it
 * sits docked at the canvas bottom. `gripProps` go on the dock's grip: a drag moves the dock, the
 * arrow keys move it 16px, and Home or a double-click puts it back. The offset stays inside the
 * canvas, also when the canvas resizes. `reset` puts the dock back.
 */
export function useDockPosition(
  canvasRef: RefObject<HTMLElement | null>,
  dockRef: RefObject<HTMLElement | null>,
) {
  const [offset, setOffset] = useState<DockOffset | null>(null);
  const drag = useRef<{ pointerX: number; pointerY: number; start: DockOffset } | null>(null);

  const clamp = ({ x, y }: DockOffset): DockOffset => {
    const canvas = canvasRef.current;
    const dock = dockRef.current;
    if (!canvas || !dock) return { x, y };
    return {
      x: Math.min(Math.max(x, 0), Math.max(canvas.clientWidth - dock.offsetWidth, 0)),
      y: Math.min(Math.max(y, 0), Math.max(canvas.clientHeight - dock.offsetHeight, 0)),
    };
  };

  // The dock's current top left in canvas coordinates, docked or moved.
  const currentOffset = (): DockOffset | null => {
    const canvas = canvasRef.current;
    const dock = dockRef.current;
    if (!canvas || !dock) return null;
    const canvasBox = canvas.getBoundingClientRect();
    const dockBox = dock.getBoundingClientRect();
    return { x: dockBox.left - canvasBox.left, y: dockBox.top - canvasBox.top };
  };

  // A smaller canvas (rotating a phone, leaving full screen) keeps a moved dock inside it.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => setOffset((moved) => moved && clamp(moved)));
    observer.observe(canvas);
    return () => observer.disconnect();
    // `clamp` reads only the refs, so the effect depends on the canvas ref alone.
  }, [canvasRef]);

  const gripProps = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      const start = currentOffset();
      if (!start) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { pointerX: event.clientX, pointerY: event.clientY, start };
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const current = drag.current;
      if (!current) return;
      setOffset(
        clamp({
          x: current.start.x + event.clientX - current.pointerX,
          y: current.start.y + event.clientY - current.pointerY,
        }),
      );
    },
    onPointerUp: () => {
      drag.current = null;
    },
    onPointerCancel: () => {
      drag.current = null;
    },
    onDoubleClick: () => setOffset(null),
    // Stops the keys it uses, so the arrow keys do not also step the diagram.
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-KEY_STEP, 0],
        ArrowRight: [KEY_STEP, 0],
        ArrowUp: [0, -KEY_STEP],
        ArrowDown: [0, KEY_STEP],
      };
      if (event.key === 'Home') {
        event.preventDefault();
        event.stopPropagation();
        setOffset(null);
        return;
      }
      const move = moves[event.key];
      const start = currentOffset();
      if (!move || !start) return;
      event.preventDefault();
      event.stopPropagation();
      setOffset(clamp({ x: start.x + move[0], y: start.y + move[1] }));
    },
  };

  return { offset, gripProps, reset: () => setOffset(null) };
}
