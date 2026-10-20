import { Button } from "@/components/Button";
import { OpenList } from "@/types/dashboard";

const options: { value: OpenList; label: string }[] = [
  { value: OpenList.sessions, label: "Sessions held" },
  { value: OpenList.players, label: "Active players" },
  { value: OpenList.noShows, label: "No-shows" },
];

export function ListTypeToggle({ value, onChange }: { value: OpenList; onChange: (value: OpenList) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Table">
      {options.map((option) => {
        const pressed = value === option.value;
        return (
          <Button
            key={option.value}
            aria-pressed={pressed}
            variant={pressed ? "primary" : "secondary"}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
