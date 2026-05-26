"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Flex,
  Grid,
  Heading,
  Select,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { AllocationArea, DeskPolicy, IPTPolicy, Plan, WorkLocation } from "@/lib/types";

const WORK_LOCATIONS: WorkLocation[] = [
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

const ALLOCATION_AREAS: AllocationArea[] = [
  "Enterprise Products",
  "Enterprise Solutions",
  "Enterprise Ticketing",
  "Enterprise Analytics",
];

const FISCAL_YEARS = ["FY26", "FY27", "FY28"];
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

const DEFAULT_DESK_POLICY: DeskPolicy = {
  assignInboundEmbeds: null,
  outboundSeatedWithPillars: null,
  assignPlannedGrowth: null,
  specialArrangementInterns: null,
};

const DEFAULT_IPT_POLICY: IPTPolicy = {
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
};

interface Step1 {
  workLocation: WorkLocation | "";
  allocationArea: AllocationArea | "";
  fiscalYear: string;
  quarter: string;
}

interface Step2 {
  fullTime: number;
  partTime: number;
  interns: number;
  contingent: number;
  other: number;
  futureHeadcount: number;
}

interface Step3 {
  assignedDesks: number;
  availableDesks: number;
  dropIn: number;
  reservable: number;
}

const STEP_LABELS = ["Plan basics", "Employees", "Workspaces", "Review"];

function StepIndicator({ current }: { current: number }) {
  return (
    <Flex align="center" gap="0" style={{ width: "100%" }}>
      {STEP_LABELS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <Flex key={label} align="center" style={{ flex: 1 }}>
            <Flex direction="column" align="center" gap="1" style={{ flex: 1 }}>
              <Box
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: done ? "#2657E8" : active ? "#2657E8" : "var(--gray-4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 200ms ease",
                }}
              >
                {done ? (
                  <CheckCircledIcon color="white" width={16} height={16} />
                ) : (
                  <Text size="1" weight="bold" style={{ color: active ? "white" : "var(--gray-8)" }}>
                    {i + 1}
                  </Text>
                )}
              </Box>
              <Text
                size="1"
                weight={active ? "bold" : "regular"}
                style={{ color: active ? "var(--blue-11)" : done ? "var(--gray-9)" : "var(--gray-7)" }}
              >
                {label}
              </Text>
            </Flex>
            {i < STEP_LABELS.length - 1 && (
              <Box
                style={{
                  height: 1,
                  flex: 1,
                  background: done ? "#2657E8" : "var(--gray-4)",
                  marginBottom: 20,
                  transition: "background 200ms ease",
                }}
              />
            )}
          </Flex>
        );
      })}
    </Flex>
  );
}

function NumField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <Flex direction="column" gap="1">
      <Text size="2">{label}</Text>
      {hint && <Text size="1" color="gray">{hint}</Text>}
      <TextField.Root
        type="number"
        value={String(value)}
        min="0"
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
      />
    </Flex>
  );
}

