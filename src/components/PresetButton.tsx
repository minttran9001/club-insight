import type { DateRange } from "@/types/range";
import { Button } from "./Button";

export function PresetButton({
  label,
  range,
  from,
  to,
  onSelect,
}: {
  label: string;
  range: DateRange | undefined;
  from: string | null;
  to: string | null;
  onSelect: (range: DateRange) => void;
}) {
  const pressed = range !== undefined && from === range.from && to === range.to;
  return (
    <Button
      type="button"
      variant={pressed ? "primary" : "secondary"}
      aria-pressed={pressed}
      disabled={!range}
      onClick={() => {
        if (range) onSelect(range);
      }}
    >
      {label}
    </Button>
  );
}
