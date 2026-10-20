"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import type { ClubSummary } from "@/types/club";
import { OpenList, type DashboardQuery } from "@/types/dashboard";
import { openMetric, writeClubQuery } from "@/utils/clubQuery";

export function useClubQuery(clubs: ClubSummary[] | null) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const club = searchParams.get("club");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const open = openMetric(searchParams.get("open"));
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") || null;
  const dir = searchParams.get("dir") || null;
  const pageParam = searchParams.get("page");
  const page = pageParam && /^[1-9]\d*$/.test(pageParam) ? Number(pageParam) : 1;

  useEffect(() => {
    if (!clubs || clubs.length === 0) return;
    if (club && from && to) return;
    const selected = clubs.find((item) => item.id === club) ?? clubs.find((item) => item.id === "club-001") ?? clubs[0];
    writeClubQuery((href, options) => router.replace(href, options), {
      club: selected.id,
      from: from ?? selected.presets.fourWeeks.from,
      to: to ?? selected.presets.fourWeeks.to,
      open,
      q,
      sort,
      dir,
      page,
    });
  }, [club, clubs, dir, from, open, page, q, router, sort, to]);

  function writeQuery(next: DashboardQuery) {
    const currentOpen = open ?? OpenList.sessions;
    const openChanged = next.open !== undefined && next.open !== currentOpen;
    const scopeChanged =
      (next.club !== undefined && next.club !== club) ||
      (next.from !== undefined && next.from !== from) ||
      (next.to !== undefined && next.to !== to);

    let qNext = q;
    let sortNext = sort;
    let dirNext = dir;
    let pageNext = page;

    if (openChanged) {
      qNext = "";
      sortNext = null;
      dirNext = null;
      pageNext = 1;
    } else {
      if (next.q !== undefined) qNext = next.q;
      if (next.sort !== undefined) {
        sortNext = next.sort;
        dirNext = next.dir === undefined ? dir : next.dir;
      } else if (next.dir !== undefined) {
        dirNext = next.dir;
      }
      if (scopeChanged || next.q !== undefined) pageNext = 1;
      else if (next.page !== undefined) pageNext = next.page;
    }

    writeClubQuery((href, options) => router.replace(href, options), {
      club: next.club ?? club ?? "club-001",
      from: next.from ?? from ?? undefined,
      to: next.to ?? to ?? undefined,
      open: next.open === undefined ? open : next.open,
      q: qNext,
      sort: sortNext,
      dir: sortNext ? dirNext : null,
      page: pageNext,
    });
  }

  return { club, from, to, open, q, sort, dir, page, writeQuery };
}
