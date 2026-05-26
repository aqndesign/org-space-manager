"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  IconButton,
  ScrollArea,
  SegmentedControl,
  Separator,
  Text,
  TextArea,
  Tooltip,
} from "@radix-ui/themes";
import { Cross2Icon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { addPlan, getPlansByAA, getPlansByLocation, PLANS } from "@/lib/mock-data";
import { BlobCanvas } from "@/components/BlobCanvas";
import { NewPlanModal } from "@/components/NewPlanModal";
import { Plan } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

function hexPalette(n: number, startHex: string, endHex: string): string[] {
  const parse = (h: string) => ({
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  });
  const s = parse(startHex);
  const e = parse(endHex);
  if (n === 1) return [startHex];
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const r = Math.round(s.r + (e.r - s.r) * t);
    const g = Math.round(s.g + (e.g - s.g) * t);
    const b = Math.round(s.b + (e.b - s.b) * t);
    return `rgb(${r},${g},${b})`;
  });
}

function totalHeadcount(plan: Plan) {
  const ea = plan.employeeAssessment;
  return ea.fullTime + ea.partTime + ea.interns + ea.contingent + ea.other;
}

function PlanCard({ plan }: { plan: Plan }) {
  const employees = totalHeadcount(plan);
  const assigned = plan.workspaceAssessment.assignedDesks;
  const available = plan.workspaceAssessment.availableDesks;
  const coworking = plan.workspaceAssessment.dropIn + plan.workspaceAssessment.reservable;
  const totalWorkspaces = assigned + available + coworking;

  return (
    <Tooltip content="See plan details">
    <Link href={`/plans/${plan.id}`} style={{ textDecoration: "none" }}>
      <Card
        variant="surface"
        style={{ cursor: "pointer", height: "100%", background: "white", borderRadius: 12 }}
        className="plan-card"
      >
        <Flex direction="column" gap="3">
          <Flex direction="column" gap="1">
            <Flex justify="between" align="start">
              <Heading as="h3" size="3">{plan.allocationArea}</Heading>
              <StatusBadge status={plan.status} />
            </Flex>
            <Text size="1" color="gray">
              {employees} employees · {totalWorkspaces} workspaces
            </Text>
          </Flex>

          <Separator size="4" />

          <Grid columns="2" gap="2">
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">Employees</Text>
              <Text size="2" weight="medium">{employees}</Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">Workspaces</Text>
              <Text size="2" weight="medium">{totalWorkspaces}</Text>
            </Flex>
          </Grid>
          <Text size="1" color="gray">
            {assigned} assigned · {available} available · {coworking} coworking
          </Text>

        </Flex>
      </Card>
    </Link>
    </Tooltip>
  );
}

