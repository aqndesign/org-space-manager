"use client";

import { useState } from "react";
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
} from "@radix-ui/themes";
import { Cross2Icon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { getPlansByAA, getPlansByLocation } from "@/lib/mock-data";
import { BlobCanvas } from "@/components/BlobCanvas";
import { Plan } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

function PlanCard({ plan }: { plan: Plan }) {
  const withPct =
    plan.employeesWithDesks + plan.employeesWithoutDesks > 0
      ? Math.round(
          (plan.employeesWithDesks /
            (plan.employeesWithDesks + plan.employeesWithoutDesks)) *
            100
        )
      : null;

  return (
    <Link href={`/plans/${plan.id}`} style={{ textDecoration: "none" }}>
      <Card
        variant="surface"
        style={{
          cursor: "pointer",
          transition: "box-shadow 200ms ease",
          height: "100%",
        }}
        className="plan-card"
      >
        <Flex direction="column" gap="3">
          <Flex justify="between" align="start">
            <Flex direction="column" gap="1">
              <Text size="2" weight="medium" color="gray">
                {plan.workLocation}
              </Text>
              <Heading size="3">{plan.allocationArea}</Heading>
            </Flex>
            <StatusBadge status={plan.status} />
          </Flex>

          <Text size="1" color="gray">
            {plan.fiscalYear} · {plan.quarter} · Updated{" "}
            {new Date(plan.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Text>

          {plan.status !== "Plan draft" && (
            <>
              <Separator size="4" />
              <Grid columns="2" gap="2">
                <Flex direction="column" gap="1">
                  <Text size="1" color="gray">
                    With desk
                  </Text>
                  <Text size="2" weight="medium" color="blue">
                    {plan.employeesWithDesks}
                    {withPct !== null ? ` (${withPct}%)` : ""}
                  </Text>
                </Flex>
                <Flex direction="column" gap="1">
                  <Text size="1" color="gray">
                    Without desk
                  </Text>
                  <Text size="2" weight="medium" color="blue">
                    {plan.employeesWithoutDesks}
                    {withPct !== null ? ` (${100 - withPct}%)` : ""}
                  </Text>
                </Flex>
                <Flex direction="column" gap="1">
                  <Text size="1" color="gray">
                    Allocated spaces
                  </Text>
                  <Text size="2" weight="medium">
                    {plan.totalAllocatedSpaces || "—"}
                  </Text>
                </Flex>
                <Flex direction="column" gap="1">
                  <Text size="1" color="gray">
                    Future headcount
                  </Text>
                  <Text size="2" weight="medium">
                    {plan.futureHeadcount || "—"}
                  </Text>
                </Flex>
              </Grid>
            </>
          )}
        </Flex>
      </Card>
    </Link>
  );
}

function GroupSection({ title, plans }: { title: string; plans: Plan[] }) {
  return (
    <Flex direction="column" gap="3">
      <Flex align="center" gap="3">
        <Heading size="4">{title}</Heading>
        <Text size="2" color="gray">
          {plans.length} {plans.length === 1 ? "plan" : "plans"}
        </Text>
      </Flex>
      <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="3">
        {plans.map((p) => (
          <PlanCard key={p.id} plan={p} />
        ))}
      </Grid>
    </Flex>
  );
}

export default function LandingPage() {
  const [view, setView] = useState<"location" | "aa">("location");
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentInput, setAgentInput] = useState("");
  const [agentMessages, setAgentMessages] = useState<{ role: "user" | "agent"; content: string }[]>([
    { role: "agent", content: "Hi! I'm your space planning assistant. Ask me anything about your policy plans, desk utilization, or allocation areas." },
  ]);

  function sendAgentMessage() {
    const content = agentInput.trim();
    if (!content) return;
    setAgentMessages((prev) => [
      ...prev,
      { role: "user" as const, content },
      { role: "agent" as const, content: "I'm analyzing your org's space data to answer that. This would connect to a live agent in production — for now, try opening a specific plan for deeper insights." },
    ]);
    setAgentInput("");
  }

  const byLocation = getPlansByLocation();
  const byAA = getPlansByAA();

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
    "Facebook",
    "Messenger",
    "Instagram",
    "Enterprise Solution",
    "Whatsapp",
  ];

  return (
    <Box style={{ minHeight: "100vh", background: "var(--gray-2)", position: "relative" }}>
      <BlobCanvas />
      {/* Header — liquid glass */}
      <Box
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          /* Translucent base — lets blobs bleed through */
          background: "rgba(255, 255, 255, 0.45)",
          /* Blur + saturation boost mimic glass material depth */
          backdropFilter: "blur(28px) saturate(1.8) brightness(1.06)",
          WebkitBackdropFilter: "blur(28px) saturate(1.8) brightness(1.06)",
          borderBottom: "0.5px solid rgba(0,0,0,0.1)",
          /* Inner top specular only */
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.82)",
        }}
      >
        {/* Specular highlight — behind content */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0) 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }} />
        <Flex
          align="center"
          justify="between"
          px="6"
          py="3"
          style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 1 }}
        >
          <Flex align="center" gap="3">
            {/* App icon — gradient background with layered grid motif */}
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
                <rect x="2" y="2" width="8" height="8" rx="1.5" fill="white" fillOpacity="0.95"/>
                <rect x="12" y="2" width="8" height="8" rx="1.5" fill="white" fillOpacity="0.95"/>
                <rect x="2" y="12" width="8" height="8" rx="1.5" fill="white" fillOpacity="0.95"/>
                <rect x="12" y="12" width="8" height="8" rx="1.5" fill="white" fillOpacity="0.95"/>
              </svg>
            </Box>
            <Heading size="5">Org Space Manager</Heading>
          </Flex>
          <Flex align="center" gap="2">
            <IconButton
              variant={agentOpen ? "solid" : "soft"}
              color="gray"
              size="3"
              onClick={() => setAgentOpen((o) => !o)}
              aria-label="Toggle assistant"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12.565 2.262c.799.033 1.579.136 2.332.301l-.112.222-2.44 1.232a2.222 2.222 0 0 0 0 3.966l2.44 1.23 1.232 2.441a2.222 2.222 0 0 0 3.966 0l1.23-2.44 1.432-.723c.39.937.605 1.947.605 3.009 0 5.249-5.193 9.25-11.25 9.25-.863 0-1.704-.08-2.512-.231-.014-.003-.02 0-.018 0l-4.756 2.828a1.09 1.09 0 0 1-1.629-1.13l.783-4.309-.002-.004a.066.066 0 0 0-.018-.025C1.952 16.24.75 14 .75 11.5.75 6.251 5.943 2.25 12 2.25l.565.012ZM7.75 10.475a1 1 0 0 0-1 1v.05a1 1 0 1 0 2 0v-.05a1 1 0 0 0-1-1Zm4.25 0a1 1 0 0 0-1 1v.05a1 1 0 1 0 2 0v-.05a1 1 0 0 0-1-1Zm6-9.912c.259 0 .498.127.644.335l.056.095 1.368 2.712c.035.07.054.105.069.13.011.022.011.02.005.012a.067.067 0 0 0 .011.011c-.008-.006-.01-.007.011.005.026.015.061.034.13.069L23.008 5.3a.784.784 0 0 1 0 1.4l-2.712 1.368c-.07.035-.105.054-.13.069-.022.012-.02.011-.012.005a.067.067 0 0 0-.011.011c.006-.008.006-.01-.005.011a3.784 3.784 0 0 0-.069.13L18.7 11.008a.784.784 0 0 1-1.4 0l-1.368-2.712-.069-.13c-.011-.022-.011-.02-.005-.012a.067.067 0 0 0-.011-.011c.008.006.01.007-.011-.005a3.781 3.781 0 0 0-.13-.069L12.992 6.7a.784.784 0 0 1 0-1.4l2.712-1.368c.07-.035.105-.054.13-.069.022-.012.02-.011.012-.005a.067.067 0 0 0 .011-.011c-.006.008-.007.01.005-.011.015-.026.034-.061.069-.13L17.3.992l.056-.095A.784.784 0 0 1 18 .562Z"/></svg>
            </IconButton>
            <Button size="2" style={{ background: "var(--grass-11)", color: "white" }}>
              + New plan
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Body */}
      <Flex style={{ position: "relative", zIndex: 1 }}>
        {/* Content */}
        <Box px="6" py="6" style={{ flex: 1, maxWidth: agentOpen ? "calc(1400px - 360px)" : 1400, margin: "0 auto", transition: "max-width 300ms ease" }}>
        <Flex direction="column" gap="6">
          {/* View toggle */}
          <Flex align="center" justify="between">
            <Flex direction="column" gap="1">
              <Heading size="4">Policy plans</Heading>
              <Text size="2" color="gray">
                {view === "location"
                  ? "Viewing by work location"
                  : "Viewing by allocation area"}
              </Text>
            </Flex>
            <SegmentedControl.Root
              value={view}
              onValueChange={(v) => setView(v as "location" | "aa")}
              size="2"
            >
              <SegmentedControl.Item value="location">
                Work location
              </SegmentedControl.Item>
              <SegmentedControl.Item value="aa">
                Allocation area
              </SegmentedControl.Item>
            </SegmentedControl.Root>
          </Flex>

          {/* Groups */}
          <Flex direction="column" gap="8">
            {view === "location"
              ? locationOrder
                  .filter((loc) => byLocation.has(loc))
                  .map((loc) => (
                    <GroupSection
                      key={loc}
                      title={loc}
                      plans={byLocation.get(loc)!}
                    />
                  ))
              : aaOrder
                  .filter((aa) => byAA.has(aa))
                  .map((aa) => (
                    <GroupSection
                      key={aa}
                      title={aa}
                      plans={byAA.get(aa)!}
                    />
                  ))}
          </Flex>
        </Flex>
        </Box>

        {/* Agent panel */}
        {agentOpen && (
          <Box
            style={{
              width: 360,
              flexShrink: 0,
              borderLeft: "1px solid var(--gray-4)",
              background: "white",
              position: "sticky",
              top: 57,
              height: "calc(100vh - 57px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Flex align="center" justify="between" px="4" py="3" style={{ borderBottom: "1px solid var(--gray-4)", flexShrink: 0 }}>
              <Flex direction="column">
                <Text size="2" weight="bold">Assistant</Text>
                <Text size="1" color="gray">Ask questions across all plans</Text>
              </Flex>
              <IconButton variant="ghost" color="gray" size="2" onClick={() => setAgentOpen(false)}>
                <Cross2Icon />
              </IconButton>
            </Flex>

            <ScrollArea style={{ flex: 1 }}>
              <Flex direction="column" gap="3" p="4">
                {agentMessages.map((msg, i) => (
                  <Flex key={i} direction="column" align={msg.role === "user" ? "end" : "start"}>
                    <Box
                      px="3" py="2"
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

            <Box px="4" py="3" style={{ borderTop: "1px solid var(--gray-4)", flexShrink: 0 }}>
              <Flex gap="2">
                <TextArea
                  placeholder="Ask a question..."
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAgentMessage(); } }}
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
        )}
      </Flex>
    </Box>
  );
}
