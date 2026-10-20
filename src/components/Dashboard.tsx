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
  const current = club && from && to ? { clubId: club, from, to } : null;
  const { settled, rangeHasSettled } = useSettledRange(current);
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
      <DashboardSummary current={current} settled={settled} />
      {current ? (
        <InsightList
          current={current}
          settled={settled}
          rangeHasSettled={rangeHasSettled}
          open={listOpen}
          q={q}
          sort={sort}
          dir={dir}
          page={page}
          onOpen={(next) => writeQuery({ open: next })}
          onQueryChange={(value) => writeQuery({ q: value })}
          onSort={(columnId) => writeQuery({ sort: columnId, dir: sort === columnId && dir !== "desc" ? "desc" : "asc" })}
          onPage={(nextPage) => writeQuery({ page: nextPage })}
        />
      ) : null}
    </main>
  );
}
