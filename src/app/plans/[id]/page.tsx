"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Checkbox,
  Flex,
  Grid,
  Heading,
  RadioGroup,
  ScrollArea,
  Separator,
  Text,
  TextArea,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import {
  ArrowLeftIcon,
  InfoCircledIcon,
  PaperPlaneIcon,
  PersonIcon,
  ResetIcon,
} from "@radix-ui/react-icons";
import { getPlanById } from "@/lib/mock-data";
import { DeskPolicy, IPTPolicy, Plan } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

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
    <Flex direction="column" gap="1" p="3" style={{ background: "var(--gray-1)", borderRadius: "var(--radius-3)", border: "1px solid var(--gray-4)" }}>
      <Flex align="center" gap="1">
        <Text size="1" color="gray">{label}</Text>
        {tooltip && (
          <Tooltip content={tooltip}>
            <InfoCircledIcon color="var(--gray-9)" style={{ cursor: "help" }} />
          </Tooltip>
        )}
      </Flex>
      <Text size="4" weight="bold" color={color ?? "gray"}>{value}</Text>
      {sub && <Text size="1" color="gray">{sub}</Text>}
    </Flex>
  );
}

/* ─── Section header ─────────────────────────────────── */
function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <Flex direction="column" gap="0">
      <Text size="2" weight="bold">{title}</Text>
      {sub && <Text size="1" color="gray">{sub}</Text>}
    </Flex>
  );
}

