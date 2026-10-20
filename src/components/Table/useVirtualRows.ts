"use client";

import { useEffect, useState, type RefObject } from "react";
import { virtualRange } from "@/components/Table/virtualRange";

const assumedViewportPx = 28 * 16;

export function useVirtualRows(count: number, scrollRef: RefObject<HTMLDivElement | null>) {
  const [range, setRange] = useState(() => virtualRange(0, assumedViewportPx, count));

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || count === 0) return;
    function update() {
      const node = scrollRef.current;
      if (!node) return;
      const next = virtualRange(node.scrollTop, node.clientHeight, count);
      setRange((current) => (current.start === next.start && current.end === next.end ? current : next));
    }
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [count, scrollRef]);

  if (count === 0) return { start: 0, end: 0 };
  if (range.end === 0) return virtualRange(0, assumedViewportPx, count);
  return range;
}
