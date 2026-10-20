import type { DashboardReport } from "@/types/dashboard";
import { MetricCard } from "@/components/MetricCard";
import { activePlayersDefinition, attendanceCoverage, noShowsDefinition, sessionsHeldDefinition } from "@/components/metricCopy";
import { noShowCountLabel } from "@/utils/noShowListEmptyCopy";

export function MetricCards({ dashboard }: { dashboard: DashboardReport }) {
  const noShowValue = noShowCountLabel(dashboard.noShows.kind, dashboard.noShows.value);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <MetricCard
        label="Sessions held"
        value={String(dashboard.sessionsHeld.value)}
        count={dashboard.sessionsHeld.value}
        delta={dashboard.sessionsHeld.delta}
        definition={sessionsHeldDefinition}
        comparison={dashboard.comparison.label}
        tone="teal"
      />
      <MetricCard
        label="Active players"
        value={String(dashboard.activePlayers.value)}
        count={dashboard.activePlayers.value}
        delta={dashboard.activePlayers.delta}
        definition={activePlayersDefinition}
        comparison={dashboard.comparison.label}
        tone="sky"
      />
      <MetricCard
        label="No-shows"
        value={noShowValue}
        count={dashboard.noShows.value}
        delta={dashboard.noShows.delta}
        definition={noShowsDefinition}
        coverage={dashboard.noShows.heldSessions > 0 ? attendanceCoverage(dashboard.noShows.attendanceTaken, dashboard.noShows.heldSessions) : null}
        comparison={dashboard.comparison.label}
        tone="amber"
      />
    </div>
  );
}
