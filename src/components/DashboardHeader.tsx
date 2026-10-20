import { DateFields } from "@/components/DateFields";
import { HeaderSkeleton } from "@/components/HeaderSkeleton";
import { RangePresets } from "@/components/RangePresets";
import { Select } from "@/components/Select/Select";
import type { ClubSummary } from "@/types/club";
import type { DateRange } from "@/types/range";

export function DashboardHeader({
  loading,
  clubs,
  clubId,
  selected,
  from,
  to,
  onClub,
  onRange,
}: {
  loading: boolean;
  clubs: ClubSummary[] | null;
  clubId: string | null;
  selected: ClubSummary | null;
  from: string | null;
  to: string | null;
  onClub: (clubId: string) => void;
  onRange: (range: DateRange) => void;
}) {
  if (loading) return <HeaderSkeleton />;

  return (
    <header className="flex w-full flex-col lg:flex-row items-center gap-5 justify-between lg:justify-start">
       <Select
          id="club"
          options={(clubs ?? []).map((club) => ({ value: club.id, label: club.name }))}
          value={clubId ?? ""}
          onChange={onClub}
          disabled={!clubs}
          label="Insights for club"
          className="w-full lg:max-w-xs"
        />
      <div className="w-full flex flex-col gap-8 lg:flex-row lg:justify-end lg:items-end">
        <DateFields from={from} to={to} onRange={onRange} />
        <RangePresets selected={selected} from={from} to={to} onSelect={onRange} />
      </div>
    </header>
  );
}