function ReviewRow({ label, value }: { label: string; value: string | number }) {
  return (
    <Flex justify="between" align="center" py="1">
      <Text size="2" color="gray">{label}</Text>
      <Text size="2" weight="medium">{value}</Text>
    </Flex>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingPlans: Plan[];
  onCreate: (plan: Plan) => void;
}

export function NewPlanModal({ open, onOpenChange, existingPlans, onCreate }: Props) {
  const [step, setStep] = useState(0);
  const [s1, setS1] = useState<Step1>({ workLocation: "", allocationArea: "", fiscalYear: "FY26", quarter: "Q2" });
  const [s2, setS2] = useState<Step2>({ fullTime: 0, partTime: 0, interns: 0, contingent: 0, other: 0, futureHeadcount: 0 });
  const [s3, setS3] = useState<Step3>({ assignedDesks: 0, availableDesks: 0, dropIn: 0, reservable: 0 });
  const [error, setError] = useState("");

  function reset() {
    setStep(0);
    setS1({ workLocation: "", allocationArea: "", fiscalYear: "FY26", quarter: "Q2" });
    setS2({ fullTime: 0, partTime: 0, interns: 0, contingent: 0, other: 0, futureHeadcount: 0 });
    setS3({ assignedDesks: 0, availableDesks: 0, dropIn: 0, reservable: 0 });
    setError("");
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  function validateStep1(): string {
    if (!s1.workLocation) return "Please select a work location.";
    if (!s1.allocationArea) return "Please select an allocation area.";
    const dup = existingPlans.find(
      (p) =>
        p.workLocation === s1.workLocation &&
        p.allocationArea === s1.allocationArea &&
        p.fiscalYear === s1.fiscalYear &&
        p.quarter === s1.quarter
    );
    if (dup) return `A plan already exists for ${s1.allocationArea} at ${s1.workLocation} in ${s1.fiscalYear} ${s1.quarter}.`;
    return "";
  }

  function next() {
    setError("");
    if (step === 0) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    setStep((s) => s + 1);
  }

  function back() {
    setError("");
    setStep((s) => s - 1);
  }

  function submit() {
    const loc = s1.workLocation as WorkLocation;
    const aa = s1.allocationArea as AllocationArea;
    const locSlug = loc.toLowerCase().replace(/\s+/g, "-");
    const aaSlug = aa.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const id = `${locSlug}-${aaSlug}-${Date.now()}`;

    const plan: Plan = {
      id,
      workLocation: loc,
      allocationArea: aa,
      status: "Plan draft",
      fiscalYear: s1.fiscalYear,
      quarter: s1.quarter,
      updatedAt: new Date().toISOString().split("T")[0],
      employeeAssessment: {
        fullTime: s2.fullTime,
        partTime: s2.partTime,
        interns: s2.interns,
        contingent: s2.contingent,
        other: s2.other,
      },
      workspaceAssessment: {
        assignedDesks: s3.assignedDesks,
        availableDesks: s3.availableDesks,
        dropIn: s3.dropIn,
        reservable: s3.reservable,
      },
      deskPolicy: DEFAULT_DESK_POLICY,
      iptPolicy: DEFAULT_IPT_POLICY,
      employeesWithDesks: 0,
      employeesWithoutDesks: 0,
      totalAllocatedSpaces: s3.assignedDesks + s3.availableDesks + s3.dropIn + s3.reservable,
      futureHeadcount: s2.futureHeadcount,
      history: [],
    };

    onCreate(plan);
    handleOpenChange(false);
  }

  const totalEmployees = s2.fullTime + s2.partTime + s2.interns + s2.contingent + s2.other;
  const totalWorkspaces = s3.assignedDesks + s3.availableDesks + s3.dropIn + s3.reservable;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content style={{ maxWidth: 520, padding: 0, overflow: "hidden", borderRadius: 16 }}>
        {/* Header */}
        <Box
          px="6"
          py="5"
          style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 100%)", borderBottom: "1px solid var(--gray-4)" }}
        >
          <Dialog.Title style={{ marginBottom: 0 }}>
            <Heading size="4">New desk policy plan</Heading>
          </Dialog.Title>
          <Text size="2" color="gray">
            Create a new plan draft for a location and allocation area
          </Text>
        </Box>

        {/* Step indicator */}
        <Box px="6" pt="5" pb="3">
          <StepIndicator current={step} />
        </Box>

        <Separator size="4" />

        {/* Step content */}
        <Box px="6" py="5" style={{ minHeight: 260 }}>
          {step === 0 && (
            <Flex direction="column" gap="4">
              <Heading size="3">Plan basics</Heading>

              <Grid columns="2" gap="4">
                <Flex direction="column" gap="2" style={{ gridColumn: "1 / -1" }}>
                  <Text size="2" weight="medium">Work location</Text>
                  <Select.Root
                    value={s1.workLocation}
                    onValueChange={(v) => setS1({ ...s1, workLocation: v as WorkLocation })}
                  >
                    <Select.Trigger placeholder="Select location" style={{ width: "100%" }} />
                    <Select.Content>
                      {WORK_LOCATIONS.map((loc) => (
                        <Select.Item key={loc} value={loc}>{loc}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>

                <Flex direction="column" gap="2" style={{ gridColumn: "1 / -1" }}>
                  <Text size="2" weight="medium">Allocation area</Text>
                  <Select.Root
                    value={s1.allocationArea}
                    onValueChange={(v) => setS1({ ...s1, allocationArea: v as AllocationArea })}
                  >
                    <Select.Trigger placeholder="Select allocation area" style={{ width: "100%" }} />
                    <Select.Content>
                      {ALLOCATION_AREAS.map((aa) => (
                        <Select.Item key={aa} value={aa}>{aa}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>

                <Flex direction="column" gap="2">
                  <Text size="2" weight="medium">Fiscal year</Text>
                  <Select.Root
                    value={s1.fiscalYear}
                    onValueChange={(v) => setS1({ ...s1, fiscalYear: v })}
                  >
                    <Select.Trigger style={{ width: "100%" }} />
                    <Select.Content>
                      {FISCAL_YEARS.map((fy) => (
                        <Select.Item key={fy} value={fy}>{fy}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>

                <Flex direction="column" gap="2">
                  <Text size="2" weight="medium">Quarter</Text>
                  <Select.Root
                    value={s1.quarter}
                    onValueChange={(v) => setS1({ ...s1, quarter: v })}
                  >
                    <Select.Trigger style={{ width: "100%" }} />
                    <Select.Content>
                      {QUARTERS.map((q) => (
                        <Select.Item key={q} value={q}>{q}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Grid>
            </Flex>
          )}

          {step === 1 && (
            <Flex direction="column" gap="4">
              <Heading size="3">Employee assessment</Heading>
              <Grid columns="2" gap="4">
                <NumField label="Full-time" value={s2.fullTime} onChange={(v) => setS2({ ...s2, fullTime: v })} />
                <NumField label="Part-time" value={s2.partTime} onChange={(v) => setS2({ ...s2, partTime: v })} />
                <NumField label="Interns" value={s2.interns} onChange={(v) => setS2({ ...s2, interns: v })} />
                <NumField label="Contingent workers" value={s2.contingent} onChange={(v) => setS2({ ...s2, contingent: v })} />
                <NumField label="Other" value={s2.other} onChange={(v) => setS2({ ...s2, other: v })} />
                <NumField
                  label="Future headcount"
                  value={s2.futureHeadcount}
                  onChange={(v) => setS2({ ...s2, futureHeadcount: v })}
                  hint="Expected growth"
                />
              </Grid>
              <Box p="3" style={{ background: "var(--blue-2)", borderRadius: "var(--radius-3)", border: "1px solid var(--blue-4)" }}>
                <Text size="2" color="blue">Total: <strong>{totalEmployees}</strong> employees</Text>
              </Box>
            </Flex>
          )}

          {step === 2 && (
            <Flex direction="column" gap="4">
              <Heading size="3">Workspace assessment</Heading>
              <Grid columns="2" gap="4">
                <NumField
                  label="Assigned desks"
                  value={s3.assignedDesks}
                  onChange={(v) => setS3({ ...s3, assignedDesks: v })}
                  hint="Currently assigned"
                />
                <NumField
                  label="Available desks"
                  value={s3.availableDesks}
                  onChange={(v) => setS3({ ...s3, availableDesks: v })}
                  hint="Unassigned, can be allocated"
                />
                <NumField
                  label="Drop-in spaces"
                  value={s3.dropIn}
                  onChange={(v) => setS3({ ...s3, dropIn: v })}
                  hint="Flexible unassigned seats"
                />
                <NumField
                  label="Reservable spaces"
                  value={s3.reservable}
                  onChange={(v) => setS3({ ...s3, reservable: v })}
                  hint="Available for advance booking"
                />
              </Grid>
              <Box p="3" style={{ background: "var(--green-2)", borderRadius: "var(--radius-3)", border: "1px solid var(--green-4)" }}>
                <Text size="2" color="green">Total: <strong>{totalWorkspaces}</strong> workspaces</Text>
              </Box>
            </Flex>
          )}

          {step === 3 && (
            <Flex direction="column" gap="4">
              <Heading size="3">Review & create</Heading>
              <Text size="2" color="gray">The plan will be created as a <strong>Plan draft</strong>. You can publish it later.</Text>

              <Box style={{ background: "var(--gray-2)", borderRadius: "var(--radius-3)" }} p="4">
                <Flex direction="column" gap="0">
                  <Text size="1" weight="bold" color="gray" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                    Plan basics
                  </Text>
                  <ReviewRow label="Location" value={s1.workLocation} />
                  <ReviewRow label="Allocation area" value={s1.allocationArea} />
                  <ReviewRow label="Period" value={`${s1.fiscalYear} ${s1.quarter}`} />
                </Flex>
              </Box>

              <Grid columns="2" gap="3">
                <Box style={{ background: "var(--blue-2)", borderRadius: "var(--radius-3)" }} p="3">
                  <Text size="1" weight="bold" color="blue" style={{ textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                    Employees
                  </Text>
                  <Text size="5" weight="bold" color="blue">{totalEmployees}</Text>
                  <Text size="1" color="gray" style={{ display: "block" }}>
                    {s2.fullTime} FT · {s2.partTime} PT · {s2.interns} interns
                  </Text>
                  <Text size="1" color="gray">{s2.futureHeadcount} expected growth</Text>
                </Box>

                <Box style={{ background: "var(--green-2)", borderRadius: "var(--radius-3)" }} p="3">
                  <Text size="1" weight="bold" color="green" style={{ textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                    Workspaces
                  </Text>
                  <Text size="5" weight="bold" color="green">{totalWorkspaces}</Text>
                  <Text size="1" color="gray" style={{ display: "block" }}>
                    {s3.assignedDesks} assigned · {s3.availableDesks} available
                  </Text>
                  <Text size="1" color="gray">{s3.dropIn} drop-in · {s3.reservable} reservable</Text>
                </Box>
              </Grid>
            </Flex>
          )}
        </Box>

        {/* Error */}
        {error && (
          <Box px="6" pb="2">
            <Text size="2" color="red">{error}</Text>
          </Box>
        )}

        <Separator size="4" />

        {/* Footer */}
        <Flex px="6" py="4" justify="between" align="center">
          <Text size="1" color="gray">Step {step + 1} of {STEP_LABELS.length}</Text>
          <Flex gap="2">
            {step > 0 && (
              <Button variant="soft" color="gray" size="2" onClick={back}>
                Back
              </Button>
            )}
            <Dialog.Close>
              <Button variant="ghost" color="gray" size="2">
                Cancel
              </Button>
            </Dialog.Close>
            {step < STEP_LABELS.length - 1 ? (
              <Button size="2" onClick={next}>
                Continue
              </Button>
            ) : (
              <Button size="2" onClick={submit} style={{ background: "#2657E8" }}>
                Create plan
              </Button>
            )}
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
