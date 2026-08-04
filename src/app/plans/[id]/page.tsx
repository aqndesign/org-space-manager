"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Callout,
  Checkbox,
  Flex,
  Grid,
  Heading,
  IconButton,
  RadioGroup,
  ScrollArea,
  Separator,
  Table,
  Text,
  TextArea,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import {
  ChevronLeftIcon,
  Cross2Icon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  InfoCircledIcon,
  MixerHorizontalIcon,
  PaperPlaneIcon,
  PersonIcon,
  ResetIcon,
} from "@radix-ui/react-icons";
import { getEmployeesForPlan, getPlanById, MockEmployee } from "@/lib/mock-data";
import { DeskPolicy, IPTPolicy, Plan } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { BlobCanvas } from "@/components/BlobCanvas";

/* ─── Shared visual tokens (mirrors the landing page) ── */
const GLASS_CARD_STYLE: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.72)",
  backdropFilter: "blur(28px) saturate(1.8) brightness(1.04)",
  WebkitBackdropFilter: "blur(28px) saturate(1.8) brightness(1.04)",
  borderTop: "0.5px solid rgba(255,255,255,0.88)",
  borderLeft: "0.5px solid rgba(255,255,255,0.72)",
  borderRight: "0.5px solid rgba(255,255,255,0.42)",
  borderBottom: "0.5px solid rgba(255,255,255,0.32)",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.92)",
};

const WHITE_CARD_STYLE: React.CSSProperties = {
  ...GLASS_CARD_STYLE,
  background: "white",
  padding: "20px 24px",
};

/* ─── Stat tile ──────────────────────────────────────── */
function StatTile({
  label,
  value,
  sub,
  color,
  tooltip,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "blue" | "gray" | "green" | "orange";
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
      <Text className="data-viz-sm" style={{ fontSize: 20, color: color ? `var(--${color}-11)` : "var(--slate-12)" }}>{value}</Text>
      {sub && <Text size="1" color="gray">{sub}</Text>}
    </Flex>
  );
}