/* ─── Policy panel ───────────────────────────────────── */
function PolicyPanel({
  plan,
  deskPolicy,
  setDeskPolicy,
  iptPolicy,
  setIptPolicy,
  onSaveDraft,
  onSubmit,
}: {
  plan: Plan;
  deskPolicy: DeskPolicy;
  setDeskPolicy: (p: DeskPolicy) => void;
  iptPolicy: IPTPolicy;
  setIptPolicy: (p: IPTPolicy) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}) {
  const isReadOnly = plan.status === "Submitted" || plan.status === "Approved" || plan.status === "Live";

  function boolVal(v: boolean | null): string {
    if (v === null) return "";
    return v ? "yes" : "no";
  }

  function setDesk(key: keyof DeskPolicy, value: string) {
    setDeskPolicy({ ...deskPolicy, [key]: value === "yes" ? true : value === "no" ? false : null });
  }

  return (
    <Flex direction="column" style={{ height: "100%" }}>
      <Box px="4" py="4" style={{ borderBottom: "1px solid var(--gray-4)" }}>
        <Heading size="3">Desk assignment criteria</Heading>
        <Text size="1" color="gray">
          Make informed decisions based on current state data
        </Text>
      </Box>

      <ScrollArea style={{ flex: 1 }}>
        <Flex direction="column" gap="5" px="4" py="4">
          {/* ── Desk assignment ── */}
          <Flex direction="column" gap="3">
            <SectionHeader title="Desk assignment" />

            <Flex direction="column" gap="3">
              <Flex direction="column" gap="2">
                <Text size="2">Assign desks to inbound embeds?</Text>
                <RadioGroup.Root
                  value={boolVal(deskPolicy.assignInboundEmbeds)}
                  onValueChange={(v) => setDesk("assignInboundEmbeds", v)}
                  disabled={isReadOnly}
                >
                  <Flex gap="4">
                    <RadioGroup.Item value="yes">Yes</RadioGroup.Item>
                    <RadioGroup.Item value="no">No</RadioGroup.Item>
                  </Flex>
                </RadioGroup.Root>
              </Flex>

              <Flex direction="column" gap="2">
                <Text size="2">Should outbound embeds be seated with other Pillars?</Text>
                <RadioGroup.Root
                  value={boolVal(deskPolicy.outboundSeatedWithPillars)}
                  onValueChange={(v) => setDesk("outboundSeatedWithPillars", v)}
                  disabled={isReadOnly}
                >
                  <Flex gap="4">
                    <RadioGroup.Item value="yes">Yes</RadioGroup.Item>
                    <RadioGroup.Item value="no">No</RadioGroup.Item>
                  </Flex>
                </RadioGroup.Root>
              </Flex>

              <Flex direction="column" gap="2">
                <Text size="2">Should total planned growth be assigned a desk?</Text>
                <RadioGroup.Root
                  value={boolVal(deskPolicy.assignPlannedGrowth)}
                  onValueChange={(v) => setDesk("assignPlannedGrowth", v)}
                  disabled={isReadOnly}
                >
                  <Flex gap="4">
                    <RadioGroup.Item value="yes">Yes</RadioGroup.Item>
                    <RadioGroup.Item value="no">No</RadioGroup.Item>
                  </Flex>
                </RadioGroup.Root>
              </Flex>

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
            <SectionHeader
              title="In-person time (IPT) requirements"
              sub="Minimum thresholds for desk assignment eligibility"
            />

            <Flex direction="column" gap="4">
              <Flex direction="column" gap="2">
                <Flex align="center" gap="1">
                  <Text size="2">Minimum requirement to be assigned a desk</Text>
                  <Tooltip content="Evaluated over 130 work days">
                    <InfoCircledIcon color="var(--gray-9)" style={{ cursor: "help" }} />
                  </Tooltip>
                </Flex>
                <Text size="1" color="gray">Evaluated period is 130 work days</Text>
                <Flex align="center" gap="2">
                  <TextField.Root
                    value={String(iptPolicy.minimumWorkDays)}
                    onChange={(e) =>
                      setIptPolicy({ ...iptPolicy, minimumWorkDays: Number(e.target.value) || 0 })
                    }
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
                <Text size="1" color="gray">Evaluated period is 130 work days</Text>
                <Flex align="center" gap="2">
                  <TextField.Root
                    value={String(iptPolicy.allowanceNonAssigned)}
                    onChange={(e) =>
                      setIptPolicy({ ...iptPolicy, allowanceNonAssigned: Number(e.target.value) || 0 })
                    }
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
                            allowedStatuses: {
                              ...iptPolicy.allowedStatuses,
                              [key]: Boolean(checked),
                            },
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

      {/* Footer actions */}
      {!isReadOnly && (
        <Box px="4" py="3" style={{ borderTop: "1px solid var(--gray-4)" }}>
          <Flex gap="2">
            <Button variant="soft" color="gray" size="2" onClick={onSaveDraft} style={{ flex: 1 }}>
              Save draft
            </Button>
            <Button size="2" onClick={onSubmit} style={{ flex: 1 }}>
              Submit
            </Button>
          </Flex>
        </Box>
      )}
    </Flex>
  );
}

