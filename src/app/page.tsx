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
  SegmentedControl,
  Separator,
  Text,
} from "@radix-ui/themes";
import { getPlansByAA, getPlansByLocation } from "@/lib/mock-data";
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
    <Box style={{ minHeight: "100vh", background: "var(--gray-2)" }}>
      {/* Header */}
      <Box
        style={{
          background: "white",
          borderBottom: "1px solid var(--gray-4)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Flex
          align="center"
          justify="between"
          px="6"
          py="4"
          style={{ maxWidth: 1400, margin: "0 auto" }}
        >
          <Flex direction="column" gap="0">
            <Heading size="5">Org Space Manager</Heading>
            <Text size="2" color="gray">
              FY26 Q2 · Desk Assignment Policy
            </Text>
          </Flex>
          <Flex align="center" gap="3">
            <Button variant="soft" size="2" className="grass-plan-button">
              + New plan
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Content */}
      <Box px="6" py="6" style={{ maxWidth: 1400, margin: "0 auto" }}>
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
    </Box>
  );
}
