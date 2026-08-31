"use client";

import { useState } from "react";
import { Badge, Box, Flex, Heading, Text, Tooltip } from "@radix-ui/themes";
import { ArrowUpIcon, CalendarIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { IPTPolicy, Plan } from "@/lib/types";

/* Post-launch analytics for a live plan. All series are deterministic mock
   data scaled from the plan's own numbers, so each plan reads differently. */

// Chart palette — brand blue + Radix orange-9, validated for CVD separation
// and lightness (dataviz six-checks). Orange sits below 3:1 contrast on
// white, so every bar carries a direct value label as relief.
const SERIES = {
  meeting: "#2657E8",
  notMeeting: "#F76B15",
};

// Same card treatment as the assessment content on the plan details page.
const CARD_STYLE: React.CSSProperties = {
  background: "white",
  border: "0.5px solid var(--gray-5)",
  borderRadius: 16,
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
  overflow: "hidden",
  padding: "20px 24px",
};

const MONTHS = ["Feb", "Mar", "Apr", "May", "Jun"];
// Share of desk-holders meeting the policy per IPT cycle, and the assigned
// office attendance rate — the mock "story" every plan's numbers follow.
const MEETING_RATIOS = [0.75, 0.82, 0.93, 0.88, 0.84];
const ATTENDANCE_PCT = [66, 73, 72, 79, 82];

const STATUS_LABELS: { key: keyof IPTPolicy["allowedStatuses"]; label: string }[] = [
  { key: "drive", label: "Drive" },
  { key: "fly", label: "Fly" },
  { key: "workFromNonMetaBusiness", label: "Work from non-Meta (business)" },
  { key: "unforeseenCircumstances", label: "Unforeseen circumstances" },
  { key: "ptoChoiceSick", label: "PTO + Choice + Sick" },
  { key: "globalTravelDays", label: "Global travel days" },
];

function percentile80(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = 0.8 * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/* ─── Stat tile with an optional green delta line ────── */
function InsightTile({
  label,
  value,
  delta,
  sub,
  tooltip,
}: {
  label: string;
  value: string | number;
  delta?: string;
  sub?: string;
  tooltip?: string;
}) {
  return (
    <Flex direction="column" gap="1" p="3" style={{ background: "var(--gray-2)", borderRadius: 12 }}>
      <Flex align="center" gap="1">
        <Text size="1" color="gray">{label}</Text>
        {tooltip && (
          <Tooltip content={tooltip}>
            <InfoCircledIcon color="var(--gray-9)" style={{ cursor: "help" }} />
          </Tooltip>
        )}
      </Flex>
      <Text className="data-viz-sm" style={{ fontSize: 20, color: "var(--slate-12)" }}>{value}</Text>
      {delta && (
        <Flex align="center" gap="1">
          <ArrowUpIcon width={12} height={12} color="var(--green-11)" />
          <Text size="1" weight="medium" style={{ color: "var(--green-11)" }}>{delta}</Text>
        </Flex>
      )}
      {sub && <Text size="1" color="gray">{sub}</Text>}
    </Flex>
  );
}

/* ─── Line chart: attendance rate over a period ──────── */
/* HTML gridlines + a stretched SVG polyline (non-scaling 2px stroke);
   hover shows a crosshair, an 8px+ marker with a surface ring, and a
   tooltip for the nearest point. Single series, so the panel title is
   the legend. */
function AttendanceLineChart({ points }: { points: { label: string; value: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = points.length;
  const x = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const path = points.map((p, i) => `${x(i)},${100 - p.value}`).join(" ");

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    setHover(Math.min(n - 1, Math.max(0, Math.round(frac * (n - 1)))));
  }

  return (
    <Box>
      <Box
        style={{ position: "relative", height: 170, marginTop: 20 }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {[0, 25, 50, 75, 100].map((g) => (
          <Box key={g} style={{ position: "absolute", left: 0, right: 0, bottom: `${g}%`, borderBottom: "1px solid var(--gray-4)" }}>
            <span style={{ position: "absolute", left: 0, bottom: 2, fontSize: 10, color: "var(--gray-9)" }}>{g}%</span>
          </Box>
        ))}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
          aria-hidden
        >
          <polyline
            points={path}
            fill="none"
            stroke={SERIES.meeting}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {hover !== null && (
          <>
            <Box style={{ position: "absolute", top: 0, bottom: 0, left: `${x(hover)}%`, width: 1, background: "var(--gray-6)", pointerEvents: "none" }} />
            <Box
              style={{
                position: "absolute",
                left: `${x(hover)}%`,
                bottom: `${points[hover].value}%`,
                width: 9,
                height: 9,
                borderRadius: 9999,
                background: SERIES.meeting,
                border: "2px solid white",
                transform: "translate(-50%, 50%)",
                pointerEvents: "none",
              }}
            />
            <Box
              style={{
                position: "absolute",
                left: `${x(hover)}%`,
                bottom: `calc(${points[hover].value}% + 10px)`,
                transform: hover === 0 ? "translateX(-8px)" : hover === n - 1 ? "translateX(calc(-100% + 8px))" : "translateX(-50%)",
                background: "white",
                border: "0.5px solid var(--gray-5)",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                padding: "4px 8px",
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              <Text size="1" color="gray">{points[hover].label} · </Text>
              <Text size="1" weight="medium">{points[hover].value}%</Text>
            </Box>
          </>
        )}
      </Box>
      <Flex justify="between" mt="1">
        {points.map((p) => (
          <Text key={p.label} size="1" color="gray">{p.label}</Text>
        ))}
      </Flex>
    </Box>
  );
}

/* ─── Grouped bars: meeting vs not meeting the policy ── */
/* Rounded data-ends, a 2px surface gap inside each pair, direct value
   labels on every bar (contrast relief for the orange series), and a
   legend — identity is never color-alone. */
function PolicyBarChart({ groups }: { groups: { label: string; meeting: number; notMeeting: number }[] }) {
  const maxVal = Math.max(...groups.flatMap((g) => [g.meeting, g.notMeeting]));
  const domain = Math.max(20, Math.ceil((maxVal * 1.15) / 20) * 20);

  function Bar({ value, color, name, group }: { value: number; color: string; name: string; group: string }) {
    return (
      <Tooltip content={`${group} · ${name}: ${value}`}>
        <Flex direction="column" align="center" justify="end" gap="1" style={{ height: "100%" }}>
          <Text size="1" style={{ color: "var(--gray-11)", fontVariantNumeric: "tabular-nums" }}>{value}</Text>
          <div style={{ width: 18, height: `${(value / domain) * 100}%`, background: color, borderRadius: "4px 4px 0 0" }} />
        </Flex>
      </Tooltip>
    );
  }

  return (
    <Box>
      <Flex gap="4" mt="2" mb="2" wrap="wrap">
        {[
          { name: "Meeting policy", color: SERIES.meeting },
          { name: "Not meeting policy", color: SERIES.notMeeting },
        ].map((s) => (
          <Flex key={s.name} align="center" gap="1">
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: s.color, display: "inline-block" }} />
            <Text size="1" color="gray">{s.name}</Text>
          </Flex>
        ))}
      </Flex>
      <Box style={{ position: "relative", height: 170 }}>
        {[0, 25, 50, 75, 100].map((g) => (
          <Box key={g} style={{ position: "absolute", left: 0, right: 0, bottom: `${g}%`, borderBottom: "1px solid var(--gray-4)" }}>
            <span style={{ position: "absolute", left: 0, bottom: 2, fontSize: 10, color: "var(--gray-9)" }}>{Math.round((domain * g) / 100)}</span>
          </Box>
        ))}
        <Flex align="end" style={{ position: "absolute", inset: 0, paddingLeft: 24 }}>
          {groups.map((g) => (
            <Flex key={g.label} align="end" justify="center" style={{ flex: 1, height: "100%", columnGap: 2 }}>
              <Bar value={g.meeting} color={SERIES.meeting} name="Meeting policy" group={g.label} />
              <Bar value={g.notMeeting} color={SERIES.notMeeting} name="Not meeting policy" group={g.label} />
            </Flex>
          ))}
        </Flex>
      </Box>
      <Flex mt="1" style={{ paddingLeft: 24 }}>
        {groups.map((g) => (
          <Text key={g.label} size="1" color="gray" align="center" style={{ flex: 1 }}>{g.label}</Text>
        ))}
      </Flex>
    </Box>
  );
}

/* ─── The Insights dashboard ─────────────────────────── */
export function PlanInsights({ plan, iptPolicy }: { plan: Plan; iptPolicy: IPTPolicy }) {
  // Desk-holders are the population the policy tracks.
  const tracked = plan.workspaceAssessment.assignedDesks;
  const allocated = plan.workspaceAssessment.assignedDesks + plan.workspaceAssessment.availableDesks;
  const ea = plan.employeeAssessment;
  const population = ea.fullTime + ea.partTime + ea.interns + ea.contingent + ea.other;

  const cycles = MONTHS.map((label, i) => {
    const meeting = Math.round(tracked * MEETING_RATIOS[i]);
    return { label, meeting, notMeeting: tracked - meeting, attendance: ATTENDANCE_PCT[i] };
  });
  const attendanceDelta = ATTENDANCE_PCT[ATTENDANCE_PCT.length - 1] - ATTENDANCE_PCT[0];
  const currentMeeting = cycles[cycles.length - 1].meeting;
  const meetingDeltaPct = Math.round(((MEETING_RATIOS[MEETING_RATIOS.length - 1] - MEETING_RATIOS[0]) / MEETING_RATIOS[0]) * 100);
  // Desk holders showing up at the current attendance rate.
  const avgInOffice = Math.round((tracked * ATTENDANCE_PCT[ATTENDANCE_PCT.length - 1]) / 100);

  // Previous policy period, for the comparison section.
  const prevMeeting = Math.round(tracked * 0.72);
  const curAvgAttendance = Math.round(ATTENDANCE_PCT.reduce((a, b) => a + b, 0) / ATTENDANCE_PCT.length);
  const prevAvgAttendance = curAvgAttendance - 7;
  const curP80 = percentile80(ATTENDANCE_PCT);
  const prevP80 = curP80 - 4.8;

  const statuses = STATUS_LABELS.filter(({ key }) => iptPolicy.allowedStatuses[key]);
  const minDays = iptPolicy.minimumWorkDays;
  const allowance = iptPolicy.allowanceNonAssigned;

  const chartGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24,
  };

  return (
    <>
      {/* Summary */}
      <Box style={CARD_STYLE}>
        <Heading as="h3" size="3" style={{ color: "var(--slate-12)", marginBottom: 2 }}>Summary</Heading>
        <Text as="div" size="1" color="gray" style={{ marginBottom: 16 }}>
          How the desk policy has performed since it went live · New desk policy in effect starting Feb 2, 2026
        </Text>
        <div className="stat-tile-grid">
          <InsightTile
            label="Assigned office attendance"
            value={`${ATTENDANCE_PCT[ATTENDANCE_PCT.length - 1]}%`}
            delta={`${attendanceDelta} pts since policy change`}
          />
          <InsightTile
            label="Employees meeting desk policy"
            value={currentMeeting}
            delta={`${meetingDeltaPct}% since policy change`}
            tooltip="Desk holders meeting the minimum in-person requirement this cycle"
          />
          <InsightTile label="Avg. people in office per day" value={avgInOffice} />
          <InsightTile label="Total allocated spaces" value={allocated} tooltip="Assigned and available desks at this location" />
          <InsightTile label="Total employee population" value={population} />
        </div>
      </Box>

      {/* Current desk policy, as configured on this plan */}
      <Box style={CARD_STYLE}>
        <Heading as="h3" size="3" style={{ color: "var(--slate-12)", marginBottom: 2 }}>Desk policy</Heading>
        <Text as="div" size="1" color="gray" style={{ marginBottom: 16 }}>The policy these insights measure against</Text>
        <div className="stat-tile-grid">
          <InsightTile
            label="Minimum requirement to be assigned a desk"
            value={`${minDays} days`}
            sub={`${((minDays / 130) * 100).toFixed(0)}% of work days or ${(minDays / 26).toFixed(1)} days/week`}
          />
          <InsightTile
            label="Allowance for non-assigned office statuses"
            value={`${allowance} days`}
            sub={`${((allowance / 130) * 100).toFixed(1)}% of work days or ${(allowance / 26).toFixed(2)} days/week`}
          />
        </div>
        <Flex direction="column" gap="1" mt="3">
          <Text size="1" color="gray">Applicable statuses for non-assigned office allowance</Text>
          <Flex gap="1" wrap="wrap">
            {statuses.length ? (
              statuses.map(({ key, label }) => (
                <Badge key={key} color="gray" variant="soft" radius="full" highContrast>{label}</Badge>
              ))
            ) : (
              <Text size="1" color="gray">None</Text>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Per-cycle behavior */}
      <Box style={CARD_STYLE}>
        <Flex align="start" justify="between" gap="3" wrap="wrap">
          <Box>
            <Heading as="h3" size="3" style={{ color: "var(--slate-12)", marginBottom: 2 }}>Team behavior by IPT cycles</Heading>
            <Text as="div" size="1" color="gray">Assigned office attendance and desk policy performance for each IPT cycle</Text>
          </Box>
          <Badge color="gray" variant="soft" radius="full" highContrast style={{ flexShrink: 0 }}>
            <CalendarIcon width={12} height={12} /> 02/02/2026 – 06/30/2026
          </Badge>
        </Flex>
        <div style={{ ...chartGrid, marginTop: 16 }}>
          <Box>
            <Text size="2" weight="medium">Assigned office attendance</Text>
            <AttendanceLineChart points={cycles.map((c) => ({ label: c.label, value: c.attendance }))} />
          </Box>
          <Box>
            <Text size="2" weight="medium">Desk policy performance</Text>
            <PolicyBarChart groups={cycles} />
          </Box>
        </div>
      </Box>

      {/* Current vs previous policy period */}
      <Box style={CARD_STYLE}>
        <Heading as="h3" size="3" style={{ color: "var(--slate-12)", marginBottom: 2 }}>Policy period comparison</Heading>
        <Text as="div" size="1" color="gray" style={{ marginBottom: 16 }}>
          Team behavior in the current policy period against the previous one
        </Text>
        <div className="stat-tile-grid">
          <InsightTile label="Peak attendance rate (P80) — previous period" value={`${prevP80.toFixed(1)}%`} tooltip="80th percentile of daily attendance across the period" />
          <InsightTile
            label="Peak attendance rate (P80) — current period"
            value={`${curP80.toFixed(1)}%`}
            delta={`${(curP80 - prevP80).toFixed(1)} pts vs previous`}
            tooltip="80th percentile of daily attendance across the period"
          />
        </div>
        <div style={{ ...chartGrid, marginTop: 16 }}>
          <Box>
            <Text size="2" weight="medium">Assigned office attendance</Text>
            <AttendanceLineChart
              points={[
                { label: "Previous period", value: prevAvgAttendance },
                { label: "Current period", value: curAvgAttendance },
              ]}
            />
          </Box>
          <Box>
            <Text size="2" weight="medium">Desk policy performance</Text>
            <PolicyBarChart
              groups={[
                { label: "Previous period", meeting: prevMeeting, notMeeting: tracked - prevMeeting },
                { label: "Current period", meeting: currentMeeting, notMeeting: tracked - currentMeeting },
              ]}
            />
          </Box>
        </div>
      </Box>
    </>
  );
}