/* ─── Policy panel (left card) ───────────────────────── */
function PolicyPanel({
  plan,
  deskPolicy,
  setDeskPolicy,
  iptPolicy,
  setIptPolicy,
  onSaveDraft,
  onSubmit,
  collapsed,
  onToggleCollapse,
}: {
  plan: Plan;
  deskPolicy: DeskPolicy;
  setDeskPolicy: (p: DeskPolicy) => void;
  iptPolicy: IPTPolicy;
  setIptPolicy: (p: IPTPolicy) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const isReadOnly = plan.status === "Submitted" || plan.status === "Approved" || plan.status === "Live";

  function boolVal(v: boolean | null): string {
    if (v === null) return "";
    return v ? "yes" : "no";
  }

  function setDesk(key: keyof DeskPolicy, value: string) {
    setDeskPolicy({ ...deskPolicy, [key]: value === "yes" ? true : value === "no" ? false : null });
  }

  if (collapsed) {
    return (
      <button className="policy-rail" onClick={onToggleCollapse} aria-expanded={false} aria-label="Expand desk assignment criteria">
        <MixerHorizontalIcon style={{ flexShrink: 0 }} />
        <span className="policy-rail-label">Desk assignment criteria</span>
        <span className="policy-rail-end">
          <DoubleArrowRightIcon width={13} height={13} />
        </span>
      </button>
    );
  }

  return (
    <Box className="policy-card-fit" style={{ ...WHITE_CARD_STYLE, padding: 0 }}>
      {/* Panel header — title + sub-header stay fixed; everything below scrolls */}
      <Flex align="start" justify="between" style={{ padding: "16px 20px 14px 24px", borderBottom: "0.5px solid var(--gray-4)", flexShrink: 0, gap: 8 }}>
        <Box>
          <Heading as="h3" size="3" style={{ color: "var(--slate-12)" }}>Desk assignment criteria</Heading>
          <Text size="1" color="gray">Make informed decisions based on current state data</Text>
        </Box>
        <Tooltip content="Collapse panel">
          <IconButton variant="ghost" color="gray" size="1" onClick={onToggleCollapse} aria-expanded aria-label="Collapse desk assignment criteria" style={{ marginTop: 2 }}>
            <DoubleArrowLeftIcon width={13} height={13} />
          </IconButton>
        </Tooltip>
      </Flex>

      <ScrollArea style={{ flex: 1, minHeight: 0 }}>
      <Flex direction="column" gap="5" style={{ padding: "16px 24px 20px" }}>
        {/* ── Desk assignment ── */}
        <Flex direction="column" gap="3">
          <Heading as="h4" size="2" style={{ color: "var(--slate-12)" }}>Desk assignment</Heading>

          <Flex direction="column" gap="3">
            {(
              [
                { key: "assignInboundEmbeds", label: "Assign desks to inbound embeds?" },
                { key: "outboundSeatedWithPillars", label: "Should outbound embeds be seated with other Pillars?" },
                { key: "assignPlannedGrowth", label: "Should total planned growth be assigned a desk?" },
              ] as { key: keyof DeskPolicy; label: string }[]
            ).map(({ key, label }) => (
              <Flex key={key} direction="column" gap="2">
                <Text size="2">{label}</Text>
                <RadioGroup.Root value={boolVal(deskPolicy[key])} onValueChange={(v) => setDesk(key, v)} disabled={isReadOnly}>
                  <Flex gap="4">
                    <RadioGroup.Item value="yes">Yes</RadioGroup.Item>
                    <RadioGroup.Item value="no">No</RadioGroup.Item>
                  </Flex>
                </RadioGroup.Root>
              </Flex>
            ))}

            <Flex direction="column" gap="2">
              <Flex align="center" gap="1">
                <Text size="2">Special arrangement for interns?</Text>
                <Tooltip content="Interns may be eligible for temporary desk assignments during their tenure">
                  <InfoCircledIcon color="var(--gray-9)" style={{ cursor: "help" }} />
                </Tooltip>
              </Flex>
              <RadioGroup.Root
                value={boolVal(deskPolicy.specialArrangementInterns)}
                onValueChange={(v) => setDesk("specialArrangementInterns", v)}
                disabled={isReadOnly}
              >
                <Flex gap="4">
                  <RadioGroup.Item value="yes">Yes</RadioGroup.Item>
                  <RadioGroup.Item value="no">No</RadioGroup.Item>
                </Flex>
              </RadioGroup.Root>
            </Flex>
          </Flex>
        </Flex>

        <Separator size="4" />

        {/* ── IPT requirements ── */}
        <Flex direction="column" gap="3">
          <Box>
            <Heading as="h4" size="2" style={{ color: "var(--slate-12)" }}>In-person time (IPT) requirements</Heading>
            <Text size="1" color="gray">Minimum thresholds for desk assignment eligibility</Text>
          </Box>

          <Flex direction="column" gap="4">
            <Flex direction="column" gap="2">
              <Flex align="center" gap="1">
                <Text size="2">Minimum requirement to be assigned a desk</Text>
                <Tooltip content="Evaluated over 130 work days">
                  <InfoCircledIcon color="var(--gray-9)" style={{ cursor: "help" }} />
                </Tooltip>
              </Flex>
              <Flex align="center" gap="2">
                <TextField.Root
                  value={String(iptPolicy.minimumWorkDays)}
                  onChange={(e) => setIptPolicy({ ...iptPolicy, minimumWorkDays: Number(e.target.value) || 0 })}
                  disabled={isReadOnly}
                  style={{ width: 80 }}
                  type="number"
                />
                <Text size="2" color="gray">work days</Text>
              </Flex>
              <Text size="1" color="gray">
                Equivalent to {((iptPolicy.minimumWorkDays / 130) * 100).toFixed(0)}% of work days or{" "}
                {(iptPolicy.minimumWorkDays / 26).toFixed(1)} days/week.
              </Text>
            </Flex>

            <Flex direction="column" gap="2">
              <Flex align="center" gap="1">
                <Text size="2">Allowance for non-assigned office statuses</Text>
                <Tooltip content="Number of days where non-assigned statuses still count toward IPT">
                  <InfoCircledIcon color="var(--gray-9)" style={{ cursor: "help" }} />
                </Tooltip>
              </Flex>
              <Flex align="center" gap="2">
                <TextField.Root
                  value={String(iptPolicy.allowanceNonAssigned)}
                  onChange={(e) => setIptPolicy({ ...iptPolicy, allowanceNonAssigned: Number(e.target.value) || 0 })}
                  disabled={isReadOnly}
                  style={{ width: 80 }}
                  type="number"
                />
                <Text size="2" color="gray">work days</Text>
              </Flex>
              <Text size="1" color="gray">
                Equivalent to {((iptPolicy.allowanceNonAssigned / 130) * 100).toFixed(1)}% of work days or{" "}
                {(iptPolicy.allowanceNonAssigned / 26).toFixed(2)} days/week.
              </Text>
            </Flex>

            <Flex direction="column" gap="2">
              <Flex align="center" gap="1">
                <Text size="2">Which IPT status is applicable to the allowance?</Text>
                <Tooltip content="Employees are allowed to use selected statuses for up to the allowance days">
                  <InfoCircledIcon color="var(--gray-9)" style={{ cursor: "help" }} />
                </Tooltip>
              </Flex>
              <Flex direction="column" gap="2">
                {(
                  [
                    { key: "drive", label: "Drive" },
                    { key: "fly", label: "Fly" },
                    { key: "workFromNonMetaBusiness", label: "Work from non-Meta location (business)" },
                    { key: "unforeseenCircumstances", label: "Unforeseen circumstances" },
                    { key: "ptoChoiceSick", label: "PTO + Choice + Sick (non-work days)" },
                    { key: "globalTravelDays", label: "Global travel days" },
                  ] as { key: keyof IPTPolicy["allowedStatuses"]; label: string }[]
                ).map(({ key, label }) => (
                  <Flex key={key} align="center" gap="2">
                    <Checkbox
                      checked={iptPolicy.allowedStatuses[key]}
                      onCheckedChange={(checked) =>
                        setIptPolicy({
                          ...iptPolicy,
                          allowedStatuses: { ...iptPolicy.allowedStatuses, [key]: Boolean(checked) },
                        })
                      }
                      disabled={isReadOnly}
                    />
                    <Text size="2">{label}</Text>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          </Flex>
        </Flex>

      </Flex>
      </ScrollArea>

      {/* Panel footer — always visible; actions disabled for read-only plans */}
      <Box style={{ padding: "12px 16px", borderTop: "0.5px solid var(--gray-4)", flexShrink: 0, background: "white" }}>
        <Flex gap="2">
          <Button variant="soft" color="gray" size="2" onClick={onSaveDraft} disabled={isReadOnly} style={{ flex: 1, color: isReadOnly ? undefined : "var(--slate-12)" }}>
            Save changes
          </Button>
          <Button size="2" onClick={onSubmit} disabled={isReadOnly} style={{ flex: 1 }}>
            Submit policy
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

/* ─── Desk status pill ───────────────────────────────── */
function DeskStatusPill({ status }: { status: MockEmployee["currentStatus"] }) {
  const color = status === "Assigned desk" ? "blue" : status === "Coworking" ? "purple" : "gray";
  return (
    <Badge color={color} variant="soft" radius="full">
      {status}
    </Badge>
  );
}

/* ─── New desk status per the plan's decisions ───────── */
function computeNewStatus(
  emp: MockEmployee,
  iptPolicy: IPTPolicy,
  deskPolicy: DeskPolicy,
): { status: MockEmployee["currentStatus"]; change: "gains" | "loses" | null } {
  const meetsIpt = emp.badgeDays >= iptPolicy.minimumWorkDays;
  const internBlocked = emp.category === "Intern" && deskPolicy.specialArrangementInterns === false;

  if (emp.currentStatus === "Assigned desk") {
    if (!meetsIpt || internBlocked) return { status: "Coworking", change: "loses" };
    return { status: "Assigned desk", change: null };
  }
  // Coworking / Drop-in today
  if (meetsIpt && !internBlocked && emp.category !== "Contingent") {
    return { status: "Assigned desk", change: "gains" };
  }
  return { status: emp.currentStatus, change: null };
}

/* ─── Employee roster table card ─────────────────────── */
function EmployeeRoster({
  plan,
  entry,
  iptPolicy,
  deskPolicy,
  compact,
}: {
  plan: Plan;
  entry: "location" | "aa";
  iptPolicy: IPTPolicy;
  deskPolicy: DeskPolicy;
  compact: boolean;
}) {
  const employees = getEmployeesForPlan(plan.id);
  const rows = employees.map((e) => ({ ...e, next: computeNewStatus(e, iptPolicy, deskPolicy) }));
  const losing = rows.filter((r) => r.next.change === "loses").length;
  const gaining = rows.filter((r) => r.next.change === "gains").length;
  const scope = entry === "aa" ? plan.allocationArea : plan.workLocation;
  const avatarSize = compact ? 24 : 30;

  return (
    <Box style={WHITE_CARD_STYLE}>
      <Flex align="baseline" justify="between" style={{ gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
        <Heading as="h3" size="3" style={{ color: "var(--slate-12)" }}>Employees — {scope}</Heading>
        <Text size="1" color="gray">{rows.length} shown</Text>
      </Flex>
      <Text as="div" size="1" color="gray" style={{ marginBottom: 12 }}>
        Desk status under this plan&apos;s policy (IPT threshold {((iptPolicy.minimumWorkDays / 130) * 100).toFixed(0)}%)
      </Text>

      <Flex align="center" style={{ gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <Badge color="orange" variant="soft" radius="full">{losing} lose assigned desk</Badge>
        <Badge color="green" variant="soft" radius="full">{gaining} gain assigned desk</Badge>
        <Badge color="gray" variant="soft" radius="full">{rows.length - losing - gaining} unchanged</Badge>
      </Flex>

      {/* Horizontal scroll is the fallback so cells never wrap or clip */}
      <Box style={{ overflowX: "auto" }}>
        <Table.Root size={compact ? "1" : "2"} style={{ whiteSpace: "nowrap" }}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Employee</Table.ColumnHeaderCell>
              {!compact && <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>}
              <Table.ColumnHeaderCell>Badge-in</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Current status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>New status</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((r) => {
              const pct = Math.round((r.badgeDays / 130) * 100);
              return (
                <Table.Row key={r.id} align="center">
                  <Table.RowHeaderCell>
                    <Flex align="center" style={{ gap: 8 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(r.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                        alt=""
                        width={avatarSize}
                        height={avatarSize}
                        style={{ borderRadius: 9999, flexShrink: 0, background: "var(--gray-3)" }}
                      />
                      <Flex direction="column" style={{ minWidth: 0 }}>
                        <Text size={compact ? "1" : "2"} weight="medium" style={{ color: "var(--slate-12)" }}>{r.name}</Text>
                        <Text size="1" color="gray">{r.role}</Text>
                      </Flex>
                    </Flex>
                  </Table.RowHeaderCell>
                  {!compact && (
                    <Table.Cell>
                      <Text size="2" color="gray">{r.category}</Text>
                    </Table.Cell>
                  )}
                  <Table.Cell>
                    <Text size={compact ? "1" : "2"} style={{ color: r.badgeDays >= iptPolicy.minimumWorkDays ? "var(--slate-12)" : "var(--orange-11)" }}>
                      {r.badgeDays}/130 · {pct}%
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <DeskStatusPill status={r.currentStatus} />
                  </Table.Cell>
                  <Table.Cell>
                    <Flex align="center" style={{ gap: 6 }}>
                      <DeskStatusPill status={r.next.status} />
                      {r.next.change === "loses" && (
                        <Text size="1" style={{ color: "var(--orange-11)", fontWeight: 500 }}>▾ loses desk</Text>
                      )}
                      {r.next.change === "gains" && (
                        <Text size="1" style={{ color: "var(--green-11)", fontWeight: 500 }}>▴ gains desk</Text>
                      )}
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
}

/* ─── Assessment content (main column) ───────────────── */
function AssessmentContent({ plan, deskPolicy, iptPolicy }: { plan: Plan; deskPolicy: DeskPolicy; iptPolicy: IPTPolicy }) {
  const totalEmployees =
    plan.employeeAssessment.fullTime +
    plan.employeeAssessment.partTime +
    plan.employeeAssessment.interns +
    plan.employeeAssessment.contingent +
    plan.employeeAssessment.other;

  let projectedNeed = plan.employeeAssessment.fullTime + plan.employeeAssessment.partTime;
  if (deskPolicy.assignPlannedGrowth) projectedNeed += plan.futureHeadcount;
  if (deskPolicy.specialArrangementInterns) projectedNeed += plan.employeeAssessment.interns;

  const surplus = plan.workspaceAssessment.availableDesks - projectedNeed + plan.workspaceAssessment.assignedDesks;
  const utilizationPct =
    plan.workspaceAssessment.assignedDesks + plan.workspaceAssessment.availableDesks > 0
      ? Math.round(
          (plan.workspaceAssessment.assignedDesks /
            (plan.workspaceAssessment.assignedDesks + plan.workspaceAssessment.availableDesks)) *
            100
        )
      : 0;

  const iptThresholdPct = ((iptPolicy.minimumWorkDays / 130) * 100).toFixed(0);

  return (
    <Flex direction="column" gap="4">
      {plan.status === "Plan draft" && (
        <Callout.Root color="blue" variant="soft" style={{ borderRadius: 12 }}>
          <Callout.Icon><InfoCircledIcon /></Callout.Icon>
          <Callout.Text>
            This plan is a draft. A space planner needs to publish it before you can configure the desk assignment policy.
          </Callout.Text>
        </Callout.Root>
      )}

      {/* Employee assessment */}
      <Box style={WHITE_CARD_STYLE}>
        <Heading as="h3" size="3" style={{ color: "var(--slate-12)", marginBottom: 2 }}>Employee assessment</Heading>
        <Text as="div" size="1" color="gray" style={{ marginBottom: 16 }}>Current headcount breakdown for this location and allocation area</Text>
        <Grid columns={{ initial: "2", md: "3", lg: "5" }} gap="3">
          <StatTile label="Full-time" value={plan.employeeAssessment.fullTime} color="blue" />
          <StatTile label="Part-time" value={plan.employeeAssessment.partTime} color="blue" />
          <StatTile label="Interns" value={plan.employeeAssessment.interns} tooltip="May qualify for special desk arrangement" />
          <StatTile label="Contingent workers" value={plan.employeeAssessment.contingent} />
          <StatTile label="Other" value={plan.employeeAssessment.other} />
        </Grid>
        <Flex align="center" gap="2" p="3" style={{ background: "var(--blue-2)", borderRadius: 12, marginTop: 12 }}>
          <PersonIcon color="var(--blue-9)" />
          <Text size="2" style={{ color: "var(--blue-11)" }}>
            <strong>{totalEmployees}</strong> total employees across all classifications
          </Text>
        </Flex>
      </Box>

      {/* Workspace assessment */}
      <Box style={WHITE_CARD_STYLE}>
        <Heading as="h3" size="3" style={{ color: "var(--slate-12)", marginBottom: 2 }}>Workspace assessment</Heading>
        <Text as="div" size="1" color="gray" style={{ marginBottom: 16 }}>Current desk and space inventory at this location</Text>
        <Grid columns={{ initial: "2", md: "4" }} gap="3">
          <StatTile
            label="Assigned desks"
            value={plan.workspaceAssessment.assignedDesks}
            sub={`${utilizationPct}% utilization`}
            color="blue"
            tooltip="Desks currently assigned to employees"
          />
          <StatTile
            label="Available desks"
            value={plan.workspaceAssessment.availableDesks}
            color="green"
            tooltip="Unassigned desks that can be allocated"
          />
          <StatTile label="Drop-in spaces" value={plan.workspaceAssessment.dropIn} tooltip="Flexible unassigned seats" />
          <StatTile label="Reservable spaces" value={plan.workspaceAssessment.reservable} tooltip="Spaces available for advance booking" />
        </Grid>
      </Box>

      {/* Dynamic projection — only shown when policy has values */}
      {plan.status !== "Plan draft" && (deskPolicy.assignPlannedGrowth !== null || deskPolicy.specialArrangementInterns !== null) && (
        <Box style={WHITE_CARD_STYLE}>
          <Heading as="h3" size="3" style={{ color: "var(--slate-12)", marginBottom: 2 }}>Projected impact</Heading>
          <Text as="div" size="1" color="gray" style={{ marginBottom: 16 }}>How your current policy decisions will affect desk allocation</Text>
          <Grid columns={{ initial: "1", md: "3" }} gap="3">
            <StatTile
              label="Projected desks needed"
              value={projectedNeed}
              color={projectedNeed > plan.workspaceAssessment.assignedDesks + plan.workspaceAssessment.availableDesks ? "orange" : "blue"}
              tooltip="Based on eligible headcount and your current policy settings"
            />
            <StatTile
              label="Estimated desk surplus / deficit"
              value={surplus >= 0 ? `+${surplus}` : String(surplus)}
              color={surplus >= 0 ? "green" : "orange"}
              tooltip="Available desks minus projected demand"
            />
            <StatTile
              label="IPT threshold"
              value={`${iptThresholdPct}%`}
              sub={`${iptPolicy.minimumWorkDays} of 130 work days`}
              color="blue"
              tooltip="Minimum in-person time required to be eligible for a desk assignment"
            />
          </Grid>

          {surplus < 0 ? (
            <Callout.Root color="orange" variant="soft" style={{ borderRadius: 12, marginTop: 12 }}>
              <Callout.Icon><InfoCircledIcon /></Callout.Icon>
              <Callout.Text>
                Your current settings project a desk deficit of <strong>{Math.abs(surplus)}</strong> desks. Consider adjusting the IPT threshold or disabling desk assignment for some employee categories.
              </Callout.Text>
            </Callout.Root>
          ) : (
            <Callout.Root color="green" variant="soft" style={{ borderRadius: 12, marginTop: 12 }}>
              <Callout.Icon><InfoCircledIcon /></Callout.Icon>
              <Callout.Text>
                Your current settings project a surplus of <strong>{surplus}</strong> desks. There is capacity to accommodate additional headcount if needed.
              </Callout.Text>
            </Callout.Root>
          )}
        </Box>
      )}
    </Flex>
  );
}

/* ─── Agent message types ────────────────────────────── */
interface Message {
  role: "user" | "agent";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "What IPT threshold do you recommend for this location?",
  "How does our desk utilization compare to similar AAs?",
  "Should interns get a special desk arrangement?",
  "What's the impact of enabling allowance for fly days?",
];

/* ─── Simple mock agent replies ─────────────────────── */
function getAgentReply(input: string, plan: Plan): string {
  const lower = input.toLowerCase();
  if (lower.includes("ipt") || lower.includes("threshold")) {
    return `For ${plan.workLocation}, based on regional attendance patterns and peer AAs, I'd recommend an IPT threshold between 70–80% (91–104 days out of 130). Your current setting of ${plan.iptPolicy.minimumWorkDays} days (${((plan.iptPolicy.minimumWorkDays / 130) * 100).toFixed(0)}%) is within that range. This balances desk utilization with flexibility for hybrid workers.`;
  }
  if (lower.includes("utilization") || lower.includes("compar")) {
    const pct = plan.workspaceAssessment.assignedDesks + plan.workspaceAssessment.availableDesks > 0
      ? Math.round((plan.workspaceAssessment.assignedDesks / (plan.workspaceAssessment.assignedDesks + plan.workspaceAssessment.availableDesks)) * 100)
      : 0;
    return `${plan.allocationArea} at ${plan.workLocation} currently has ${pct}% desk utilization (${plan.workspaceAssessment.assignedDesks} assigned out of ${plan.workspaceAssessment.assignedDesks + plan.workspaceAssessment.availableDesks} available). The org-wide average is approximately 68%. Your AA is ${pct > 68 ? "above" : "below"} average.`;
  }
  if (lower.includes("intern")) {
    return `With ${plan.employeeAssessment.interns} interns in your AA, enabling special desk arrangements would require ${plan.employeeAssessment.interns} additional temporary desk slots. Given your current available capacity of ${plan.workspaceAssessment.availableDesks} desks, this is ${plan.workspaceAssessment.availableDesks >= plan.employeeAssessment.interns ? "feasible without impacting other assignments" : "tight — you may want to review your available inventory first"}.`;
  }
  if (lower.includes("fly") || lower.includes("allowance")) {
    return `Enabling the "Fly" status for allowance means employees who travel by air to your office can count those days toward their IPT. This typically increases the eligible headcount by 3–8% for locations like ${plan.workLocation}. It's recommended for AAs with frequent cross-site collaboration.`;
  }
  return `That's a great question about your ${plan.allocationArea} policy. Based on the current data for ${plan.workLocation}, I'd suggest reviewing your IPT threshold and desk assignment criteria together to ensure alignment. Would you like me to analyze a specific aspect in more detail?`;
}

/* ─── Detail page ────────────────────────────────────── */
export default function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const plan = getPlanById(id);

  // Entry point from the landing page (?from=location|aa). Read post-mount from
  // the URL rather than useSearchParams so the page needs no Suspense boundary.
  const [entry, setEntry] = useState<"location" | "aa">("location");
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("from") === "aa") setEntry("aa");
  }, []);

  const [deskPolicy, setDeskPolicy] = useState<DeskPolicy>(
    plan?.deskPolicy ?? {
      assignInboundEmbeds: null,
      outboundSeatedWithPillars: null,
      assignPlannedGrowth: null,
      specialArrangementInterns: null,
    }
  );
  const [iptPolicy, setIptPolicy] = useState<IPTPolicy>(
    plan?.iptPolicy ?? {
      minimumWorkDays: 91,
      allowanceNonAssigned: 10,
      allowedStatuses: {
        drive: true,
        fly: true,
        workFromNonMetaBusiness: true,
        unforeseenCircumstances: false,
        ptoChoiceSick: false,
        globalTravelDays: false,
      },
    }
  );

  // ── Agent panel open/close (mirrors the landing page pattern) ──
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentPanelVisible, setAgentPanelVisible] = useState(false);
  // Policy panel collapses whenever the assistant opens (and re-expands when
  // it closes); the user can still toggle it manually in between.
  const [policyCollapsed, setPolicyCollapsed] = useState(false);
  const agentCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setAgentOpen(true);
      setPolicyCollapsed(true);
    }
  }, []);

  useEffect(() => {
    if (agentOpen) {
      // rAF lets the browser paint the initial off-screen frame first; the
      // timeout is a fallback for hidden/background tabs where rAF never fires.
      const raf = requestAnimationFrame(() => setAgentPanelVisible(true));
      const fallback = setTimeout(() => setAgentPanelVisible(true), 80);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(fallback);
      };
    }
  }, [agentOpen]);

  function openAgent() {
    if (agentCloseTimer.current) clearTimeout(agentCloseTimer.current);
    agentCloseTimer.current = null;
    setAgentOpen(true);
    setPolicyCollapsed(true);
  }

  function closeAgent() {
    setAgentPanelVisible(false);
    setPolicyCollapsed(false);
    agentCloseTimer.current = setTimeout(() => {
      setAgentOpen(false);
      agentCloseTimer.current = null;
    }, 310);
  }

  function sendMessage(text?: string) {
    if (!plan) return;
    const content = (text ?? input).trim();
    if (!content) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", content },
      { role: "agent", content: getAgentReply(content, plan) },
    ]);
    setInput("");
  }

  if (!plan) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Text color="gray">Plan not found.</Text>
      </Flex>
    );
  }

  return (
    <Box style={{ height: "100vh", display: "flex", flexDirection: "column", position: "relative", background: "#FCFCFD" }}>
      {/* Header */}
      <Box style={{ flexShrink: 0, zIndex: 10 }}>
        <Flex align="center" justify="between" px={{ initial: "4", sm: "6" }} py="3" style={{ position: "relative", zIndex: 1 }}>
          <Flex align="center" gap="3" style={{ minWidth: 0 }}>
            <Tooltip content="Back to all plans">
              <IconButton variant="soft" color="gray" size="2" onClick={() => router.push("/")} aria-label="Back to all plans" style={{ flexShrink: 0 }}>
                <ChevronLeftIcon width={16} height={16} />
              </IconButton>
            </Tooltip>
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#2657E8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 10px rgba(62, 99, 221, 0.4)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="20" height="20" color="white">
                <path fill="currentColor" d="M6.75 13.25a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm12.8.25c.206 0 .375 0 .512.01.141.012.27.038.392.1.188.095.34.248.437.436.061.121.087.251.098.392.011.137.011.306.011.512v4.6c0 .206 0 .375-.01.512-.012.141-.038.27-.1.392a.999.999 0 0 1-.436.437 1.027 1.027 0 0 1-.392.098c-.137.011-.306.011-.512.011h-4.6c-.205 0-.375 0-.512-.01a1.027 1.027 0 0 1-.392-.1.999.999 0 0 1-.437-.436 1.027 1.027 0 0 1-.098-.392c-.011-.137-.011-.306-.011-.512v-4.6c0-.205 0-.375.01-.512.012-.141.038-.27.1-.392a.999.999 0 0 1 .436-.437c.121-.061.251-.087.392-.098.137-.011.306-.011.512-.011h4.6Zm-2.3-10.75a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-7.918.251c.085.001.162.004.23.01.141.011.27.037.392.098.188.096.34.249.437.437.061.121.087.251.098.392.011.137.011.307.011.512v4.6c0 .205 0 .375-.01.512-.012.141-.038.27-.1.392a.999.999 0 0 1-.436.437 1.027 1.027 0 0 1-.392.098c-.137.011-.307.011-.512.011h-4.6c-.205 0-.375 0-.513-.01a1.027 1.027 0 0 1-.391-.1.999.999 0 0 1-.437-.436 1.026 1.026 0 0 1-.098-.392 3.588 3.588 0 0 1-.01-.23L3 9.05v-4.6c0-.205 0-.375.01-.513.012-.14.038-.27.1-.391a1 1 0 0 1 .436-.437c.121-.061.251-.087.392-.098C4.075 3 4.245 3 4.45 3h4.6l.282.001Z"/>
              </svg>
            </Box>
            <Flex direction="column" style={{ minWidth: 0 }}>
              <Flex align="center" gap="2">
                <Heading size={{ initial: "3", sm: "4" }} style={{ whiteSpace: "nowrap" }}>{plan.allocationArea}</Heading>
                <StatusBadge status={plan.status} />
              </Flex>
              <Text size="1" color="gray" style={{ whiteSpace: "nowrap" }}>
                {plan.workLocation} · {plan.fiscalYear} {plan.quarter}
              </Text>
            </Flex>
          </Flex>
          <Flex align="center" gap="2">
            <Button variant="soft" color="gray" size="2" style={{ color: "var(--slate-12)" }}>
              <ResetIcon /> History
            </Button>
            <Tooltip content={agentOpen ? "Close Campus assistant" : "Open Campus assistant"}>
              <IconButton
                variant="solid"
                size="2"
                onClick={() => (agentOpen ? closeAgent() : openAgent())}
                aria-label="Toggle assistant"
                aria-expanded={agentOpen}
                className="btn-assistant"
                style={{ width: 32, height: 32 }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  e.currentTarget.style.setProperty("--assistant-gradient", `radial-gradient(circle at ${x.toFixed(1)}% ${y.toFixed(1)}%, #CF3897 0%, #2657E8 140%)`);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.removeProperty("--assistant-gradient");
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="16" height="16">
                  <path
                    fill="white"
                    d="M12.565 2.262c.799.033 1.579.136 2.332.301l-.112.222-2.44 1.232a2.222 2.222 0 0 0 0 3.966l2.44 1.23 1.232 2.441a2.222 2.222 0 0 0 3.966 0l1.23-2.44 1.432-.723c.39.937.605 1.947.605 3.009 0 5.249-5.193 9.25-11.25 9.25-.863 0-1.704-.08-2.512-.231-.014-.003-.02 0-.018 0l-4.756 2.828a1.09 1.09 0 0 1-1.629-1.13l.783-4.309-.002-.004a.066.066 0 0 0-.018-.025C1.952 16.24.75 14 .75 11.5.75 6.251 5.943 2.25 12 2.25l.565.012ZM7.75 10.475a1 1 0 0 0-1 1v.05a1 1 0 1 0 2 0v-.05a1 1 0 0 0-1-1Zm4.25 0a1 1 0 0 0-1 1v.05a1 1 0 1 0 2 0v-.05a1 1 0 0 0-1-1Z"
                  />
                  <g className="star-icon">
                    <path
                      fill="white"
                      d="M18 0.563c.259 0 .498.127.644.335l.056.095 1.368 2.712c.035.07.054.105.069.13.011.022.011.02.005.012a.067.067 0 0 0 .011.011c-.008-.006-.01-.007.011.005.026.015.061.034.13.069L23.008 5.3a.784.784 0 0 1 0 1.4l-2.712 1.368c-.07.035-.105.054-.13.069-.022.012-.02.011-.012.005a.067.067 0 0 0-.011.011c.006-.008.006-.01-.005.011a3.784 3.784 0 0 0-.069.13L18.7 11.008a.784.784 0 0 1-1.4 0l-1.368-2.712-.069-.13c-.011-.022-.011-.02-.005-.012a.067.067 0 0 0-.011-.011c.008.006.01.007-.011-.005a3.781 3.781 0 0 0-.13-.069L12.992 6.7a.784.784 0 0 1 0-1.4l2.712-1.368c.07-.035.105-.054.13-.069.022-.012.02-.011.012-.005a.067.067 0 0 0 .011-.011c-.006.008-.007.01.005-.011.015-.026.034-.061.069-.13L17.3.992l.056-.095A.784.784 0 0 1 18 .562Z"
                    />
                  </g>
                </svg>
              </IconButton>
            </Tooltip>
          </Flex>
        </Flex>
      </Box>

      {/* Body */}
      <Box style={{ flex: 1, overflow: "hidden", borderRadius: "24px 24px 0 0", position: "relative", zIndex: 1, background: "#F0F0F3" }}>
        <BlobCanvas />

        {/* Scrollable content — right edge retracts to make room for the panel */}
        <Box
          className="scrollable-content"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: agentPanelVisible ? 376 : 0,
            overflowY: "auto",
            transition: "right 300ms ease-in-out",
          }}
        >
          <Box px={{ initial: "4", sm: "5" }} py={{ initial: "4", sm: "5" }} style={{ maxWidth: 1400, margin: "0 auto" }}>
            <Flex direction={{ initial: "column", md: "row" }} gap="4" align="start">
              {/* Left: policy card */}
              <Box className="policy-col" data-collapsed={policyCollapsed ? "true" : "false"}>
                <PolicyPanel
                  plan={plan}
                  deskPolicy={deskPolicy}
                  setDeskPolicy={setDeskPolicy}
                  iptPolicy={iptPolicy}
                  setIptPolicy={setIptPolicy}
                  onSaveDraft={() => alert("Changes saved!")}
                  onSubmit={() => alert("Policy submitted for planner review!")}
                  collapsed={policyCollapsed}
                  onToggleCollapse={() => setPolicyCollapsed((c) => !c)}
                />
              </Box>

              {/* Main column */}
              <Flex direction="column" gap="4" style={{ flex: 1, minWidth: 0 }}>
                <AssessmentContent plan={plan} deskPolicy={deskPolicy} iptPolicy={iptPolicy} />
                <EmployeeRoster plan={plan} entry={entry} iptPolicy={iptPolicy} deskPolicy={deskPolicy} compact={agentOpen} />
              </Flex>
            </Flex>
          </Box>
        </Box>

        {/* Agent panel */}
        {agentOpen && (
          <Box
            className="agent-panel"
            data-visible={agentPanelVisible ? "true" : "false"}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              bottom: 8,
              width: 360,
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              ...GLASS_CARD_STYLE,
              borderRadius: 20,
              transform: agentPanelVisible ? "translateX(0)" : "translateX(calc(100% + 8px))",
              opacity: agentPanelVisible ? 1 : 0,
              transition: "transform 300ms ease-in-out, opacity 300ms ease-in-out",
            }}
          >
            <Flex align="center" justify="between" px="4" py="3" style={{ flexShrink: 0 }}>
              <Flex align="center" gap="2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="20" height="20" style={{ flexShrink: 0 }}>
                  <defs>
                    <linearGradient id="planPanelIconGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2657E8" />
                      <stop offset="100%" stopColor="#CF3897" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#planPanelIconGrad)" d="M12.565 2.262c.799.033 1.579.136 2.332.301l-.112.222-2.44 1.232a2.222 2.222 0 0 0 0 3.966l2.44 1.23 1.232 2.441a2.222 2.222 0 0 0 3.966 0l1.23-2.44 1.432-.723c.39.937.605 1.947.605 3.009 0 5.249-5.193 9.25-11.25 9.25-.863 0-1.704-.08-2.512-.231-.014-.003-.02 0-.018 0l-4.756 2.828a1.09 1.09 0 0 1-1.629-1.13l.783-4.309-.002-.004a.066.066 0 0 0-.018-.025C1.952 16.24.75 14 .75 11.5.75 6.251 5.943 2.25 12 2.25l.565.012ZM7.75 10.475a1 1 0 0 0-1 1v.05a1 1 0 1 0 2 0v-.05a1 1 0 0 0-1-1Zm4.25 0a1 1 0 0 0-1 1v.05a1 1 0 1 0 2 0v-.05a1 1 0 0 0-1-1Zm6-9.912c.259 0 .498.127.644.335l.056.095 1.368 2.712c.035.07.054.105.069.13.011.022.011.02.005.012a.067.067 0 0 0 .011.011c-.008-.006-.01-.007.011.005.026.015.061.034.13.069L23.008 5.3a.784.784 0 0 1 0 1.4l-2.712 1.368c-.07.035-.105.054-.13.069-.022.012-.02.011-.012.005a.067.067 0 0 0-.011.011c.006-.008.006-.01-.005.011a3.784 3.784 0 0 0-.069.13L18.7 11.008a.784.784 0 0 1-1.4 0l-1.368-2.712-.069-.13c-.011-.022-.011-.02-.005-.012a.067.067 0 0 0-.011-.011c.008.006.01.007-.011-.005a3.781 3.781 0 0 0-.13-.069L12.992 6.7a.784.784 0 0 1 0-1.4l2.712-1.368c.07-.035.105-.054.13-.069.022-.012.02-.011.012-.005a.067.067 0 0 0 .011-.011c-.006.008-.007.01.005-.011.015-.026.034-.061.069-.13L17.3.992l.056-.095A.784.784 0 0 1 18 .562Z" />
                </svg>
                <Flex direction="column">
                  <Text size="2" weight="bold">Assistant</Text>
                  <Text size="1" color="gray">Guidance for this plan</Text>
                </Flex>
              </Flex>
              <IconButton variant="ghost" color="gray" size="2" onClick={() => closeAgent()} aria-label="Close assistant">
                <Cross2Icon />
              </IconButton>
            </Flex>

            <Box style={{ flex: 1, display: "flex", flexDirection: "column", background: "white", borderRadius: "16px 16px 20px 20px", overflow: "hidden", minHeight: 0, margin: "0 4px 4px" }}>
              <ScrollArea style={{ flex: 1 }}>
                <Flex direction="column" gap="3" p="4">
                  <Flex direction="column" align="center" gap="2" py="6">
                    <Text size="5" weight="bold" style={{ fontFamily: "var(--font-heading)", textAlign: "center" }}>
                      <span
                        style={{
                          background: "linear-gradient(135deg, #2657E8, #CF3897)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        Hi, I&apos;m your Campus assistant!
                      </span>
                    </Text>
                    <Text size="1" color="gray" align="center">
                      I can help you make informed decisions for <strong>{plan.allocationArea}</strong> at <strong>{plan.workLocation}</strong> — desk criteria, IPT requirements, or workspace data.
                    </Text>
                  </Flex>

                  {messages.map((msg, i) => (
                    <Flex key={i} direction="column" align={msg.role === "user" ? "end" : "start"}>
                      <Box
                        px="3"
                        py="2"
                        style={{
                          background: msg.role === "user" ? "var(--blue-9)" : "var(--gray-3)",
                          color: msg.role === "user" ? "white" : "var(--gray-12)",
                          borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          maxWidth: "90%",
                          fontSize: "var(--font-size-2)",
                          lineHeight: 1.5,
                        }}
                      >
                        {msg.content}
                      </Box>
                    </Flex>
                  ))}
                </Flex>
              </ScrollArea>

              {/* Suggested prompts */}
              {messages.length === 0 && (
                <Box px="4" pb="2">
                  <Flex direction="column" gap="2">
                    <Text size="1" color="gray" weight="medium">Suggested questions</Text>
                    <Flex direction="column" align="start" gap="1">
                      {SUGGESTED_PROMPTS.map((p) => (
                        <button
                          key={p}
                          onClick={() => sendMessage(p)}
                          style={{
                            background: "var(--gray-2)",
                            border: "0.5px solid var(--gray-4)",
                            borderRadius: 9999,
                            cursor: "pointer",
                            fontSize: "var(--font-size-1)",
                            fontFamily: "var(--font-body), system-ui",
                            color: "var(--blue-11)",
                            padding: "6px 12px",
                            textAlign: "left",
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </Flex>
                  </Flex>
                </Box>
              )}

              <Box px="4" py="3" style={{ borderTop: "0.5px solid rgba(0,0,0,0.1)", flexShrink: 0, borderRadius: "0 0 20px 20px" }}>
                <Flex gap="2">
                  <TextArea
                    placeholder="Ask a question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    style={{ flex: 1, resize: "none", minHeight: 64, borderRadius: "var(--radius-3)" }}
                  />
                  <Flex direction="column" justify="end">
                    <IconButton size="2" onClick={() => sendMessage()} disabled={!input.trim()} aria-label="Send message">
                      <PaperPlaneIcon />
                    </IconButton>
                  </Flex>
                </Flex>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
