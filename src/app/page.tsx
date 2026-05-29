"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Lottie from "lottie-react";
import type { LottieRefCurrentProps } from "lottie-react";
import calendarAnimation from "../../asset/icons/calendar.json";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import {
  Badge,
  Box,
  Button,
  Card,
  DropdownMenu,
  Flex,
  Grid,
  Heading,
  IconButton,
  Popover,
  ScrollArea,
  Select,
  Separator,
  Text,
  TextArea,
  Tooltip,
} from "@radix-ui/themes";
import { ChevronDownIcon, Cross2Icon, MixerHorizontalIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { addPlan, getPlansByAA, getPlansByLocation, PLANS } from "@/lib/mock-data";
import { BlobCanvas } from "@/components/BlobCanvas";
import { NewPlanModal } from "@/components/NewPlanModal";
import { Plan, PlanStatus, WorkLocation, AllocationArea } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

const GLASS_CARD_STYLE: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.72)",
  backdropFilter: "blur(28px) saturate(1.8) brightness(1.04)",
  WebkitBackdropFilter: "blur(28px) saturate(1.8) brightness(1.04)",
  border: "0.5px solid rgba(255, 255, 255, 0.75)",
  borderRadius: 20,
  overflow: "hidden",
  boxShadow: "0 2px 23px rgba(0,0,0,0.054), inset 0 1px 0 rgba(255,255,255,0.9)",
};

function toggleSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function FilterPill({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  const count = selected.size;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button
          variant="soft"
          color={count > 0 ? "blue" : "gray"}
          size="1"
          radius="full"
        >
          {count > 0 ? `${label} · ${count}` : label}
          <ChevronDownIcon width={12} height={12} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content size="1" color={count > 0 ? "blue" : "gray"}>
        {options.map(opt => (
          <DropdownMenu.CheckboxItem
            key={opt}
            checked={selected.has(opt)}
            onCheckedChange={() => onToggle(opt)}
          >
            {opt}
          </DropdownMenu.CheckboxItem>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function PillarPill() {
  return (
    <Button
      variant="soft"
      color="blue"
      size="1"
      radius="full"
      disabled
      style={{ opacity: 1, cursor: "default" }}
    >
      Pillar · Enterprise Engineering
    </Button>
  );
}

type QuarterRange = { startQ: number; startYear: number; endQ: number; endYear: number };

function QuarterRangePill({
  value,
  onChange,
}: {
  value: QuarterRange | null;
  onChange: (v: QuarterRange | null) => void;
}) {
  const YEARS = [2023, 2024, 2025, 2026, 2027];
  const DEFAULT: QuarterRange = { startQ: 1, startYear: 2026, endQ: 4, endYear: 2026 };
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<QuarterRange>(value ?? DEFAULT);

  // Reset draft when the popover opens so it always reflects the current value
  useEffect(() => {
    if (open) setDraft(value ?? DEFAULT);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const label = value
    ? `Q${value.startQ} ${value.startYear} – Q${value.endQ} ${value.endYear}`
    : "Evaluation period";

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <Button variant="soft" color={value ? "blue" : "gray"} size="1" radius="full">
          {label}
          <ChevronDownIcon width={12} height={12} />
        </Button>
      </Popover.Trigger>
      <Popover.Content size="1" style={{ width: 296 }}>
        <Flex direction="column" gap="3">
          <Flex gap="3">
            {/* Start */}
            <Flex direction="column" gap="1" style={{ flex: 1 }}>
              <Text size="1" color="gray" weight="medium">Start</Text>
              <Flex gap="1">
                <Select.Root
                  size="1"
                  value={String(draft.startQ)}
                  onValueChange={(v) => setDraft(d => ({ ...d, startQ: Number(v) }))}
                >
                  <Select.Trigger style={{ flex: 1 }} />
                  <Select.Content>
                    {[1, 2, 3, 4].map(q => (
                      <Select.Item key={q} value={String(q)}>Q{q}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                <Select.Root
                  size="1"
                  value={String(draft.startYear)}
                  onValueChange={(v) => setDraft(d => ({ ...d, startYear: Number(v) }))}
                >
                  <Select.Trigger style={{ flex: 1 }} />
                  <Select.Content>
                    {YEARS.map(y => (
                      <Select.Item key={y} value={String(y)}>{y}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Flex>
            </Flex>
            {/* End */}
            <Flex direction="column" gap="1" style={{ flex: 1 }}>
              <Text size="1" color="gray" weight="medium">End</Text>
              <Flex gap="1">
                <Select.Root
                  size="1"
                  value={String(draft.endQ)}
                  onValueChange={(v) => setDraft(d => ({ ...d, endQ: Number(v) }))}
                >
                  <Select.Trigger style={{ flex: 1 }} />
                  <Select.Content>
                    {[1, 2, 3, 4].map(q => (
                      <Select.Item key={q} value={String(q)}>Q{q}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                <Select.Root
                  size="1"
                  value={String(draft.endYear)}
                  onValueChange={(v) => setDraft(d => ({ ...d, endYear: Number(v) }))}
                >
                  <Select.Trigger style={{ flex: 1 }} />
                  <Select.Content>
                    {YEARS.map(y => (
                      <Select.Item key={y} value={String(y)}>{y}</Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Flex>
            </Flex>
          </Flex>
          <Flex justify="end" gap="2">
            <Button
              size="1"
              variant="ghost"
              color="gray"
              onClick={() => { onChange(null); setOpen(false); }}
            >
              Clear
            </Button>
            <Button
              size="1"
              variant="solid"
              onClick={() => { onChange(draft); setOpen(false); }}
            >
              Apply
            </Button>
          </Flex>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}

type FilterSheetProps = {
  open: boolean;
  onClose: () => void;
  statusFilter: Set<PlanStatus>;
  setStatusFilter: (s: Set<PlanStatus>) => void;
  locationFilter: Set<WorkLocation>;
  setLocationFilter: (s: Set<WorkLocation>) => void;
  aaFilter: Set<AllocationArea>;
  setAAFilter: (s: Set<AllocationArea>) => void;
  periodFilter: QuarterRange | null;
  setPeriodFilter: (v: QuarterRange | null) => void;
  availableLocations: string[];
  availableAAs: string[];
};

function FilterSheet({
  open,
  onClose,
  statusFilter, setStatusFilter,
  locationFilter, setLocationFilter,
  aaFilter, setAAFilter,
  periodFilter, setPeriodFilter,
  availableLocations,
  availableAAs,
}: FilterSheetProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(() => {
        setMounted(false);
        closeTimer.current = null;
      }, 310);
    }
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [open]);

  if (!mounted) return null;

  const STATUS_OPTIONS: PlanStatus[] = ["Plan draft", "Policy draft", "Submitted", "Approved", "Live"];
  const YEARS = [2023, 2024, 2025, 2026, 2027];
  const DEFAULT_PERIOD: QuarterRange = { startQ: 1, startYear: 2026, endQ: 4, endYear: 2026 };
  const currentPeriod = periodFilter ?? DEFAULT_PERIOD;
  const hasActiveFilters = statusFilter.size > 0 || locationFilter.size > 0 || aaFilter.size > 0 || periodFilter !== null;

  return createPortal(
    <>
      {/* Backdrop */}
      <Box
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 200,
          opacity: visible ? 1 : 0,
          transition: "opacity 300ms ease-in-out",
        }}
        onClick={onClose}
      />
      {/* Sheet */}
      <Box
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 201,
          background: "white",
          borderRadius: "20px 20px 0 0",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 300ms ease-in-out",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -4px 40px rgba(0,0,0,0.12)",
        }}
      >
        {/* Handle bar */}
        <Flex justify="center" pt="3" pb="1" style={{ flexShrink: 0 }}>
          <Box style={{ width: 36, height: 4, borderRadius: 9999, background: "var(--gray-5)" }} />
        </Flex>

        {/* Header row */}
        <Flex align="center" justify="between" px="4" py="2" style={{ flexShrink: 0 }}>
          <Text size="3" weight="bold">Filters</Text>
          <IconButton variant="ghost" color="gray" size="2" onClick={onClose} aria-label="Close filters">
            <Cross2Icon />
          </IconButton>
        </Flex>

        {/* Scrollable filter sections */}
        <ScrollArea style={{ flex: 1 }}>
          <Flex direction="column" gap="5" px="4" pb="4">

            {/* Pillar */}
            <Flex direction="column" gap="2">
              <Text size="1" weight="medium" color="gray" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Pillar</Text>
              <Button variant="soft" color="blue" size="1" radius="full" disabled style={{ opacity: 1, cursor: "default", width: "fit-content" }}>
                Enterprise Engineering
              </Button>
            </Flex>

            {/* Evaluation period */}
            <Flex direction="column" gap="2">
              <Flex align="center" justify="between">
                <Text size="1" weight="medium" color="gray" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Evaluation period</Text>
                {periodFilter !== null && (
                  <Button variant="ghost" color="gray" size="1" radius="full" onClick={() => setPeriodFilter(null)}>
                    Clear
                  </Button>
                )}
              </Flex>
              <Flex gap="3">
                <Flex direction="column" gap="1" style={{ flex: 1 }}>
                  <Text size="1" color="gray">Start</Text>
                  <Flex gap="1">
                    <Select.Root size="1" value={String(currentPeriod.startQ)} onValueChange={(v) => setPeriodFilter({ ...currentPeriod, startQ: Number(v) })}>
                      <Select.Trigger style={{ flex: 1 }} />
                      <Select.Content>
                        {[1,2,3,4].map(q => <Select.Item key={q} value={String(q)}>Q{q}</Select.Item>)}
                      </Select.Content>
                    </Select.Root>
                    <Select.Root size="1" value={String(currentPeriod.startYear)} onValueChange={(v) => setPeriodFilter({ ...currentPeriod, startYear: Number(v) })}>
                      <Select.Trigger style={{ flex: 1 }} />
                      <Select.Content>
                        {YEARS.map(y => <Select.Item key={y} value={String(y)}>{y}</Select.Item>)}
                      </Select.Content>
                    </Select.Root>
                  </Flex>
                </Flex>
                <Flex direction="column" gap="1" style={{ flex: 1 }}>
                  <Text size="1" color="gray">End</Text>
                  <Flex gap="1">
                    <Select.Root size="1" value={String(currentPeriod.endQ)} onValueChange={(v) => setPeriodFilter({ ...currentPeriod, endQ: Number(v) })}>
                      <Select.Trigger style={{ flex: 1 }} />
                      <Select.Content>
                        {[1,2,3,4].map(q => <Select.Item key={q} value={String(q)}>Q{q}</Select.Item>)}
                      </Select.Content>
                    </Select.Root>
                    <Select.Root size="1" value={String(currentPeriod.endYear)} onValueChange={(v) => setPeriodFilter({ ...currentPeriod, endYear: Number(v) })}>
                      <Select.Trigger style={{ flex: 1 }} />
                      <Select.Content>
                        {YEARS.map(y => <Select.Item key={y} value={String(y)}>{y}</Select.Item>)}
                      </Select.Content>
                    </Select.Root>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>

            {/* Status */}
            <Flex direction="column" gap="2">
              <Text size="1" weight="medium" color="gray" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</Text>
              <Select.Root
                size="2"
                value={statusFilter.size === 1 ? Array.from(statusFilter)[0] as string : "all"}
                onValueChange={(v) => v === "all" ? setStatusFilter(new Set()) : setStatusFilter(new Set([v as PlanStatus]))}
              >
                <Select.Trigger style={{ width: "100%" }} />
                <Select.Content>
                  <Select.Item value="all">All statuses</Select.Item>
                  {STATUS_OPTIONS.map(s => (
                    <Select.Item key={s} value={s}>{s}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* Location */}
            <Flex direction="column" gap="2">
              <Text size="1" weight="medium" color="gray" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Location</Text>
              <Select.Root
                size="2"
                value={locationFilter.size === 1 ? Array.from(locationFilter)[0] as string : "all"}
                onValueChange={(v) => v === "all" ? setLocationFilter(new Set()) : setLocationFilter(new Set([v as WorkLocation]))}
              >
                <Select.Trigger style={{ width: "100%" }} />
                <Select.Content>
                  <Select.Item value="all">All locations</Select.Item>
                  {availableLocations.map(loc => (
                    <Select.Item key={loc} value={loc}>{loc}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>

            {/* Allocation area */}
            <Flex direction="column" gap="2">
              <Text size="1" weight="medium" color="gray" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>Allocation area</Text>
              <Select.Root
                size="2"
                value={aaFilter.size === 1 ? Array.from(aaFilter)[0] as string : "all"}
                onValueChange={(v) => v === "all" ? setAAFilter(new Set()) : setAAFilter(new Set([v as AllocationArea]))}
              >
                <Select.Trigger style={{ width: "100%" }} />
                <Select.Content>
                  <Select.Item value="all">All areas</Select.Item>
                  {availableAAs.map(aa => (
                    <Select.Item key={aa} value={aa}>{aa}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>

          </Flex>
        </ScrollArea>

        {/* Footer */}
        <Box
          px="4"
          py="3"
          style={{
            borderTop: "0.5px solid var(--gray-4)",
            flexShrink: 0,
            paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
          }}
        >
          <Flex gap="2" justify="between">
            <Button
              variant="ghost"
              color="gray"
              size="2"
              radius="full"
              disabled={!hasActiveFilters}
              onClick={() => {
                setStatusFilter(new Set());
                setLocationFilter(new Set());
                setAAFilter(new Set());
                setPeriodFilter(null);
              }}
            >
              Clear all
            </Button>
            <Button size="2" variant="solid" radius="full" onClick={onClose}>
              Done
            </Button>
          </Flex>
        </Box>
      </Box>
    </>,
    document.body
  );
}

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

function PlanCard({ plan, view }: { plan: Plan; view: "location" | "aa" }) {
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
              <Heading as="h3" size="3">{view === "aa" ? plan.workLocation : plan.allocationArea}</Heading>
              <StatusBadge status={plan.status} />
            </Flex>
            <Text size="1" color="gray">
              Evaluated from Q2&apos;25 to Q3&apos;25
            </Text>
          </Flex>

          <Separator size="4" />

          <Grid columns="2" gap="2">
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">Employees</Text>
              <Text as="div" className="data-viz-sm">{employees}</Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">Workspaces</Text>
              <Text as="div" className="data-viz-sm">{totalWorkspaces}</Text>
            </Flex>
          </Grid>
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
  const [hoveredWsSegment, setHoveredWsSegment] = useState<{ group: string; value: number; color: string; rect: DOMRect } | null>(null);
  const empBarRefs = useRef<Map<string, HTMLElement>>(new Map());
  const wsBarRefs = useRef<Map<string, HTMLElement>>(new Map());

  const empPalette = hexPalette(plans.length, "#2657E8", "#AFC8FF");
  const employeeBarData = plans.map((p, i) => ({
    group: view === "location" ? p.allocationArea : p.workLocation,
    value: totalHeadcount(p),
    color: empPalette[i],
  }));

  const wsPalette = hexPalette(3, "#6421CA", "#D4ABFF");
  const workspaceBarData = [
    { group: "Assigned", value: totalAssigned, color: wsPalette[0] },
    { group: "Available", value: totalAvailable, color: wsPalette[1] },
    { group: "Coworking", value: totalCoworking, color: wsPalette[2] },
  ];

  return (
    <Box style={{ ...GLASS_CARD_STYLE, position: "relative" }}>
      {/* Card header — title + metadata only */}
      <Box px="5" pt="5" style={{ paddingBottom: 16 }}>
        <Flex align="baseline" gap="3">
          <Heading as="h2" size="4" style={{ color: "var(--slate-12)" }}>{title}</Heading>
          <Badge color="gray" variant="soft" radius="full">
            {plans.length} {plans.length === 1 ? "plan" : "plans"}
          </Badge>
        </Flex>
      </Box>

      {/* Data viz: employee + workspace bars */}
      <Box px="5" pb="0">
        <Flex direction={{ initial: "column", sm: "row" }} gap={{ initial: "4", sm: "5" }} align={{ initial: "stretch", sm: "start" }}>
          {/* Left column: employees */}
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Flex align="baseline" gap="2">
              <Text as="div" className="data-viz-lg">
                {totalEmployees.toLocaleString()}
              </Text>
              <Text as="div" size="1" color="gray" style={{ lineHeight: 1 }}>Employees</Text>
            </Flex>
            <Box mt="3">
              <Flex style={{ width: "100%", height: 8, gap: 2 }}>
                {employeeBarData.map((d, i) => {
                  const isOnly = employeeBarData.length === 1;
                  const isFirst = i === 0;
                  const isLast = i === employeeBarData.length - 1;
                  const borderRadius = isOnly ? 9999 : isFirst ? "9999px 0 0 9999px" : isLast ? "0 9999px 9999px 0" : 0;
                  return (
                  <Box
                    key={d.group}
                    ref={(el) => { if (el) empBarRefs.current.set(d.group, el as HTMLElement); else empBarRefs.current.delete(d.group); }}
                    style={{ flex: d.value, height: 8 }}
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
                        opacity: hoveredSegment !== null && hoveredSegment.group !== d.group ? 0.35 : 1,
                        transition: "opacity 120ms ease",
                        cursor: "default",
                      }}
                    />
                  </Box>
                  );
                })}
              </Flex>
              <Flex mt="2" style={{ gap: 2, flexWrap: "wrap" }}>
                {employeeBarData.map((d) => (
                  <Flex
                    key={d.group}
                    align="center"
                    gap="1"
                    style={{
                      padding: "2px 6px 2px 4px",
                      borderRadius: 9999,
                      cursor: "default",
                      opacity: hoveredSegment !== null && hoveredSegment.group !== d.group ? 0.35 : 1,
                      background: hoveredSegment?.group === d.group ? "var(--gray-a3)" : "transparent",
                      transition: "opacity 120ms ease, background 120ms ease",
                    }}
                    onMouseEnter={() => {
                      const el = empBarRefs.current.get(d.group);
                      if (el) setHoveredSegment({ group: d.group, value: d.value, color: d.color, rect: el.getBoundingClientRect() });
                    }}
                    onMouseLeave={() => setHoveredSegment(null)}
                  >
                    <Box style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                    <Text size="1" color="gray">{d.group}</Text>
                  </Flex>
                ))}
              </Flex>
            </Box>
          </Box>

          {/* Right column: workspaces */}
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Flex align="baseline" gap="2">
              <Text as="div" className="data-viz-lg">
                {totalWorkspaces.toLocaleString()}
              </Text>
              <Text as="div" size="1" color="gray" style={{ lineHeight: 1 }}>Workspaces</Text>
            </Flex>
            <Box mt="3">
              <Flex style={{ width: "100%", height: 8, gap: 2 }}>
                {workspaceBarData.map((d, i) => {
                  const isOnly = workspaceBarData.length === 1;
                  const isFirst = i === 0;
                  const isLast = i === workspaceBarData.length - 1;
                  const borderRadius = isOnly ? 9999 : isFirst ? "9999px 0 0 9999px" : isLast ? "0 9999px 9999px 0" : 0;
                  return (
                  <Box
                    key={d.group}
                    ref={(el) => { if (el) wsBarRefs.current.set(d.group, el as HTMLElement); else wsBarRefs.current.delete(d.group); }}
                    style={{ flex: d.value, height: 8 }}
                    onMouseEnter={(e) => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setHoveredWsSegment({ group: d.group, value: d.value, color: d.color, rect });
                    }}
                    onMouseLeave={() => setHoveredWsSegment(null)}
                  >
                    <Box
                      style={{
                        width: "100%",
                        height: "100%",
                        background: d.color,
                        borderRadius,
                        opacity: hoveredWsSegment !== null && hoveredWsSegment.group !== d.group ? 0.35 : 1,
                        transition: "opacity 120ms ease",
                        cursor: "default",
                      }}
                    />
                  </Box>
                  );
                })}
              </Flex>
              <Flex mt="2" style={{ gap: 2 }}>
                {workspaceBarData.map((d) => (
                  <Flex
                    key={d.group}
                    align="center"
                    gap="1"
                    style={{
                      padding: "2px 6px 2px 4px",
                      borderRadius: 9999,
                      cursor: "default",
                      opacity: hoveredWsSegment !== null && hoveredWsSegment.group !== d.group ? 0.35 : 1,
                      background: hoveredWsSegment?.group === d.group ? "var(--gray-a3)" : "transparent",
                      transition: "opacity 120ms ease, background 120ms ease",
                    }}
                    onMouseEnter={() => {
                      const el = wsBarRefs.current.get(d.group);
                      if (el) setHoveredWsSegment({ group: d.group, value: d.value, color: d.color, rect: el.getBoundingClientRect() });
                    }}
                    onMouseLeave={() => setHoveredWsSegment(null)}
                  >
                    <Box style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                    <Text size="1" color="gray">{d.group}</Text>
                  </Flex>
                ))}
              </Flex>
            </Box>
          </Box>
        </Flex>
      </Box>

      {/* Plan cards grid */}
      <Box p="5">
        <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="3">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} view={view} />
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
      {hoveredWsSegment && createPortal(
        <Box
          style={{
            position: "fixed",
            top: hoveredWsSegment.rect.top - 10,
            left: hoveredWsSegment.rect.left + hoveredWsSegment.rect.width / 2,
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
            <Box style={{ width: 8, height: 8, borderRadius: 2, background: hoveredWsSegment.color, flexShrink: 0 }} />
            <Text size="1" color="gray">{hoveredWsSegment.group}</Text>
          </Flex>
          <Text as="div" size="4" weight="medium">{hoveredWsSegment.value.toLocaleString()}</Text>
          <Text as="div" size="1" color="gray">workspaces</Text>
        </Box>,
        document.body
      )}
    </Box>
  );
}

export default function LandingPage() {
  const bannerLottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => { bannerLottieRef.current?.setSpeed(0.4); }, []);

  const [bannerVisible, setBannerVisible] = useState(true);
  const [bannerExpanded, setBannerExpanded] = useState(false);

  const [view, setView] = useState<"location" | "aa">("location");
  const [agentOpen, setAgentOpen] = useState(false);

  // Open the agent panel by default on desktop only
  useEffect(() => {
    if (window.innerWidth >= 768) setAgentOpen(true);
  }, []);

  // ── Toggle indicator ──────────────────────────────────────────────────────
  // Drives the ::before sliding pill in .view-toggle-root via CSS custom props.
  const toggleInitialized = useRef(false);
  const toggleAnimTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const root = document.querySelector('.view-toggle-root') as HTMLElement | null;
    if (!root) return;

    const rafId = requestAnimationFrame(() => {
      const active = root.querySelector<HTMLElement>('[data-state="on"]');
      if (!active) return;

      const rr = root.getBoundingClientRect();
      const ar = active.getBoundingClientRect();
      root.style.setProperty('--ind-left', `${ar.left - rr.left}px`);
      root.style.setProperty('--ind-top', `${ar.top - rr.top}px`);
      root.style.setProperty('--ind-width', `${ar.width}px`);
      root.style.setProperty('--ind-height', `${ar.height}px`);

      if (!toggleInitialized.current) {
        // First paint: place without transition, then unlock transitions
        toggleInitialized.current = true;
        requestAnimationFrame(() => root.setAttribute('data-initialized', 'true'));
      } else {
        // Subsequent changes: set direction then restart the velocity-tail animation
        root.setAttribute('data-direction', view === 'aa' ? 'right' : 'left');
        root.removeAttribute('data-animating');
        requestAnimationFrame(() => {
          root.setAttribute('data-animating', 'true');
          if (toggleAnimTimer.current) clearTimeout(toggleAnimTimer.current);
          toggleAnimTimer.current = setTimeout(() => {
            root.removeAttribute('data-animating');
            toggleAnimTimer.current = null;
          }, 340);
        });
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [view]);

  // ── Agent panel ────────────────────────────────────────────────────────────
  // Drives the CSS transition: false = scale(0.7)/opacity 0.8, true = scale(1)/opacity 1.
  // Starts false so the panel always mounts at the small state and transitions in.
  const [agentPanelVisible, setAgentPanelVisible] = useState(false);
  const agentCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // After the panel mounts, wait one rAF so the browser has painted the
  // initial (scaled-down) frame, then flip to visible to start the transition.
  useEffect(() => {
    if (agentOpen) {
      const id = requestAnimationFrame(() => setAgentPanelVisible(true));
      return () => cancelAnimationFrame(id);
    }
  }, [agentOpen]);

  function openAgent() {
    if (agentCloseTimer.current) clearTimeout(agentCloseTimer.current);
    agentCloseTimer.current = null;
    setAgentOpen(true);   // mount; agentPanelVisible is still false → starts scaled down
  }

  function closeAgent() {
    setAgentPanelVisible(false);                      // start exit transition
    agentCloseTimer.current = setTimeout(() => {
      setAgentOpen(false);                            // unmount after transition
      agentCloseTimer.current = null;
    }, 310);                                          // 10ms grace past the 300ms transition
  }

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [agentInput, setAgentInput] = useState("");
  const [agentMessages, setAgentMessages] = useState<{ role: "user" | "agent"; content: string }[]>([]);
  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([...PLANS]);
  const [statusFilter, setStatusFilter] = useState<Set<PlanStatus>>(new Set());
  const [locationFilter, setLocationFilter] = useState<Set<WorkLocation>>(new Set());
  const [aaFilter, setAAFilter] = useState<Set<AllocationArea>>(new Set());
  const [periodFilter, setPeriodFilter] = useState<QuarterRange | null>(null);
  const hasActiveFilters = statusFilter.size > 0 || locationFilter.size > 0 || aaFilter.size > 0 || periodFilter !== null;

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

  const filteredPlans = plans.filter(p =>
    (statusFilter.size === 0 || statusFilter.has(p.status)) &&
    (locationFilter.size === 0 || locationFilter.has(p.workLocation)) &&
    (aaFilter.size === 0 || aaFilter.has(p.allocationArea))
  );
  const byLocation = getPlansByLocation(filteredPlans);
  const byAA = getPlansByAA(filteredPlans);
  const allByLocation = getPlansByLocation(plans);
  const allByAA = getPlansByAA(plans);
  const availableLocations = locationOrder.filter(loc => allByLocation.has(loc));
  const availableAAs = aaOrder.filter(aa => allByAA.has(aa));

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
          px={{ initial: "4", sm: "6" }}
          py="3"
          style={{ position: "relative", zIndex: 1 }}
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="20" height="20" color="white">
                <path fill="currentColor" d="M6.75 13.25a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm12.8.25c.206 0 .375 0 .512.01.141.012.27.038.392.1.188.095.34.248.437.436.061.121.087.251.098.392.011.137.011.306.011.512v4.6c0 .206 0 .375-.01.512-.012.141-.038.27-.1.392a.999.999 0 0 1-.436.437 1.027 1.027 0 0 1-.392.098c-.137.011-.306.011-.512.011h-4.6c-.205 0-.375 0-.512-.01a1.027 1.027 0 0 1-.392-.1.999.999 0 0 1-.437-.436 1.027 1.027 0 0 1-.098-.392c-.011-.137-.011-.306-.011-.512v-4.6c0-.205 0-.375.01-.512.012-.141.038-.27.1-.392a.999.999 0 0 1 .436-.437c.121-.061.251-.087.392-.098.137-.011.306-.011.512-.011h4.6Zm-2.3-10.75a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-7.918.251c.085.001.162.004.23.01.141.011.27.037.392.098.188.096.34.249.437.437.061.121.087.251.098.392.011.137.011.307.011.512v4.6c0 .205 0 .375-.01.512-.012.141-.038.27-.1.392a.999.999 0 0 1-.436.437 1.027 1.027 0 0 1-.392.098c-.137.011-.307.011-.512.011h-4.6c-.205 0-.375 0-.513-.01a1.027 1.027 0 0 1-.391-.1.999.999 0 0 1-.437-.436 1.026 1.026 0 0 1-.098-.392 3.588 3.588 0 0 1-.01-.23L3 9.05v-4.6c0-.205 0-.375.01-.513.012-.14.038-.27.1-.391a1 1 0 0 1 .436-.437c.121-.061.251-.087.392-.098C4.075 3 4.245 3 4.45 3h4.6l.282.001Z"/>
              </svg>
            </Box>
            <Heading size={{ initial: "4", sm: "5" }} style={{ whiteSpace: "nowrap" }}>Org Space Manager</Heading>
          </Flex>
          <Flex align="center" gap="2">
            <Tooltip content="Open Campus assistant">
            <IconButton
              variant="solid"
              size="2"
              onClick={() => agentOpen ? closeAgent() : openAgent()}
              aria-label="Toggle assistant"
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
            <Button size="2" className="btn-green" style={{ background: "var(--btn-green-bg)", color: "white" }} onClick={() => setNewPlanOpen(true)}>
              + New plan
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Body */}
      <Box style={{ flex: 1, overflow: "hidden", borderRadius: 24, position: "relative", zIndex: 1, background: "#F0F0F3" }}>
        <BlobCanvas />
          {/* Scrollable content — right edge retracts to make room for the panel */}
          <Box className="scrollable-content" style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: agentPanelVisible ? 376 : 0, overflowY: "auto", transition: "right 300ms ease-in-out" }}>
        <Box
          px={{ initial: "4", sm: "6" }}
          py={{ initial: "4", sm: "6" }}
          style={{
            maxWidth: 1400,
            margin: "0 auto",
          }}
        >
          <Flex direction="column" gap="5">
            {/* Planning season banner */}
            {bannerVisible && (
            <Box style={{ position: "relative", borderRadius: 20 }}>
              {/* Purple header section — sits on top (z-index 2) so white body slides out from beneath */}
              <Box
                className="banner-purple-header"
                data-expanded={bannerExpanded ? "true" : undefined}
                style={{
                  position: "relative",
                  background: "#7336A5",
                  overflow: "hidden",
                  borderRadius: bannerExpanded ? "20px 20px 0 0" : 20,
                  zIndex: 2,
                  minHeight: 169,
                  transition: "border-radius 350ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 350ms ease",
                }}
              >
                {/* Icon container — desktop: original specs; mobile: overridden via CSS */}
                <Box className="banner-icon-container" style={{
                  position: "absolute",
                  left: -100,
                  top: -23,
                  width: 243.64,
                  height: 248.38,
                  background: "white",
                  borderRadius: 40,
                  transform: "rotate(25.06deg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
                }}>
                  <Lottie
                    lottieRef={bannerLottieRef}
                    animationData={calendarAnimation}
                    loop
                    className="banner-lottie-icon"
                    style={{
                      width: "100%",
                      height: "100%",
                      transform: "rotate(-25.06deg) scale(0.515) translateX(45%) translateY(-15%)",
                    }}
                  />
                </Box>

                {/* Top-right: close button only */}
                <Box style={{ position: "absolute", top: 14, right: 14, zIndex: 2 }}>
                  <IconButton
                    variant="ghost"
                    size="1"
                    aria-label="Dismiss banner"
                    className="btn-banner-close"
                    onClick={(e) => { e.stopPropagation(); setBannerVisible(false); }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </IconButton>
                </Box>

                {/* Content — desktop: matches original left:197 text start; mobile: CSS overrides */}
                <Flex
                  direction="column"
                  className="banner-header-content"
                  style={{ paddingLeft: 197, paddingRight: 40, paddingTop: 14, paddingBottom: 18 }}
                >
                  {/* Title — nowrap so it never breaks to a second line */}
                  <Text
                    size="3"
                    weight="bold"
                    style={{ color: "white", fontFamily: "var(--font-heading)", display: "block", whiteSpace: "nowrap" }}
                  >
                    Planning season started.
                  </Text>

                  {/* "See more" — mobile only, shown when collapsed */}
                  {!bannerExpanded && (
                    <Box className="banner-see-more" style={{ marginTop: 4 }}>
                      <Text
                        size="1"
                        onClick={() => setBannerExpanded(true)}
                        style={{
                          color: "rgba(255,255,255,0.72)",
                          cursor: "pointer",
                          textDecorationLine: "underline",
                          textDecorationColor: "rgba(255,255,255,0.35)",
                          textUnderlineOffset: "2px",
                        }}
                      >
                        See more
                      </Text>
                    </Box>
                  )}

                  {/* Description inside purple section — desktop only (CSS shows it) */}
                  <Box className="banner-body">
                    <Flex direction="column" style={{ gap: 4, marginTop: 8 }}>
                      <Text size="1" style={{ color: "white", lineHeight: 1.55 }}>
                        Review all the desk policy plans and work with your planner to determine desk assignment for your org. All decisions must be submitted for approvals by June 20th to ensure employees&apos; productivity and space utilization.
                      </Text>
                    </Flex>
                    <Box mt="3">
                      <Button size="1" variant="solid" className="btn-banner-learn-more">
                        Learn more
                      </Button>
                    </Box>
                  </Box>
                </Flex>
              </Box>

              {/* White expanded section — slides out from beneath the purple header */}
              <Box
                className="banner-white-body"
                style={{
                  overflow: "hidden",
                  maxHeight: bannerExpanded ? 300 : 0,
                  transition: "max-height 350ms cubic-bezier(0.4, 0, 0.2, 1)",
                  borderRadius: "0 0 20px 20px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box style={{
                  background: "white",
                  padding: "16px",
                  transform: bannerExpanded ? "translateY(0)" : "translateY(-16px)",
                  opacity: bannerExpanded ? 1 : 0,
                  transition: "transform 350ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms ease",
                }}>
                  <Flex direction="column" gap="3">
                    <Text size="1" style={{ lineHeight: 1.55 }}>
                      Review all the desk policy plans and work with your planner to determine desk assignment for your org. All decisions must be submitted for approvals by June 20th to ensure employees&apos; productivity and space utilization.
                    </Text>
                    <Box>
                      <Button size="1" variant="solid" style={{ background: "#7336A5", color: "white" }}>
                        Learn more
                      </Button>
                    </Box>
                    {/* See less — full-bleed across expanded section bottom */}
                    <Box style={{ margin: "4px -16px -16px", borderTop: "1px solid rgba(115, 54, 165, 0.12)" }}>
                      <button
                        onClick={() => setBannerExpanded(false)}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "10px 16px",
                          background: "none",
                          border: "none",
                          color: "#7336A5",
                          fontSize: "var(--font-size-1)",
                          fontFamily: "var(--font-body), system-ui, sans-serif",
                          fontWeight: 500,
                          cursor: "pointer",
                          textAlign: "center",
                        }}
                      >
                        See less
                      </button>
                    </Box>
                  </Flex>
                </Box>
              </Box>
            </Box>
            )}
            {/* Header card */}
            <Box style={GLASS_CARD_STYLE}>
              {/* Title + toggle row — stacks vertically on mobile */}
              <Flex
                direction={{ initial: "column", sm: "row" }}
                align={{ initial: "start", sm: "center" }}
                justify="between"
                gap={{ initial: "3", sm: "4" }}
                px="5"
                pt="5"
                pb="4"
              >
                <Flex direction="column" gap="1">
                  <Heading size="4">Desk policy plans</Heading>
                  <Text size="2" color="gray">
                    Review the current space utilization and set desk policy for your org.
                  </Text>
                </Flex>
                <Flex align="center" gap="4">
                  <ToggleGroup.Root
                    type="single"
                    value={view}
                    onValueChange={(v) => v && setView(v as "location" | "aa")}
                    className="view-toggle-root"
                  >
                    <ToggleGroup.Item value="location" className="view-toggle-item">
                      <span className="seg-icon-wrap">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="currentColor" fillRule="evenodd" d="M3.75 3.5A2.25 2.25 0 0 1 6 1.25h6.5a2.25 2.25 0 0 1 2.25 2.25V6H18a2.25 2.25 0 0 1 2.25 2.25v13H22a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1 0-1.5h1.75V3.5Zm11 17.75h4V18h-4v3.25Zm0-4.75h4v-3.75h-4v3.75Zm0-5.25h4v-3A.75.75 0 0 0 18 7.5h-3.25v3.75Zm-4.5 6.725a1 1 0 1 0-2 0v.05a1 1 0 1 0 2 0v-.05Zm-1-5a1 1 0 0 1 1 1v.05a1 1 0 1 1-2 0v-.05a1 1 0 0 1 1-1Zm1-3a1 1 0 1 0-2 0v.05a1 1 0 1 0 2 0v-.05Zm-1-5a1 1 0 0 1 1 1v.05a1 1 0 0 1-2 0v-.05a1 1 0 0 1 1-1Z" clipRule="evenodd" />
                        </svg>
                      </span>
                      Work location
                    </ToggleGroup.Item>
                    <ToggleGroup.Item value="aa" className="view-toggle-item">
                      <span className="seg-icon-wrap">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="currentColor" d="M8.25 7a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM11.925 13.25c-.526 0-1.05.083-1.55.246l-.08.026A4.685 4.685 0 0 0 7.24 16.69l-.105.366c-.09.315-.135.64-.135.969v.204c0 1.117.905 2.022 2.021 2.022h5.957A2.022 2.022 0 0 0 17 18.228v-.204a3.53 3.53 0 0 0-.136-.97l-.105-.365a4.684 4.684 0 0 0-3.054-3.167l-.082-.026a5.008 5.008 0 0 0-1.548-.246h-.15ZM15.902 10.512A5.23 5.23 0 0 0 17.25 7c0-.511-.073-1.005-.21-1.473a3.385 3.385 0 1 1-1.138 4.985ZM17.862 20.25c.402-.572.638-1.27.638-2.022v-.204c0-.468-.066-.932-.194-1.382l-.104-.365a6.184 6.184 0 0 0-.892-1.864 5.756 5.756 0 0 1 1.362-.163h.156c.48 0 .957.06 1.421.178l.384.098a3.845 3.845 0 0 1 2.717 2.564l.047.149c.068.214.103.438.103.662v.31a2.04 2.04 0 0 1-2.04 2.039h-3.598ZM2.54 20.25h3.597a3.506 3.506 0 0 1-.637-2.022v-.204c0-.468.065-.932.193-1.382l.104-.365a6.183 6.183 0 0 1 .892-1.864 5.762 5.762 0 0 0-1.36-.163h-.157c-.48 0-.957.06-1.421.178l-.384.098A3.847 3.847 0 0 0 .65 17.09l-.047.149a2.188 2.188 0 0 0-.103.662v.31a2.04 2.04 0 0 0 2.04 2.039ZM5.365 11.899a3.38 3.38 0 0 0 2.732-1.387A5.23 5.23 0 0 1 6.75 7c0-.511.073-1.005.21-1.473A3.385 3.385 0 1 0 5.365 11.9Z" />
                        </svg>
                      </span>
                      Allocation area
                    </ToggleGroup.Item>
                  </ToggleGroup.Root>
                  {/* Filter button — mobile only, hidden on desktop via CSS */}
                  <Tooltip content="Filters">
                    <IconButton
                      variant="soft"
                      color={hasActiveFilters ? "blue" : "gray"}
                      size="2"
                      radius="full"
                      className="filter-btn-mobile"
                      aria-label="Open filters"
                      onClick={() => setFilterSheetOpen(true)}
                    >
                      <MixerHorizontalIcon />
                    </IconButton>
                  </Tooltip>
                </Flex>
              </Flex>

              {/* Filter toolbar — desktop only, hidden on mobile via CSS */}
              <Box className="filter-bar" style={{ margin: "0 8px 8px", background: "white", borderRadius: 9999, padding: "6px 12px" }}>
                <Flex gap="2" align="center">
                  <PillarPill />
                  <QuarterRangePill value={periodFilter} onChange={setPeriodFilter} />
                  <FilterPill
                    label="Status"
                    options={["Plan draft", "Policy draft", "Submitted", "Approved", "Live"]}
                    selected={statusFilter as Set<string>}
                    onToggle={(v) => setStatusFilter(prev => toggleSet(prev, v as PlanStatus))}
                  />
                  <FilterPill
                    label="Location"
                    options={availableLocations}
                    selected={locationFilter as Set<string>}
                    onToggle={(v) => setLocationFilter(prev => toggleSet(prev, v as WorkLocation))}
                  />
                  <FilterPill
                    label="Allocation area"
                    options={availableAAs}
                    selected={aaFilter as Set<string>}
                    onToggle={(v) => setAAFilter(prev => toggleSet(prev, v as AllocationArea))}
                  />
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      color="gray"
                      size="1"
                      radius="full"
                      style={{ marginLeft: 0 }}
                      onClick={() => {
                        setStatusFilter(new Set());
                        setLocationFilter(new Set());
                        setAAFilter(new Set());
                        setPeriodFilter(null);
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </Flex>
              </Box>
            </Box>

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
                background: "rgba(255, 255, 255, 0.72)",
                backdropFilter: "blur(28px) saturate(1.8) brightness(1.04)",
                WebkitBackdropFilter: "blur(28px) saturate(1.8) brightness(1.04)",
                border: "0.5px solid rgba(255, 255, 255, 0.75)",
                borderRadius: 20,
                boxShadow: "0 2px 23px rgba(0,0,0,0.054), inset 0 1px 0 rgba(255,255,255,0.9)",
                overflow: "hidden",
                transform: agentPanelVisible ? "translateX(0)" : "translateX(calc(100% + 8px))",
                opacity: agentPanelVisible ? 1 : 0,
                transition: "transform 300ms ease-in-out, opacity 300ms ease-in-out",
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
                      <stop offset="0%" stopColor="#2657E8" />
                      <stop offset="100%" stopColor="#CF3897" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#panelIconGrad)" d="M12.565 2.262c.799.033 1.579.136 2.332.301l-.112.222-2.44 1.232a2.222 2.222 0 0 0 0 3.966l2.44 1.23 1.232 2.441a2.222 2.222 0 0 0 3.966 0l1.23-2.44 1.432-.723c.39.937.605 1.947.605 3.009 0 5.249-5.193 9.25-11.25 9.25-.863 0-1.704-.08-2.512-.231-.014-.003-.02 0-.018 0l-4.756 2.828a1.09 1.09 0 0 1-1.629-1.13l.783-4.309-.002-.004a.066.066 0 0 0-.018-.025C1.952 16.24.75 14 .75 11.5.75 6.251 5.943 2.25 12 2.25l.565.012ZM7.75 10.475a1 1 0 0 0-1 1v.05a1 1 0 1 0 2 0v-.05a1 1 0 0 0-1-1Zm4.25 0a1 1 0 0 0-1 1v.05a1 1 0 1 0 2 0v-.05a1 1 0 0 0-1-1Zm6-9.912c.259 0 .498.127.644.335l.056.095 1.368 2.712c.035.07.054.105.069.13.011.022.011.02.005.012a.067.067 0 0 0 .011.011c-.008-.006-.01-.007.011.005.026.015.061.034.13.069L23.008 5.3a.784.784 0 0 1 0 1.4l-2.712 1.368c-.07.035-.105.054-.13.069-.022.012-.02.011-.012.005a.067.067 0 0 0-.011.011c.006-.008.006-.01-.005.011a3.784 3.784 0 0 0-.069.13L18.7 11.008a.784.784 0 0 1-1.4 0l-1.368-2.712-.069-.13c-.011-.022-.011-.02-.005-.012a.067.067 0 0 0-.011-.011c.008.006.01.007-.011-.005a3.781 3.781 0 0 0-.13-.069L12.992 6.7a.784.784 0 0 1 0-1.4l2.712-1.368c.07-.035.105-.054.13-.069.022-.012.02-.011.012-.005a.067.067 0 0 0 .011-.011c-.006.008-.007.01.005-.011.015-.026.034-.061.069-.13L17.3.992l.056-.095A.784.784 0 0 1 18 .562Z" />
                </svg>
                <Flex direction="column">
                  <Text size="2" weight="bold">Assistant</Text>
                  <Text size="1" color="gray">Ask questions across all plans</Text>
                </Flex>
              </Flex>
              <IconButton variant="ghost" color="gray" size="2" onClick={() => closeAgent()}>
                <Cross2Icon />
              </IconButton>
            </Flex>

            <Box style={{ flex: 1, display: "flex", flexDirection: "column", background: "white", borderRadius: "16px 16px 20px 20px", overflow: "hidden", minHeight: 0, margin: "0 4px 4px" }}>
            <ScrollArea style={{ flex: 1 }}>
              <Flex direction="column" gap="3" p="4">
                <Flex direction="column" align="center" gap="2" py="6">
                  <Text size="5" weight="bold" style={{ fontFamily: "var(--font-heading)" }}>
                    <span style={{
                      background: "linear-gradient(135deg, #2657E8, #CF3897)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>
                      Hi, I&apos;m your Campus assistant!
                    </span>
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

            <Box px="4" py="3" style={{ borderTop: "0.5px solid rgba(0,0,0,0.1)", flexShrink: 0, borderRadius: "0 0 20px 20px" }}>
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
      </Box>

      <FilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        aaFilter={aaFilter}
        setAAFilter={setAAFilter}
        periodFilter={periodFilter}
        setPeriodFilter={setPeriodFilter}
        availableLocations={availableLocations}
        availableAAs={availableAAs}
      />
      <NewPlanModal
        open={newPlanOpen}
        onOpenChange={setNewPlanOpen}
        existingPlans={plans}
        onCreate={handleCreatePlan}
      />
    </Box>
  );
}
