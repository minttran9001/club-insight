"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSummary } from "@/components/DashboardSummary";
import { InsightList } from "@/components/InsightList";
import { useClubQuery } from "@/hooks/useClubQuery";
import { useClubs } from "@/hooks/useClubs";
import { useSettledRange } from "@/hooks/useSettledRange";
import { OpenList } from "@/types/dashboard";

export function Dashboard() {
  const { clubs, error: clubsError } = useClubs();
  const { club, from, to, open, q, sort, dir, page, writeQuery } = useClubQuery(clubs);
  const listOpen = open ?? OpenList.sessions;
  const { settledClub, settledFrom, settledTo, rangeHasSettled } = useSettledRange(club, from, to);
  const selected = clubs?.find((item) => item.id === club) ?? null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-8 text-zinc-900 sm:px-6">
      <DashboardHeader
        loading={clubs === null && !clubsError}
        clubs={clubs}
        clubId={club}
        selected={selected}
        from={from}
        to={to}
        onClub={(clubId) => writeQuery({ club: clubId })}
        onRange={(range) => writeQuery(range)}
      />
      {clubsError ? <p role="alert">{clubsError}</p> : null}
      <DashboardSummary club={club} from={from} to={to} settledClub={settledClub} settledFrom={settledFrom} settledTo={settledTo} />
      {club && from && to ? (
        <InsightList
          open={listOpen}
          search={q}
          sort={sort}
          direction={dir}
          page={page}
          settledClub={settledClub}
          settledFrom={settledFrom}
          settledTo={settledTo}
          rangeHasSettled={rangeHasSettled}
          onOpen={(next) => writeQuery({ open: next })}
          onQueryChange={(value) => writeQuery({ q: value })}
          onSort={(columnId) => writeQuery({ sort: columnId, dir: sort === columnId && dir !== "desc" ? "desc" : "asc" })}
          onPage={(nextPage) => writeQuery({ page: nextPage })}
        />
      ) : null}
    </main>
  );
}