function GroupCard({
  title,
  plans,
  view,
}: {
  title: string;
  plans: Plan[];
  view: "location" | "aa";
}) {
  const totalEmployees = plans.reduce((s, p) => s + totalHeadcount(p), 0);
  const totalAssigned = plans.reduce((s, p) => s + p.workspaceAssessment.assignedDesks, 0);
  const totalAvailable = plans.reduce((s, p) => s + p.workspaceAssessment.availableDesks, 0);
  const totalCoworking = plans.reduce(
    (s, p) => s + p.workspaceAssessment.dropIn + p.workspaceAssessment.reservable,
    0
  );
  const totalWorkspaces = totalAssigned + totalAvailable + totalCoworking;

  const [hoveredSegment, setHoveredSegment] = useState<{ group: string; value: number; color: string; rect: DOMRect } | null>(null);

  const empPalette = hexPalette(plans.length, "#2657E8", "#AFC8FF");
  const employeeBarData = plans.map((p, i) => ({
    group: view === "location" ? p.allocationArea : p.workLocation,
    value: totalHeadcount(p),
    color: empPalette[i],
  }));

  return (
    <Box
      style={{
        position: "relative",
        background: "rgba(255, 255, 255, 0.70)",
        backdropFilter: "blur(28px) saturate(1.8) brightness(1.04)",
        WebkitBackdropFilter: "blur(28px) saturate(1.8) brightness(1.04)",
        border: "0.5px solid rgba(255, 255, 255, 0.75)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 2px 23px rgba(0,0,0,0.054), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      {/* Card header — title + metadata only */}
      <Box px="5" pt="5" style={{ paddingBottom: 16 }}>
        <Flex direction="column" gap="1">
          <Flex align="baseline" gap="3">
            <Heading as="h2" size="4" style={{ color: "var(--slate-12)" }}>{title}</Heading>
            <Text size="2">
              {plans.length} {plans.length === 1 ? "plan" : "plans"}
            </Text>
          </Flex>
          <Text size="1">
            {totalEmployees.toLocaleString()} employees · {totalWorkspaces.toLocaleString()} workspaces · {totalAssigned} assigned · {totalAvailable} available · {totalCoworking} coworking
          </Text>
        </Flex>
      </Box>

      {/* Employee category bar */}
      <Box px="5" pb="0">
        <Flex style={{ width: "100%", height: 12, gap: 2 }}>
          {employeeBarData.map((d, i) => {
            const isOnly = employeeBarData.length === 1;
            const isFirst = i === 0;
            const isLast = i === employeeBarData.length - 1;
            const borderRadius = isOnly ? 4 : isFirst ? "4px 0 0 4px" : isLast ? "0 4px 4px 0" : 0;
            return (
              <Box
                key={d.group}
                style={{ flex: d.value, height: 12 }}
                onMouseEnter={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setHoveredSegment({ group: d.group, value: d.value, color: d.color, rect });
                }}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <Box
                  style={{
                    width: "100%",
                    height: "100%",
                    background: d.color,
                    borderRadius,
                    opacity: hoveredSegment !== null && hoveredSegment.group !== d.group ? 0.45 : 1,
                    transition: "opacity 80ms ease",
                    cursor: "default",
                  }}
                />
              </Box>
            );
          })}
        </Flex>
        <Flex mt="2" style={{ gap: 16 }}>
          {employeeBarData.map((d) => (
            <Flex key={d.group} align="center" gap="1">
              <Box style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
              <Text size="1" color="gray">{d.group}</Text>
            </Flex>
          ))}
        </Flex>
      </Box>

      {/* Plan cards grid */}
      <Box p="5">
        <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="3">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </Grid>
      </Box>

      {hoveredSegment && createPortal(
        <Box
          style={{
            position: "fixed",
            top: hoveredSegment.rect.top - 10,
            left: hoveredSegment.rect.left + hoveredSegment.rect.width / 2,
            transform: "translate(-50%, -100%)",
            background: "white",
            border: "1px solid var(--gray-4)",
            borderRadius: "var(--radius-3)",
            padding: "10px 14px",
            whiteSpace: "nowrap",
            zIndex: 9999,
            pointerEvents: "none",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          <Flex align="center" gap="2" mb="2">
            <Box style={{ width: 8, height: 8, borderRadius: 2, background: hoveredSegment.color, flexShrink: 0 }} />
            <Text size="1" color="gray">{hoveredSegment.group}</Text>
          </Flex>
          <Text as="div" size="4" weight="medium">{hoveredSegment.value.toLocaleString()}</Text>
          <Text as="div" size="1" color="gray">employees</Text>
        </Box>,
        document.body
      )}
    </Box>
  );
}

export default function LandingPage() {
  const [view, setView] = useState<"location" | "aa">("location");
  const [agentOpen, setAgentOpen] = useState(true);
  const [agentInput, setAgentInput] = useState("");
  const [agentMessages, setAgentMessages] = useState<{ role: "user" | "agent"; content: string }[]>([]);
  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([...PLANS]);

  function sendAgentMessage() {
    const content = agentInput.trim();
    if (!content) return;
    setAgentMessages((prev) => [
      ...prev,
      { role: "user" as const, content },
      {
        role: "agent" as const,
        content:
          "I'm analyzing your org's space data to answer that. This would connect to a live agent in production — for now, try opening a specific plan for deeper insights.",
      },
    ]);
    setAgentInput("");
  }

  function handleCreatePlan(plan: Plan) {
    addPlan(plan);
    setPlans([...PLANS]);
  }

  const byLocation = getPlansByLocation(plans);
  const byAA = getPlansByAA(plans);

  const locationOrder = [
    "Menlo Park",
    "Burlingame",
    "San Francisco",
    "Sunnyvale",
    "Fremont",
    "New York",
    "Austin",
    "Singapore",
    "Tokyo",
  ];
  const aaOrder = [
    "Enterprise Products",
    "Enterprise Solutions",
    "Enterprise Ticketing",
    "Enterprise Analytics",
  ];

  return (
    <Box style={{ height: "100vh", display: "flex", flexDirection: "column", position: "relative", background: "#FCFCFD" }}>
      {/* Header */}
      <Box
        style={{
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <Flex
          align="center"
          justify="between"
          px="6"
          py="3"
          style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 1 }}
        >
          <Flex align="center" gap="3">
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
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="8" height="8" rx="1.5" fill="white" fillOpacity="0.95" />
                <rect x="12" y="2" width="8" height="8" rx="1.5" fill="white" fillOpacity="0.95" />
                <rect x="2" y="12" width="8" height="8" rx="1.5" fill="white" fillOpacity="0.95" />
                <rect x="12" y="12" width="8" height="8" rx="1.5" fill="white" fillOpacity="0.95" />
              </svg>
            </Box>
            <Heading size="5">Org Space Manager</Heading>
          </Flex>
          <Flex align="center" gap="2">
            <IconButton
              variant="solid"
              size="2"
              onClick={() => setAgentOpen((o) => !o)}
              aria-label="Toggle assistant"
              style={{ width: 32, height: 32, background: "linear-gradient(45deg, #6025F5, #FF5555)", boxShadow: "none" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="16" height="16">
                <path
                  fill="white"
                  d="M12.565 2.262c.799.033 1.579.136 2.332.301l-.112.222-2.44 1.232a2.222 2.222 0 0 0 0 3.966l2.44 1.23 1.232 2.441a2.222 2.222 0 0 0 3.966 0l1.23-2.44 1.432-.723c.39.937.605 1.947.605 3.009 0 5.249-5.193 9.25-11.25 9.25-.863 0-1.704-.08-2.512-.231-.014-.003-.02 0-.018 0l-4.756 2.828a1.09 1.09 0 0 1-1.629-1.13l.783-4.309-.002-.004a.066.066 0 0 0-.018-.025C1.952 16.24.75 14 .75 11.5.75 6.251 5.943 2.25 12 2.25l.565.012ZM7.75 10.475a1 1 0 0 0-1 1v.05a1 1 0 1 0 2 0v-.05a1 1 0 0 0-1-1Zm4.25 0a1 1 0 0 0-1 1v.05a1 1 0 1 0 2 0v-.05a1 1 0 0 0-1-1Zm6-9.912c.259 0 .498.127.644.335l.056.095 1.368 2.712c.035.07.054.105.069.13.011.022.011.02.005.012a.067.067 0 0 0 .011.011c-.008-.006-.01-.007.011.005.026.015.061.034.13.069L23.008 5.3a.784.784 0 0 1 0 1.4l-2.712 1.368c-.07.035-.105.054-.13.069-.022.012-.02.011-.012.005a.067.067 0 0 0-.011.011c.006-.008.006-.01-.005.011a3.784 3.784 0 0 0-.069.13L18.7 11.008a.784.784 0 0 1-1.4 0l-1.368-2.712-.069-.13c-.011-.022-.011-.02-.005-.012a.067.067 0 0 0-.011-.011c.008.006.01.007-.011-.005a3.781 3.781 0 0 0-.13-.069L12.992 6.7a.784.784 0 0 1 0-1.4l2.712-1.368c.07-.035.105-.054.13-.069.022-.012.02-.011.012-.005a.067.067 0 0 0 .011-.011c-.006.008-.007.01.005-.011.015-.026.034-.061.069-.13L17.3.992l.056-.095A.784.784 0 0 1 18 .562Z"
                />
              </svg>
            </IconButton>
            <Button size="2" className="btn-green" style={{ background: "var(--btn-green-bg)", color: "white" }} onClick={() => setNewPlanOpen(true)}>
              + New plan
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Body */}
      <Box style={{ flex: 1, overflow: "hidden", borderRadius: 24, position: "relative", zIndex: 1, background: "#F0F0F3" }}>
        <BlobCanvas />
        <Flex style={{ height: "100%" }}>
          {/* Scrollable content */}
          <Box style={{ flex: 1, overflowY: "auto", height: "100%" }}>
        <Box
          px="6"
          py="6"
          style={{
            maxWidth: 1400,
            margin: "0 auto",
          }}
        >
          <Flex direction="column" gap="6">
            {/* View toggle */}
            <Flex align="center" justify="between">
              <Flex direction="column" gap="1">
                <Heading size="4">Desk policy plans</Heading>
                <Text size="2" color="gray">
                  {"Review the current space utilization and set desk policy for your org."}
                </Text>
              </Flex>
              <SegmentedControl.Root
                value={view}
                onValueChange={(v) => setView(v as "location" | "aa")}
                size="2"
              >
                <SegmentedControl.Item value="location">Work location</SegmentedControl.Item>
                <SegmentedControl.Item value="aa">Allocation area</SegmentedControl.Item>
              </SegmentedControl.Root>
            </Flex>

            {/* Groups */}
            <Flex direction="column" gap="5">
              {view === "location"
                ? locationOrder
                    .filter((loc) => byLocation.has(loc))
                    .map((loc) => (
                      <GroupCard
                        key={loc}
                        title={loc}
                        plans={byLocation.get(loc)!}
                        view="location"
                      />
                    ))
                : aaOrder
                    .filter((aa) => byAA.has(aa))
                    .map((aa) => (
                      <GroupCard key={aa} title={aa} plans={byAA.get(aa)!} view="aa" />
                    ))}
            </Flex>
          </Flex>
        </Box>

          </Box>
          {agentOpen && (
            <Box
              style={{
                width: 360,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                background: "rgba(255, 255, 255, 0.70)",
                backdropFilter: "blur(28px) saturate(1.8) brightness(1.04)",
                WebkitBackdropFilter: "blur(28px) saturate(1.8) brightness(1.04)",
                border: "0.5px solid rgba(255, 255, 255, 0.75)",
                borderRadius: 20,
                margin: "8px 8px 8px 0",
                boxShadow: "0 2px 23px rgba(0,0,0,0.054), inset 0 1px 0 rgba(255,255,255,0.9)",
                overflow: "hidden",
              }}
            >
            <Flex
              align="center"
              justify="between"
              px="4"
              py="3"
              style={{ flexShrink: 0 }}
            >
              <Flex align="center" gap="2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="20" height="20" style={{ flexShrink: 0 }}>
                  <defs>
                    <linearGradient id="panelIconGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6025F5" />
                      <stop offset="100%" stopColor="#FF5555" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#panelIconGrad)" d="M12.565 2.262c.799.033 1.579.136 2.332.301l-.112.222-2.44 1.232a2.222 2.222 0 0 0 0 3.966l2.44 1.23 1.232 2.441a2.222 2.222 0 0 0 3.966 0l1.23-2.44 1.432-.723c.39.937.605 1.947.605 3.009 0 5.249-5.193 9.25-11.25 9.25-.863 0-1.704-.08-2.512-.231-.014-.003-.02 0-.018 0l-4.756 2.828a1.09 1.09 0 0 1-1.629-1.13l.783-4.309-.002-.004a.066.066 0 0 0-.018-.025C1.952 16.24.75 14 .75 11.5.75 6.251 5.943 2.25 12 2.25l.565.012ZM7.75 10.475a1 1 0 0 0-1 1v.05a1 1 0 1 0 2 0v-.05a1 1 0 0 0-1-1Zm4.25 0a1 1 0 0 0-1 1v.05a1 1 0 1 0 2 0v-.05a1 1 0 0 0-1-1Zm6-9.912c.259 0 .498.127.644.335l.056.095 1.368 2.712c.035.07.054.105.069.13.011.022.011.02.005.012a.067.067 0 0 0 .011.011c-.008-.006-.01-.007.011.005.026.015.061.034.13.069L23.008 5.3a.784.784 0 0 1 0 1.4l-2.712 1.368c-.07.035-.105.054-.13.069-.022.012-.02.011-.012.005a.067.067 0 0 0-.011.011c.006-.008.006-.01-.005.011a3.784 3.784 0 0 0-.069.13L18.7 11.008a.784.784 0 0 1-1.4 0l-1.368-2.712-.069-.13c-.011-.022-.011-.02-.005-.012a.067.067 0 0 0-.011-.011c.008.006.01.007-.011-.005a3.781 3.781 0 0 0-.13-.069L12.992 6.7a.784.784 0 0 1 0-1.4l2.712-1.368c.07-.035.105-.054.13-.069.022-.012.02-.011.012-.005a.067.067 0 0 0 .011-.011c-.006.008-.007.01.005-.011.015-.026.034-.061.069-.13L17.3.992l.056-.095A.784.784 0 0 1 18 .562Z" />
                </svg>
                <Flex direction="column">
                  <Text size="2" weight="bold">Assistant</Text>
                  <Text size="1" color="gray">Ask questions across all plans</Text>
                </Flex>
              </Flex>
              <IconButton variant="ghost" color="gray" size="2" onClick={() => setAgentOpen(false)}>
                <Cross2Icon />
              </IconButton>
            </Flex>

            <Box style={{ flex: 1, display: "flex", flexDirection: "column", background: "white", borderRadius: "16px 16px 0 0", overflow: "hidden", minHeight: 0, margin: "0 4px 4px" }}>
            <ScrollArea style={{ flex: 1 }}>
              <Flex direction="column" gap="3" p="4">
                <Flex direction="column" align="center" gap="2" py="6">
                  <Text
                    size="5"
                    weight="bold"
                    style={{
                      background: "linear-gradient(135deg, #6025F5, #FF5555)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Hi, I'm your Campus assistant!
                  </Text>
                  <Text size="1" color="gray" align="center">Ask me anything about your space plans, desk utilization, or allocation areas.</Text>
                </Flex>
                {agentMessages.map((msg, i) => (
                  <Flex key={i} direction="column" align={msg.role === "user" ? "end" : "start"}>
                    <Box
                      px="3"
                      py="2"
                      style={{
                        background: msg.role === "user" ? "var(--blue-9)" : "var(--gray-3)",
                        color: msg.role === "user" ? "white" : "var(--gray-12)",
                        borderRadius:
                          msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
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

            <Box px="4" py="3" style={{ borderTop: "0.5px solid rgba(0,0,0,0.1)", flexShrink: 0 }}>
              <Flex gap="2">
                <TextArea
                  placeholder="Ask a question..."
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendAgentMessage();
                    }
                  }}
                  style={{ flex: 1, resize: "none", minHeight: 64, borderRadius: "var(--radius-3)" }}
                />
                <Flex direction="column" justify="end">
                  <IconButton size="2" onClick={sendAgentMessage} disabled={!agentInput.trim()}>
                    <PaperPlaneIcon />
                  </IconButton>
                </Flex>
              </Flex>
            </Box>
            </Box>
            </Box>
          )}
        </Flex>
      </Box>

      <NewPlanModal
        open={newPlanOpen}
        onOpenChange={setNewPlanOpen}
        existingPlans={plans}
        onCreate={handleCreatePlan}
      />
    </Box>
  );
}