/* ─── Assessment content ─────────────────────────────── */
function AssessmentContent({ plan, deskPolicy, iptPolicy }: { plan: Plan; deskPolicy: DeskPolicy; iptPolicy: IPTPolicy }) {
  const totalEmployees =
    plan.employeeAssessment.fullTime +
    plan.employeeAssessment.partTime +
    plan.employeeAssessment.interns +
    plan.employeeAssessment.contingent +
    plan.employeeAssessment.other;

  // Compute projected desks needed based on policy
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
    <ScrollArea style={{ height: "100%" }}>
      <Flex direction="column" gap="6" p="6">
        <Flex direction="column" gap="1">
          <Heading size="5">{plan.allocationArea}</Heading>
          <Flex align="center" gap="2">
            <Text size="2" color="gray">{plan.workLocation}</Text>
            <Text color="gray" size="2">·</Text>
            <StatusBadge status={plan.status} />
            <Text color="gray" size="2">·</Text>
            <Text size="2" color="gray">{plan.fiscalYear} {plan.quarter}</Text>
          </Flex>
        </Flex>

        {plan.status === "Plan draft" && (
          <Callout.Root color="blue" variant="soft">
            <Callout.Icon><InfoCircledIcon /></Callout.Icon>
            <Callout.Text>
              This plan is a draft. A space planner needs to publish it before you can configure the desk assignment policy.
            </Callout.Text>
          </Callout.Root>
        )}

        {/* Employee assessment */}
        <Flex direction="column" gap="3">
          <SectionHeader title="Employee assessment" sub="Current headcount breakdown for this location and allocation area" />
          <Grid columns={{ initial: "2", md: "3", lg: "5" }} gap="3">
            <StatTile label="Full-time" value={plan.employeeAssessment.fullTime} color="blue" />
            <StatTile label="Part-time" value={plan.employeeAssessment.partTime} color="blue" />
            <StatTile label="Interns" value={plan.employeeAssessment.interns} tooltip="May qualify for special desk arrangement" />
            <StatTile label="Contingent workers" value={plan.employeeAssessment.contingent} />
            <StatTile label="Other" value={plan.employeeAssessment.other} />
          </Grid>
          <Flex align="center" gap="2" p="3" style={{ background: "var(--blue-2)", borderRadius: "var(--radius-3)", border: "1px solid var(--blue-4)" }}>
            <PersonIcon color="var(--blue-9)" />
            <Text size="2" color="blue">
              <strong>{totalEmployees}</strong> total employees across all classifications
            </Text>
          </Flex>
        </Flex>

        {/* Workspace assessment */}
        <Flex direction="column" gap="3">
          <SectionHeader title="Workspace assessment" sub="Current desk and space inventory at this location" />
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
            <StatTile
              label="Drop-in spaces"
              value={plan.workspaceAssessment.dropIn}
              tooltip="Flexible unassigned seats"
            />
            <StatTile
              label="Reservable spaces"
              value={plan.workspaceAssessment.reservable}
              tooltip="Spaces available for advance booking"
            />
          </Grid>
        </Flex>

        {/* Dynamic projection — only shown when policy has values */}
        {plan.status !== "Plan draft" && (deskPolicy.assignPlannedGrowth !== null || deskPolicy.specialArrangementInterns !== null) && (
          <Flex direction="column" gap="3">
            <SectionHeader
              title="Projected impact"
              sub="How your current policy decisions will affect desk allocation"
            />
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

            {surplus < 0 && (
              <Callout.Root color="orange" variant="soft">
                <Callout.Icon><InfoCircledIcon /></Callout.Icon>
                <Callout.Text>
                  Your current settings project a desk deficit of <strong>{Math.abs(surplus)}</strong> desks. Consider adjusting the IPT threshold or disabling desk assignment for some employee categories.
                </Callout.Text>
              </Callout.Root>
            )}

            {surplus >= 0 && (
              <Callout.Root color="green" variant="soft">
                <Callout.Icon><InfoCircledIcon /></Callout.Icon>
                <Callout.Text>
                  Your current settings project a surplus of <strong>{surplus}</strong> desks. There is capacity to accommodate additional headcount if needed.
                </Callout.Text>
              </Callout.Root>
            )}
          </Flex>
        )}
      </Flex>
    </ScrollArea>
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

/* ─── Agent panel ────────────────────────────────────── */
function AgentPanel({ plan }: { plan: Plan }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content: `Hi! I'm your space planning assistant. I can help you make informed decisions for the **${plan.allocationArea}** policy at **${plan.workLocation}**. Ask me anything about your desk assignment criteria, IPT requirements, or workspace data.`,
    },
  ]);
  const [input, setInput] = useState("");

  function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content) return;
    const userMsg: Message = { role: "user", content };
    const agentReply: Message = {
      role: "agent",
      content: getAgentReply(content, plan),
    };
    setMessages((prev) => [...prev, userMsg, agentReply]);
    setInput("");
  }

  return (
    <Flex direction="column" style={{ height: "100%" }}>
      <Box px="4" py="4" style={{ borderBottom: "1px solid var(--gray-4)" }}>
        <Heading size="3">Assistant</Heading>
        <Text size="1" color="gray">Ask questions or get recommendations</Text>
      </Box>

      <ScrollArea style={{ flex: 1 }}>
        <Flex direction="column" gap="3" p="4">
          {messages.map((msg, i) => (
            <Flex key={i} direction="column" align={msg.role === "user" ? "end" : "start"} gap="1">
              <Box
                px="3"
                py="2"
                style={{
                  background: msg.role === "user" ? "var(--blue-9)" : "var(--gray-3)",
                  color: msg.role === "user" ? "white" : "var(--gray-12)",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  maxWidth: "90%",
                  fontSize: "var(--font-size-2)",
                  lineHeight: "1.5",
                }}
              >
                {msg.content}
              </Box>
            </Flex>
          ))}
        </Flex>
      </ScrollArea>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <Box px="4" pb="2">
          <Flex direction="column" gap="2">
            <Text size="1" color="gray" weight="medium">Suggested questions</Text>
            <Flex direction="column" gap="1">
              {SUGGESTED_PROMPTS.map((p) => (
                <Box
                  key={p}
                  px="3"
                  py="2"
                  style={{
                    background: "var(--gray-2)",
                    border: "1px solid var(--gray-4)",
                    borderRadius: "var(--radius-3)",
                    cursor: "pointer",
                    fontSize: "var(--font-size-1)",
                    color: "var(--blue-11)",
                  }}
                  onClick={() => sendMessage(p)}
                >
                  {p}
                </Box>
              ))}
            </Flex>
          </Flex>
        </Box>
      )}

      <Box px="4" py="3" style={{ borderTop: "1px solid var(--gray-4)" }}>
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
            <Button size="2" onClick={() => sendMessage()} disabled={!input.trim()}>
              <PaperPlaneIcon />
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
}

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

  if (!plan) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Text color="gray">Plan not found.</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" style={{ height: "100vh", overflow: "hidden" }}>
      {/* Top bar */}
      <Flex
        align="center"
        justify="between"
        px="4"
        py="3"
        style={{
          background: "white",
          borderBottom: "1px solid var(--gray-4)",
          flexShrink: 0,
        }}
      >
        <Flex align="center" gap="3">
          <Button variant="ghost" color="gray" size="2" onClick={() => router.push("/")}>
            <ArrowLeftIcon /> Back
          </Button>
          <Separator orientation="vertical" style={{ height: 20 }} />
          <Flex direction="column">
            <Heading size="3">{plan.allocationArea}</Heading>
            <Text size="1" color="gray">{plan.workLocation} · {plan.fiscalYear} {plan.quarter}</Text>
          </Flex>
        </Flex>
        <Flex align="center" gap="3">
          <StatusBadge status={plan.status} />
          <Button variant="soft" color="gray" size="2">
            <ResetIcon /> History
          </Button>
        </Flex>
      </Flex>

      {/* Three-panel layout */}
      <Flex style={{ flex: 1, overflow: "hidden" }}>
        {/* Left: Policy panel */}
        <Box
          style={{
            width: 340,
            flexShrink: 0,
            borderRight: "1px solid var(--gray-4)",
            background: "white",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <PolicyPanel
            plan={plan}
            deskPolicy={deskPolicy}
            setDeskPolicy={setDeskPolicy}
            iptPolicy={iptPolicy}
            setIptPolicy={setIptPolicy}
            onSaveDraft={() => alert("Draft saved!")}
            onSubmit={() => alert("Policy submitted for planner review!")}
          />
        </Box>

        {/* Center: Assessment */}
        <Box style={{ flex: 1, background: "var(--gray-2)", display: "flex", flexDirection: "column" }}>
          <AssessmentContent plan={plan} deskPolicy={deskPolicy} iptPolicy={iptPolicy} />
        </Box>

        {/* Right: Agent panel */}
        <Box
          style={{
            width: 320,
            flexShrink: 0,
            borderLeft: "1px solid var(--gray-4)",
            background: "white",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AgentPanel plan={plan} />
        </Box>
      </Flex>
    </Flex>
  );
}
