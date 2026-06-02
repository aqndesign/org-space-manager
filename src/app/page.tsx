"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
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
import { ChevronDownIcon, ChevronLeftIcon, CheckCircledIcon, Cross2Icon, MagicWandIcon, MinusIcon, PlusIcon, MixerHorizontalIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { addPlan, getPlansByAA, getPlansByLocation, PLANS } from "@/lib/mock-data";
import { BlobCanvas } from "@/components/BlobCanvas";
import { NewPlanModal } from "@/components/NewPlanModal";
import { Plan, PlanStatus, WorkLocation, AllocationArea } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

const SECONDARY_BTN_STYLE: React.CSSProperties = {
  color: "var(--slate-12)",
};

const GLASS_CARD_STYLE: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.72)",
  backdropFilter: "blur(28px) saturate(1.8) brightness(1.04)",
  WebkitBackdropFilter: "blur(28px) saturate(1.8) brightness(1.04)",
  borderTop: "0.5px solid rgba(255,255,255,0.88)",
  borderLeft: "0.5px solid rgba(255,255,255,0.72)",
  borderRight: "0.5px solid rgba(255,255,255,0.42)",
  borderBottom: "0.5px solid rgba(255,255,255,0.32)",
  borderRadius: 20,
  overflow: "hidden",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.92)",
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
  onShowRecommendations,
}: {
  title: string;
  plans: Plan[];
  view: "location" | "aa";
  onShowRecommendations?: () => void;
}) {
  const totalEmployees = plans.reduce((s, p) => s + totalHeadcount(p), 0);
  const totalAssigned = plans.reduce((s, p) => s + p.workspaceAssessment.assignedDesks, 0);
  const totalAvailable = plans.reduce((s, p) => s + p.workspaceAssessment.availableDesks, 0);
  const totalCoworking = plans.reduce(
    (s, p) => s + p.workspaceAssessment.dropIn + p.workspaceAssessment.reservable,
    0
  );
  const totalWorkspaces = totalAssigned + totalAvailable + totalCoworking;

  const ratio = totalWorkspaces > 0 ? totalEmployees / totalWorkspaces : Infinity;
  const isImbalanced = totalEmployees > totalWorkspaces || ratio > 2;
  const [recOpen, setRecOpen] = useState(false);


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
    <Box
      style={{
        ...GLASS_CARD_STYLE,
        position: "relative",
      }}
    >
      {/* Card header — title + metadata + optional recommendation */}
      <Box px="5" pt="5" style={{ paddingBottom: 16 }}>
        <Flex align="center" justify="between">
          <Flex align="baseline" gap="3">
            <Heading as="h2" size="4" style={{ color: "var(--slate-12)" }}>{title}</Heading>
            <Badge color="gray" variant="soft" radius="full">
              {plans.length} {plans.length === 1 ? "plan" : "plans"}
            </Badge>
          </Flex>
          {isImbalanced && (
            <Popover.Root open={recOpen} onOpenChange={setRecOpen}>
              <Tooltip content="See insights">
                <Popover.Trigger>
                <IconButton
                  size="2"
                  variant="soft"
                  radius="full"
                  aria-label="View space optimization recommendations"
                  className="rec-pulse-btn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="white" d="M14 22.25a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1 0-1.5h4ZM12 5.5a6.49 6.49 0 0 1 5.3 2.74 2.221 2.221 0 0 0-1.283 1.106l-1.232 2.44-2.44 1.23a2.222 2.222 0 0 0 0 3.967l2.44 1.23.24.476a2.86 2.86 0 0 0-.275 1.181V20a.75.75 0 0 1-.75.75h-4a.75.75 0 0 1-.75-.75v-.13c0-1.157-.816-2.224-1.87-3.3A6.59 6.59 0 0 1 5.5 12 6.5 6.5 0 0 1 12 5.5Zm6 4.063c.259 0 .498.127.644.335l.056.095 1.368 2.712c.035.07.054.105.069.13.011.022.011.02.005.012a.065.065 0 0 0 .011.011c-.008-.006-.01-.007.011.005.026.015.061.034.13.069l2.713 1.368a.784.784 0 0 1 0 1.4l-2.712 1.368c-.07.035-.105.054-.13.069-.022.011-.02.011-.012.005a.065.065 0 0 0-.011.011c.006-.008.006-.01-.005.011a3.724 3.724 0 0 0-.069.13L18.7 20.008a.784.784 0 0 1-1.4 0l-1.368-2.712-.069-.13c-.011-.022-.011-.02-.005-.012a.065.065 0 0 0-.011-.011c.008.006.01.006-.011-.005a3.724 3.724 0 0 0-.13-.069L12.992 15.7a.784.784 0 0 1 0-1.4l2.712-1.368c.07-.035.105-.054.13-.069.022-.011.02-.011.012-.005a.065.065 0 0 0 .011-.011c-.006.008-.007.01.005-.011.015-.026.034-.061.069-.13L17.3 9.992l.056-.095A.784.784 0 0 1 18 9.563ZM3 11.25a.75.75 0 0 1 0 1.5H1.25a.75.75 0 0 1 0-1.5H3Zm.836-7.414a.75.75 0 0 1 1.06 0L6.03 4.97a.75.75 0 1 1-1.06 1.06L3.836 4.896a.75.75 0 0 1 0-1.06Zm15.259 0a.75.75 0 1 1 1.06 1.06L19.021 6.03a.75.75 0 1 1-1.06-1.06l1.134-1.134ZM12 .5a.75.75 0 0 1 .75.75V3a.75.75 0 0 1-1.5 0V1.25A.75.75 0 0 1 12 .5Z" />
                  </svg>
                </IconButton>
                </Popover.Trigger>
              </Tooltip>
              <Popover.Content style={{ width: 400, padding: 0, overflow: "hidden" }} align="end" sideOffset={8}>
                <Box style={{ display: "flex", flexDirection: "column" }}>
                  {/* Popover header */}
                  <Box style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--gray-a4)" }}>
                    <Flex align="center" gap="2">
                      <Box style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(245, 158, 11, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="16" height="16" style={{ flexShrink: 0 }}>
                        <defs>
                          <linearGradient id="rec-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#EA7814" />
                          </linearGradient>
                        </defs>
                        <path fill="url(#rec-icon-grad)" d="M14 22.25a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1 0-1.5h4Zm3.125-11.844a4.594 4.594 0 0 1 3.662 7.365l2.22 2.221.094.113a.719.719 0 0 1-.996.996l-.113-.093-2.241-2.241a4.594 4.594 0 1 1-2.626-8.36ZM12 5.5a6.498 6.498 0 0 1 5.75 3.469 6.063 6.063 0 0 0-3.19 11.524.745.745 0 0 1-.56.257h-4a.75.75 0 0 1-.75-.75v-1.02c0-.615-.42-1.24-1.108-1.748A6.58 6.58 0 0 1 5.5 12 6.5 6.5 0 0 1 12 5.5Zm5.125 6.344a3.156 3.156 0 1 0 0 6.312 3.156 3.156 0 0 0 0-6.312Zm0 1.281a1.875 1.875 0 1 1 0 3.75 1.875 1.875 0 0 1 0-3.75ZM2.5 11.25a.75.75 0 0 1 0 1.5H1.25a.75.75 0 0 1 0-1.5H2.5Zm1.336-7.414a.75.75 0 0 1 1.06 0l.884.884a.75.75 0 1 1-1.06 1.06l-.884-.884a.75.75 0 0 1 0-1.06Zm15.259 0a.75.75 0 0 1 1.06 1.06l-.884.884a.75.75 0 0 1-1.06-1.06l.884-.884ZM12 .5a.75.75 0 0 1 .75.75V2.5a.75.75 0 0 1-1.5 0V1.25A.75.75 0 0 1 12 .5Z" />
                      </svg>
                      </Box>
                      <Box>
                        <Text as="div" size="2" weight="medium" style={{ color: "var(--slate-12)" }}>Space imbalance detected</Text>
                        <Text as="div" size="1" color="gray">{title}</Text>
                      </Box>
                    </Flex>
                  </Box>
                  {/* Stats */}
                  <Box style={{ padding: "14px 20px 12px", borderBottom: "1px solid var(--gray-a4)" }}>
                    <Flex gap="4">
                      <Box style={{ flex: 1 }}>
                        <Text as="div" size="3" weight="bold" style={{ color: "var(--slate-12)" }}>{totalEmployees.toLocaleString()}</Text>
                        <Text as="div" size="1" color="gray">Employees</Text>
                      </Box>
                      <Box style={{ flex: 1 }}>
                        <Text as="div" size="3" weight="bold" style={{ color: "var(--slate-12)" }}>{totalWorkspaces.toLocaleString()}</Text>
                        <Text as="div" size="1" color="gray">Workspaces</Text>
                      </Box>
                      <Box style={{ flex: 1 }}>
                        <Text as="div" size="3" weight="bold" style={{ color: ratio > 2 ? "var(--red-11)" : "var(--amber-11)" }}>
                          {isFinite(ratio) ? `${ratio.toFixed(1)}:1` : "—"}
                        </Text>
                        <Text as="div" size="1" color="gray">E:W ratio</Text>
                      </Box>
                    </Flex>
                  </Box>
                  {/* Insight body */}
                  <Box style={{ padding: "14px 20px" }}>
                    <Text as="p" size="2" color="gray" style={{ lineHeight: 1.6, margin: 0 }}>
                      {totalEmployees > totalWorkspaces
                        ? `There are ${(totalEmployees - totalWorkspaces).toLocaleString()} more employees than workspaces at this location. Without action, employees without assigned desks will struggle to find available space. Consider transitioning some to coworking zones or enabling desk-sharing to rebalance utilization.`
                        : `The employee-to-workspace ratio of ${ratio.toFixed(1)}:1 exceeds the recommended 2:1 threshold. As headcount grows, available workspaces will tighten. Proactive desk optimization now can prevent friction during future growth cycles.`
                      }
                    </Text>
                  </Box>
                  {/* CTA */}
                  <Box style={{ padding: "0 20px 18px" }}>
                    <Button
                      size="2"
                      variant="soft"
                      color="gray"
                      style={{ width: "100%", cursor: "pointer", marginTop: 16, ...SECONDARY_BTN_STYLE }}
                      onClick={() => { setRecOpen(false); onShowRecommendations?.(); }}
                    >
                      Show recommendations
                    </Button>
                  </Box>
                </Box>
              </Popover.Content>
            </Popover.Root>
          )}
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
        <Grid className="plan-cards-grid" columns={{ initial: "1", sm: "2", lg: "3" }} gap="3">
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

// ── Preview: donut chart ──────────────────────────────────────────────────────
function MultiDonutChart({
  segments,
  total,
  size = 96,
  thickness = 12,
}: {
  segments: { value: number; color: string }[];
  total: number;
  size?: number;
  thickness?: number;
}) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let accumulated = 0;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gray-4)" strokeWidth={thickness} />
      {segments.map((seg, i) => {
        if (seg.value <= 0 || total <= 0) return null;
        const len = circ * (seg.value / total);
        const offset = -(accumulated / total) * circ;
        accumulated += seg.value;
        return (
          <circle
            key={i}
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={`${len} ${circ}`}
            strokeDashoffset={offset}
            strokeLinecap="butt"
          />
        );
      })}
    </svg>
  );
}

// ── Preview: employee breakdown mock data ─────────────────────────────────────
const PREVIEW_EMP = {
  fullTime: 260,
  inboundEmbeds: 25,
  outboundEmbeds: 18,
  contingent: 14,
  interns: 10,
  futureHeadcount: 8,
};

// ── Preview: workspace/desk data by option ────────────────────────────────────
type WsState = { assignedEmp: number; assignedSpaces: number; coworkingEmp: number; coworkingSpaces: number; deskByCategory: { label: string; value: number; color: string }[] };
const PREVIEW_WORKSPACE: { current: WsState; planned: Record<1 | 2 | 3, WsState> } = {
  current: {
    assignedEmp: 51, assignedSpaces: 69,
    coworkingEmp: 120, coworkingSpaces: 203,
    deskByCategory: [
      { label: "Full-time", value: 40, color: "var(--blue-9)" },
      { label: "Inbound embeds", value: 8, color: "var(--purple-9)" },
      { label: "Contingent", value: 3, color: "var(--orange-9)" },
    ],
  },
  planned: {
    1: {
      assignedEmp: 35, assignedSpaces: 69,
      coworkingEmp: 136, coworkingSpaces: 203,
      deskByCategory: [
        { label: "Full-time", value: 27, color: "var(--blue-9)" },
        { label: "Inbound embeds", value: 6, color: "var(--purple-9)" },
        { label: "Contingent", value: 2, color: "var(--orange-9)" },
      ],
    },
    2: {
      assignedEmp: 45, assignedSpaces: 69,
      coworkingEmp: 125, coworkingSpaces: 203,
      deskByCategory: [
        { label: "Full-time", value: 35, color: "var(--blue-9)" },
        { label: "Inbound embeds", value: 7, color: "var(--purple-9)" },
        { label: "Contingent", value: 3, color: "var(--orange-9)" },
      ],
    },
    3: {
      assignedEmp: 42, assignedSpaces: 69,
      coworkingEmp: 128, coworkingSpaces: 203,
      deskByCategory: [
        { label: "Full-time", value: 32, color: "var(--blue-9)" },
        { label: "Inbound embeds", value: 7, color: "var(--purple-9)" },
        { label: "Contingent", value: 3, color: "var(--orange-9)" },
      ],
    },
  },
};

// ── Preview: map zone data ────────────────────────────────────────────────────
const ZONE_AA_COLORS: Record<string, string> = {
  "Enterprise Products": "rgba(38,87,232,0.28)",
  "Enterprise Solutions": "rgba(147,51,234,0.28)",
  "Enterprise Ticketing": "rgba(20,184,166,0.28)",
  "Enterprise Analytics": "rgba(245,158,11,0.28)",
};
const ZONE_AA_BORDER: Record<string, string> = {
  "Enterprise Products": "rgba(38,87,232,0.5)",
  "Enterprise Solutions": "rgba(147,51,234,0.5)",
  "Enterprise Ticketing": "rgba(20,184,166,0.5)",
  "Enterprise Analytics": "rgba(245,158,11,0.5)",
};

type MapZone = { id: string; label: string; top: number; left: number; width: number; height: number };

const MAP_ZONES: { current: MapZone[]; planned: Record<1 | 2 | 3, MapZone[]> } = {
  current: [
    { id: "ep", label: "Enterprise Products",  top: 11, left: 28, width: 22, height: 40 },
    { id: "es", label: "Enterprise Solutions",  top: 11, left: 50, width: 19, height: 40 },
    { id: "et", label: "Enterprise Ticketing",  top: 54, left: 28, width: 19, height: 26 },
    { id: "ea", label: "Enterprise Analytics",  top: 54, left: 47, width: 22, height: 26 },
  ],
  planned: {
    1: [
      { id: "ep", label: "Enterprise Products",  top: 11, left: 28, width: 17, height: 40 },
      { id: "es", label: "Enterprise Solutions",  top: 11, left: 45, width: 19, height: 40 },
      { id: "et", label: "Enterprise Ticketing",  top: 54, left: 28, width: 15, height: 26 },
      { id: "ea", label: "Enterprise Analytics",  top: 54, left: 43, width: 26, height: 26 },
    ],
    2: [
      { id: "ep", label: "Enterprise Products",  top:  9, left: 26, width: 24, height: 44 },
      { id: "es", label: "Enterprise Solutions",  top:  9, left: 50, width: 21, height: 44 },
      { id: "et", label: "Enterprise Ticketing",  top: 53, left: 26, width: 24, height: 29 },
      { id: "ea", label: "Enterprise Analytics",  top: 53, left: 50, width: 21, height: 29 },
    ],
    3: [
      { id: "ep", label: "Enterprise Products",  top: 10, left: 27, width: 28, height: 38 },
      { id: "es", label: "Enterprise Solutions",  top: 10, left: 55, width: 14, height: 38 },
      { id: "et", label: "Enterprise Ticketing",  top: 52, left: 27, width: 18, height: 30 },
      { id: "ea", label: "Enterprise Analytics",  top: 52, left: 45, width: 24, height: 30 },
    ],
  },
};

const COLLAPSIBLE_FILTERS = ['evaluation', 'status', 'location', 'aa'] as const;
type CollapsibleFilter = (typeof COLLAPSIBLE_FILTERS)[number];

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

    const measureIndicator = (r: HTMLElement) => {
      const active = r.querySelector<HTMLElement>('[data-state="on"]');
      if (!active) return;
      const rr = r.getBoundingClientRect();
      const ar = active.getBoundingClientRect();
      r.style.setProperty('--ind-left', `${ar.left - rr.left}px`);
      r.style.setProperty('--ind-top', `${ar.top - rr.top}px`);
      r.style.setProperty('--ind-width', `${ar.width}px`);
      r.style.setProperty('--ind-height', `${ar.height}px`);
    };

    const rafId = requestAnimationFrame(() => {
      measureIndicator(root);

      if (!toggleInitialized.current) {
        toggleInitialized.current = true;
        requestAnimationFrame(() => root.setAttribute('data-initialized', 'true'));
      } else {
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

    // Re-measure when the toggle root resizes (e.g. font load, CSS HMR, viewport change)
    let roRaf: ReturnType<typeof requestAnimationFrame>;
    const ro = new ResizeObserver(() => {
      roRaf = requestAnimationFrame(() => measureIndicator(root));
    });
    ro.observe(root);

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(roRaf);
      ro.disconnect();
    };
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

  // ── Filter bar progressive overflow detection ────────────────────────────
  // useLayoutEffect collapses one pill at a time before paint (no flicker).
  // ResizeObserver expands them back when the container grows.
  const filterBarRef = useRef<HTMLDivElement>(null);
  const collapseWidthsRef = useRef<number[]>([]);
  const collapsedCountRef = useRef(0);
  const [collapsedCount, setCollapsedCount] = useState(0);
  const [filterOverflowOpen, setFilterOverflowOpen] = useState(false);

  // Cascade collapse and expand: runs before paint after each collapsedCount change.
  useLayoutEffect(() => {
    const el = filterBarRef.current;
    if (!el) return;
    if (el.scrollWidth > el.clientWidth + 2 && collapsedCountRef.current < COLLAPSIBLE_FILTERS.length) {
      collapseWidthsRef.current[collapsedCountRef.current] = el.scrollWidth;
      collapsedCountRef.current++;
      setCollapsedCount(collapsedCountRef.current);
    } else if (collapsedCountRef.current > 0) {
      const threshold = collapseWidthsRef.current[collapsedCountRef.current - 1];
      if (threshold !== undefined && el.clientWidth >= threshold + 20) {
        collapsedCountRef.current--;
        setCollapsedCount(collapsedCountRef.current);
        setFilterOverflowOpen(false);
      }
    }
  }, [collapsedCount]);

  // ResizeObserver: fires on every frame during the CSS transition as the Flex narrows.
  // No rAF wrapper so checks run synchronously while the element is changing size.
  useEffect(() => {
    const el = filterBarRef.current;
    if (!el) return;
    const check = () => {
      if (el.scrollWidth > el.clientWidth + 2 && collapsedCountRef.current < COLLAPSIBLE_FILTERS.length) {
        collapseWidthsRef.current[collapsedCountRef.current] = el.scrollWidth;
        collapsedCountRef.current++;
        setCollapsedCount(collapsedCountRef.current);
      } else if (collapsedCountRef.current > 0) {
        const threshold = collapseWidthsRef.current[collapsedCountRef.current - 1];
        if (threshold !== undefined && el.clientWidth >= threshold + 20) {
          collapsedCountRef.current--;
          setCollapsedCount(collapsedCountRef.current);
          setFilterOverflowOpen(false);
        }
      }
    };
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [agentInput, setAgentInput] = useState("");
  const [agentMessages, setAgentMessages] = useState<{ role: "user" | "agent"; content: string }[]>([]);
  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([...PLANS]);

  // ── Recommendations full-screen expansion ─────────────────────────────────
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const [recTitle, setRecTitle] = useState<string | null>(null);
  const [recPhase, setRecPhase] = useState<"idle" | "expanding" | "content">("idle");
  const [recIsExpanded, setRecIsExpanded] = useState(false);
  const [recRect, setRecRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [contentFaded, setContentFaded] = useState(false);

  // ── Preview level within the rec modal ───────────────────────────────────────
  const [previewOption, setPreviewOption] = useState<{ num: 1 | 2 | 3; label: string; color: string } | null>(null);
  const [previewView, setPreviewView] = useState<"data" | "map">("data");
  const [previewEmpHovered, setPreviewEmpHovered] = useState<string | null>(null);
  const previewEmpBarRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [mapZoom, setMapZoom] = useState(1);
  const [mapRotation, setMapRotation] = useState(0);
  const previewOptionRef = useRef<{ num: 1 | 2 | 3; label: string; color: string } | null>(null);

  useEffect(() => {
    if (recPhase === "idle") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewOptionRef.current) {
          previewOptionRef.current = null;
          setPreviewOption(null);
        } else {
          closeRec();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recPhase]);

  function openRec(title: string) {
    const el = contentAreaRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRecRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    setRecTitle(title);
    closeAgent();
    setContentFaded(true);
    setTimeout(() => {
      setRecPhase("expanding");
      requestAnimationFrame(() => requestAnimationFrame(() => setRecIsExpanded(true)));
      setTimeout(() => setRecPhase("content"), 260);
    }, 280);
  }

  function closeRec() {
    previewOptionRef.current = null;
    setPreviewOption(null);
    setRecPhase("expanding");
    setRecIsExpanded(false);
    setContentFaded(false);
    setTimeout(() => {
      setRecPhase("idle");
      setRecRect(null);
      setRecTitle(null);
    }, 280);
  }

  function openPreview(num: 1 | 2 | 3, label: string, color: string) {
    const opt = { num, label, color };
    previewOptionRef.current = opt;
    setPreviewOption(opt);
    setPreviewView("data");
    setMapZoom(1);
    setMapRotation(0);
  }

  function closePreview() {
    previewOptionRef.current = null;
    setPreviewOption(null);
  }

  const [statusFilter, setStatusFilter] = useState<Set<PlanStatus>>(new Set());
  const [locationFilter, setLocationFilter] = useState<Set<WorkLocation>>(new Set());
  const [aaFilter, setAAFilter] = useState<Set<AllocationArea>>(new Set());
  const [periodFilter, setPeriodFilter] = useState<QuarterRange | null>(null);
  const hasActiveFilters = statusFilter.size > 0 || locationFilter.size > 0 || aaFilter.size > 0 || periodFilter !== null;
  const hiddenFilters = new Set<CollapsibleFilter>(COLLAPSIBLE_FILTERS.slice(COLLAPSIBLE_FILTERS.length - collapsedCount));
  const hasHiddenActiveFilters =
    (hiddenFilters.has('evaluation') && periodFilter !== null) ||
    (hiddenFilters.has('status') && statusFilter.size > 0) ||
    (hiddenFilters.has('location') && locationFilter.size > 0) ||
    (hiddenFilters.has('aa') && aaFilter.size > 0);

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

  // Derived preview values (computed outside JSX to avoid IIFE)
  const previewCur = PREVIEW_WORKSPACE.current;
  const previewPln = previewOption ? PREVIEW_WORKSPACE.planned[previewOption.num] : null;
  const previewEmpTotal = PREVIEW_EMP.fullTime + PREVIEW_EMP.inboundEmbeds + PREVIEW_EMP.outboundEmbeds + PREVIEW_EMP.contingent + PREVIEW_EMP.interns + PREVIEW_EMP.futureHeadcount;
  const previewEmpRows: { label: string; value: number; color: string; tooltip: string | null }[] = [
    { label: "Full-time", value: PREVIEW_EMP.fullTime, color: "var(--blue-9)", tooltip: null },
    { label: "Inbound embeds", value: PREVIEW_EMP.inboundEmbeds, color: "var(--purple-9)", tooltip: "Employees from other teams embedded within this allocation area" },
    { label: "Outbound embeds", value: PREVIEW_EMP.outboundEmbeds, color: "var(--violet-9)", tooltip: "Employees from this area embedded in other teams' spaces" },
    { label: "Contingent workers", value: PREVIEW_EMP.contingent, color: "var(--orange-9)", tooltip: null },
    { label: "Interns", value: PREVIEW_EMP.interns, color: "var(--green-9)", tooltip: null },
  ];
  const previewCurrentZones = MAP_ZONES.current;
  const previewPlannedZones = previewOption ? MAP_ZONES.planned[previewOption.num] : MAP_ZONES.current;

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
      <Box ref={contentAreaRef as React.Ref<HTMLDivElement>} style={{ flex: 1, overflow: "hidden", borderRadius: "24px 24px 0 0", position: "relative", zIndex: 1, background: "#F0F0F3" }}>
        <BlobCanvas />
          {/* Scrollable content — right edge retracts to make room for the panel */}
          <Box className="scrollable-content" style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: agentPanelVisible ? 376 : 0, overflowY: "auto", opacity: contentFaded ? 0 : 1, pointerEvents: contentFaded ? "none" : undefined, transition: "opacity 250ms ease-in-out, right 300ms ease-in-out" }}>
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
                  transition: "border-radius 350ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 350ms ease",
                }}
              >
                {/* Icon container — white rotated card (decoration) */}
                <Box className="banner-icon-container" style={{
                  position: "absolute",
                  left: -124,
                  top: "calc(50% - 122.5px)",
                  width: 243.64,
                  height: 248.38,
                  background: "white",
                  borderRadius: 28,
                  transform: "rotate(45deg)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
                }} />

                {/* Calendar icon — independently positioned, unrotated, always centered on banner midline */}
                <Lottie
                  lottieRef={bannerLottieRef}
                  animationData={calendarAnimation}
                  loop
                  className="banner-lottie-icon"
                  style={{
                    position: "absolute",
                    left: "calc(96px - 3%)",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 114,
                    height: 114,
                    zIndex: 1,
                  }}
                />

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
                className="header-card-title-row"
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
              <Box
                className="filter-bar"
                style={{ margin: "0 8px 8px", background: "white", borderRadius: 9999, padding: "6px 12px", overflow: "hidden" }}
              >
                <Flex ref={filterBarRef as React.Ref<HTMLDivElement>} gap="2" align="center" style={{ overflow: "hidden" }}>
                  <PillarPill />
                  {!hiddenFilters.has('evaluation') && <QuarterRangePill value={periodFilter} onChange={setPeriodFilter} />}
                  {!hiddenFilters.has('status') && (
                    <FilterPill
                      label="Status"
                      options={["Plan draft", "Policy draft", "Submitted", "Approved", "Live"]}
                      selected={statusFilter as Set<string>}
                      onToggle={(v) => setStatusFilter(prev => toggleSet(prev, v as PlanStatus))}
                    />
                  )}
                  {!hiddenFilters.has('location') && (
                    <FilterPill
                      label="Location"
                      options={availableLocations}
                      selected={locationFilter as Set<string>}
                      onToggle={(v) => setLocationFilter(prev => toggleSet(prev, v as WorkLocation))}
                    />
                  )}
                  {!hiddenFilters.has('aa') && (
                    <FilterPill
                      label="Allocation area"
                      options={availableAAs}
                      selected={aaFilter as Set<string>}
                      onToggle={(v) => setAAFilter(prev => toggleSet(prev, v as AllocationArea))}
                    />
                  )}
                  {collapsedCount > 0 && (
                    <Popover.Root open={filterOverflowOpen} onOpenChange={setFilterOverflowOpen}>
                      <Popover.Trigger>
                        <IconButton
                          variant="soft"
                          color={hasHiddenActiveFilters ? "blue" : "gray"}
                          size="1"
                          radius="full"
                          aria-label="More filters"
                        >
                          <MixerHorizontalIcon />
                        </IconButton>
                      </Popover.Trigger>
                      <Popover.Content size="1" style={{ padding: "12px 14px" }} align="end" sideOffset={8}>
                        <Flex direction="column" gap="2">
                          {hiddenFilters.has('evaluation') && (
                            <Flex direction="column" gap="1">
                              <Text size="1" color="gray" weight="medium">Evaluation period</Text>
                              <QuarterRangePill value={periodFilter} onChange={setPeriodFilter} />
                            </Flex>
                          )}
                          {hiddenFilters.has('status') && (
                            <FilterPill
                              label="Status"
                              options={["Plan draft", "Policy draft", "Submitted", "Approved", "Live"]}
                              selected={statusFilter as Set<string>}
                              onToggle={(v) => setStatusFilter(prev => toggleSet(prev, v as PlanStatus))}
                            />
                          )}
                          {hiddenFilters.has('location') && (
                            <FilterPill
                              label="Location"
                              options={availableLocations}
                              selected={locationFilter as Set<string>}
                              onToggle={(v) => setLocationFilter(prev => toggleSet(prev, v as WorkLocation))}
                            />
                          )}
                          {hiddenFilters.has('aa') && (
                            <FilterPill
                              label="Allocation area"
                              options={availableAAs}
                              selected={aaFilter as Set<string>}
                              onToggle={(v) => setAAFilter(prev => toggleSet(prev, v as AllocationArea))}
                            />
                          )}
                        </Flex>
                      </Popover.Content>
                    </Popover.Root>
                  )}
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
                        onShowRecommendations={() => openRec(loc)}
                      />
                    ))
                : aaOrder
                    .filter((aa) => byAA.has(aa))
                    .map((aa) => (
                      <GroupCard key={aa} title={aa} plans={byAA.get(aa)!} view="aa" onShowRecommendations={() => openRec(aa)} />
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
                borderTop: "0.5px solid rgba(255,255,255,0.88)",
                borderLeft: "0.5px solid rgba(255,255,255,0.72)",
                borderRight: "0.5px solid rgba(255,255,255,0.42)",
                borderBottom: "0.5px solid rgba(255,255,255,0.32)",
                borderRadius: 20,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.92)",
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

      {/* Full-screen recommendations expansion — parent container grows to cover the viewport */}
      {recPhase !== "idle" && createPortal(
        <Box
          role="dialog"
          aria-modal="true"
          aria-label={`Workspace optimization options for ${recTitle}`}
          style={{
            position: "fixed",
            top: recIsExpanded ? 0 : (recRect?.top ?? 0),
            left: recIsExpanded ? 0 : (recRect?.left ?? 0),
            width: recIsExpanded ? "100vw" : `${recRect?.width ?? 0}px`,
            height: recIsExpanded ? "100vh" : `${recRect?.height ?? 0}px`,
            borderRadius: recIsExpanded ? 0 : "24px 24px 0 0",
            background: "#F0F0F3",
            zIndex: 200,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            transition: "top 250ms ease-in-out, left 250ms ease-in-out, width 250ms ease-in-out, height 250ms ease-in-out, border-radius 250ms ease-in-out",
          }}
        >
          <BlobCanvas />
          {recPhase === "content" && (
            <Box style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", zIndex: 1, overflow: "hidden" }}>
              {/* Modal header */}
              <Box style={{ padding: "28px 36px 24px", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(24px) saturate(1.8)", WebkitBackdropFilter: "blur(24px) saturate(1.8)", borderBottom: "0.5px solid var(--gray-5)", flexShrink: 0, animation: "recHeaderIn 250ms ease-in-out 350ms both" }}>
                <Flex align="start" justify="between">
                  <Flex align="start" style={{ gap: 8 }}>
                    <Box style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #2657E8, #6421CA)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="16" height="16" style={{ color: "white" }}>
                        <path fill="currentColor" d="M11.925 2.044c-.397-1.1-1.952-1.1-2.35 0L7.693 7.243a.75.75 0 0 1-.45.45L2.044 9.574c-1.1.398-1.1 1.953 0 2.351l5.2 1.882a.75.75 0 0 1 .45.45l1.88 5.199c.399 1.1 1.954 1.1 2.351 0l1.882-5.2a.75.75 0 0 1 .45-.45l5.199-1.88c1.1-.399 1.1-1.954 0-2.352l-5.2-1.881a.75.75 0 0 1-.45-.45l-1.88-5.2ZM19.5 15.375a.806.806 0 0 0-.754.521l-.641 1.699a.875.875 0 0 1-.51.51l-1.699.641a.806.806 0 0 0 0 1.508l1.7.641c.234.089.42.275.509.51l.641 1.699a.806.806 0 0 0 1.508 0l.641-1.7a.875.875 0 0 1 .51-.509l1.699-.641a.806.806 0 0 0 0-1.508l-1.7-.641a.875.875 0 0 1-.509-.51l-.641-1.699a.806.806 0 0 0-.754-.521Z" />
                      </svg>
                    </Box>
                    <Box>
                      <Heading as="h1" size="5" style={{ color: "var(--slate-12)" }} mb="2">Campus Assistant Recommendations</Heading>
                      <Text as="p" size="2" color="gray" style={{ margin: 0, maxWidth: 620, lineHeight: 1.55 }}>
                        Based on your team headcount, workspace inventory, and usage patterns, I was able to design 3 strategies to rebalance workspace allocation for{" "}
                        <Text weight="medium" style={{ color: "var(--slate-12)" }}>{recTitle}</Text>.
                      </Text>
                    </Box>
                  </Flex>
                  <IconButton variant="soft" color="gray" size="2" style={{ flexShrink: 0, width: 32, height: 32 }} onClick={closeRec}>
                    <Cross2Icon />
                  </IconButton>
                </Flex>
              </Box>

              {/* ── Main level: options grid ──────────────────────────── */}
              {!previewOption && <ScrollArea style={{ flex: 1 }}>
                <Box style={{ padding: "28px 36px 40px" }}>
                  <Grid columns={{ initial: "1", md: "3" }} style={{ alignItems: "stretch", gap: 16 }}>

                    {/* Option 1: In-Person Frequency Priority */}
                    <Flex direction="column" style={{ ...GLASS_CARD_STYLE, background: "color-mix(in srgb, color-mix(in srgb, var(--blue-3) 56%, white) 72%, transparent)", borderRadius: 16, animation: "recItemIn 200ms ease-out 80ms both" }}>
                      <Box style={{ padding: "20px 24px 16px", background: "transparent", borderBottom: "none" }}>
                        <Flex align="center" gap="3">
                          <Box style={{ width: 40, height: 40, borderRadius: 12, background: "var(--blue-11)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 8 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={18} height={18} style={{ color: "white" }}><path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M8 4.5V2M16 4.5V2M7.25 20.5H5.9c-.84 0-1.26 0-1.581-.163a1.5 1.5 0 0 1-.656-.656c-.163-.32-.163-.74-.163-1.581V6.9c0-.84 0-1.26.163-1.581a1.5 1.5 0 0 1 .656-.656c.32-.163.74-.163 1.581-.163h12.2c.84 0 1.26 0 1.581.163a1.5 1.5 0 0 1 .655.656c.164.32.164.74.164 1.581V9"/><path stroke="currentColor" strokeWidth="1.5" d="M3.5 9h17"/><path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="m13 18.75 2.402 2.401c.296.297.445.446.616.502a.75.75 0 0 0 .464 0c.171-.056.32-.204.617-.502L22.5 15.75"/></svg>
                          </Box>
                          <Box>
                            <Text as="div" size="1" weight="medium" style={{ color: "var(--gray-11)", letterSpacing: "0.04em" }}>Option 1</Text>
                            <Heading as="h2" size="3" style={{ color: "var(--slate-12)" }}>In-person time priority</Heading>
                          </Box>
                        </Flex>
                      </Box>
                      <Flex direction="column" gap="4" style={{ padding: "20px 24px", flex: 1, background: "white", borderRadius: 16, margin: "0 4px 4px" }}>
                        <Text as="p" size="2" style={{ margin: 0, lineHeight: 1.65, color: "var(--slate-12)" }}>
                          The Campus assistant analyzes badge-in patterns and segments employees by in-office frequency.
                          Assigned desks are reserved for employees who come in at least{" "}
                          <Text weight="medium" style={{ color: "var(--slate-12)" }}>3 days per week</Text>.
                          Employees with lighter schedules transition to drop-in or coworking zones within the same location—still ensuring a great workspace when they do come in.
                        </Text>
                        <Box>
                          <Heading as="h3" size="2" style={{ color: "var(--slate-12)", marginBottom: 10 }}>Outcome</Heading>
                          <Box style={{ border: "1px solid var(--green-6)", borderRadius: 12, padding: "12px 14px" }}>
                            <Flex direction="column" gap="2">
                              {["Desk assignments reflect actual usage patterns", "Rewards consistent in-person culture", "Frees up desks for future headcount growth"].map((pro) => (
                                <Flex key={pro} align="start" style={{ gap: 4 }}>
                                  <Box style={{ display: "inline-flex", alignItems: "center", height: 20, flexShrink: 0, marginTop: 2 }}>
                                    <CheckCircledIcon width={15} height={15} style={{ color: "var(--green-10)" }} />
                                  </Box>
                                  <Text size="2" style={{ color: "var(--slate-11)" }}>{pro}</Text>
                                </Flex>
                              ))}
                            </Flex>
                          </Box>
                          <Box style={{ border: "1px solid var(--red-6)", borderRadius: 12, padding: "12px 14px", marginTop: 8 }}>
                            <Flex direction="column" gap="2">
                              {["Some employees may lose their assigned desk", "Relies on accurate badge-in data availability"].map((con) => (
                                <Flex key={con} align="start" style={{ gap: 4 }}>
                                  <Box style={{ display: "inline-flex", alignItems: "center", height: 20, flexShrink: 0, marginTop: 2 }}>
                                    <Cross2Icon width={13} height={13} style={{ color: "var(--red-10)" }} />
                                  </Box>
                                  <Text size="2" style={{ color: "var(--slate-11)" }}>{con}</Text>
                                </Flex>
                              ))}
                            </Flex>
                          </Box>
                        </Box>
                        <Box style={{ marginTop: "auto", paddingTop: 8 }}>
                          <Button size="3" variant="soft" color="gray" style={{ width: "100%", paddingTop: 4, paddingBottom: 4, marginTop: 16, ...SECONDARY_BTN_STYLE }} onClick={() => openPreview(1, "In-person time priority", "var(--blue-11)")}>Preview changes</Button>
                        </Box>
                      </Flex>
                    </Flex>

                    {/* Option 2: Team Colocation */}
                    <Flex direction="column" style={{ ...GLASS_CARD_STYLE, background: "color-mix(in srgb, color-mix(in srgb, var(--purple-3) 56%, white) 72%, transparent)", borderRadius: 16, animation: "recItemIn 200ms ease-out 180ms both" }}>
                      <Box style={{ padding: "20px 24px 16px", background: "transparent", borderBottom: "none" }}>
                        <Flex align="center" gap="3">
                          <Box style={{ width: 40, height: 40, borderRadius: 12, background: "var(--purple-11)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 8 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={18} height={18} style={{ color: "white" }}><circle cx="1.75" cy="1.75" r="1.75" stroke="currentColor" strokeWidth="1.25" transform="matrix(0 -1 -1 0 9 4.5)"/><circle cx="1.75" cy="1.75" r="1.75" stroke="currentColor" strokeWidth="1.25" transform="matrix(0 -1 -1 0 18.5 4.5)"/><circle cx="12" cy="8.375" r="1.875" stroke="currentColor" strokeWidth="1.25"/><circle cx="2.75" cy="12.25" r="1.75" stroke="currentColor" strokeWidth="1.25" transform="rotate(180 2.75 12.25)"/><circle cx="1.75" cy="1.75" r="1.75" stroke="currentColor" strokeWidth="1.25" transform="matrix(1 0 0 -1 19.5 14)"/><path stroke="currentColor" strokeLinecap="round" strokeWidth="1.438" d="M15.5 16v-.5A2.5 2.5 0 0 0 13 13h-2a2.5 2.5 0 0 0-2.5 2.5v.5"/><circle cx="7.25" cy="21.25" r="1.75" stroke="currentColor" strokeWidth="1.25" transform="rotate(-180 7.25 21.25)"/><circle cx="16.75" cy="21.25" r="1.75" stroke="currentColor" strokeWidth="1.25" transform="rotate(90 16.75 21.25)"/></svg>
                          </Box>
                          <Box>
                            <Text as="div" size="1" weight="medium" style={{ color: "var(--gray-11)", letterSpacing: "0.04em" }}>Option 2</Text>
                            <Heading as="h2" size="3" style={{ color: "var(--slate-12)" }}>Team colocation priority</Heading>
                          </Box>
                        </Flex>
                      </Box>
                      <Flex direction="column" gap="4" style={{ padding: "20px 24px", flex: 1, background: "white", borderRadius: 16, margin: "0 4px 4px" }}>
                        <Text as="p" size="2" style={{ margin: 0, lineHeight: 1.65, color: "var(--slate-12)" }}>
                          The Campus assistant consolidates all employees within the same allocation area into dedicated floor zones at {recTitle}.
                          Teams sit together in contiguous neighborhoods—Enterprise Products in one zone, Enterprise Solutions in another—maximizing proximity for standups, 1:1s, and spontaneous collaboration.
                          If a team&apos;s headcount exceeds available workspaces here, the assistant surfaces a migration plan to move a subset to the nearest compatible office.
                        </Text>
                        <Box>
                          <Heading as="h3" size="2" style={{ color: "var(--slate-12)", marginBottom: 10 }}>Outcome</Heading>
                          <Box style={{ border: "1px solid var(--green-6)", borderRadius: 12, padding: "12px 14px" }}>
                            <Flex direction="column" gap="2">
                              {["Strong team identity and colocation on office days", "Easy for teammates to find each other", "Simplifies desk management and onboarding"].map((pro) => (
                                <Flex key={pro} align="start" style={{ gap: 4 }}>
                                  <Box style={{ display: "inline-flex", alignItems: "center", height: 20, flexShrink: 0, marginTop: 2 }}>
                                    <CheckCircledIcon width={15} height={15} style={{ color: "var(--green-10)" }} />
                                  </Box>
                                  <Text size="2" style={{ color: "var(--slate-11)" }}>{pro}</Text>
                                </Flex>
                              ))}
                            </Flex>
                          </Box>
                          <Box style={{ border: "1px solid var(--red-6)", borderRadius: 12, padding: "12px 14px", marginTop: 8 }}>
                            <Flex direction="column" gap="2">
                              {["May require displacing some teams to other locations", "Needs coordinated agreement across team leaders and planners"].map((con) => (
                                <Flex key={con} align="start" style={{ gap: 4 }}>
                                  <Box style={{ display: "inline-flex", alignItems: "center", height: 20, flexShrink: 0, marginTop: 2 }}>
                                    <Cross2Icon width={13} height={13} style={{ color: "var(--red-10)" }} />
                                  </Box>
                                  <Text size="2" style={{ color: "var(--slate-11)" }}>{con}</Text>
                                </Flex>
                              ))}
                            </Flex>
                          </Box>
                        </Box>
                        <Box style={{ marginTop: "auto", paddingTop: 8 }}>
                          <Button size="3" variant="soft" color="gray" style={{ width: "100%", paddingTop: 4, paddingBottom: 4, marginTop: 16, ...SECONDARY_BTN_STYLE }} onClick={() => openPreview(2, "Team colocation priority", "var(--purple-11)")}>Preview changes</Button>
                        </Box>
                      </Flex>
                    </Flex>

                    {/* Option 3: Collaboration Graph Clustering */}
                    <Flex direction="column" style={{ ...GLASS_CARD_STYLE, background: "color-mix(in srgb, color-mix(in srgb, var(--teal-3) 56%, white) 72%, transparent)", borderRadius: 16, animation: "recItemIn 200ms ease-out 280ms both" }}>
                      <Box style={{ padding: "20px 24px 16px", background: "transparent", borderBottom: "none" }}>
                        <Flex align="center" gap="3">
                          <Box style={{ width: 40, height: 40, borderRadius: 12, background: "var(--teal-11)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 8 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={18} height={18} style={{ color: "white" }}><path stroke="currentColor" strokeWidth="1.5" d="M3.5 13.25 9 7.75 7.31 6.06a1.5 1.5 0 0 0-2.12 0L1.81 9.44a1.5 1.5 0 0 0 0 2.12l1.69 1.69Z"/><path stroke="currentColor" strokeWidth="1.5" d="m17 16.75-.743.743a6.034 6.034 0 0 1-8.515 0L3.5 13.25 9 7.75h1.879a1.5 1.5 0 0 1 1.06.44L13.25 9.5"/><path stroke="currentColor" strokeWidth="1.5" d="m15 7.75-4.558 4.558a1.509 1.509 0 0 0 0 2.134l.058.058c.32.32.754.5 1.207.5h2.922a1.5 1.5 0 0 1 1.06.44L17 16.75l3.5-3.5"/><path stroke="currentColor" strokeWidth="1.5" d="M20.5 13.25 15 7.75l1.69-1.69a1.5 1.5 0 0 1 2.12 0l3.38 3.38a1.5 1.5 0 0 1 0 2.12l-1.69 1.69Z"/></svg>
                          </Box>
                          <Box>
                            <Text as="div" size="1" weight="medium" style={{ color: "var(--gray-11)", letterSpacing: "0.04em" }}>Option 3</Text>
                            <Heading as="h2" size="3" style={{ color: "var(--slate-12)" }}>XFN collaboration priority</Heading>
                          </Box>
                        </Flex>
                      </Box>
                      <Flex direction="column" gap="4" style={{ padding: "20px 24px", flex: 1, background: "white", borderRadius: 16, margin: "0 4px 4px" }}>
                        <Text as="p" size="2" style={{ margin: 0, lineHeight: 1.65, color: "var(--slate-12)" }}>
                          The Campus assistant mines calendar meeting data and collaboration signals to build a{" "}
                          <Text weight="medium" style={{ color: "var(--slate-12)" }}>weighted collaboration graph</Text>—mapping who works most closely with whom, regardless of org chart.
                          Employees are seated near their most frequent collaborators across teams, so engineers who regularly pair with PMs end up in adjacent desks.
                          The assistant recalculates the graph each quarter and proposes incremental re-seating changes to stay current with how work actually flows.
                        </Text>
                        <Box>
                          <Heading as="h3" size="2" style={{ color: "var(--slate-12)", marginBottom: 10 }}>Outcome</Heading>
                          <Box style={{ border: "1px solid var(--green-6)", borderRadius: 12, padding: "12px 14px" }}>
                            <Flex direction="column" gap="2">
                              {["Optimizes for real-world collaboration patterns", "Bridges cross-functional silos naturally", "Self-updating — adapts automatically each quarter"].map((pro) => (
                                <Flex key={pro} align="start" style={{ gap: 4 }}>
                                  <Box style={{ display: "inline-flex", alignItems: "center", height: 20, flexShrink: 0, marginTop: 2 }}>
                                    <CheckCircledIcon width={15} height={15} style={{ color: "var(--green-10)" }} />
                                  </Box>
                                  <Text size="2" style={{ color: "var(--slate-11)" }}>{pro}</Text>
                                </Flex>
                              ))}
                            </Flex>
                          </Box>
                          <Box style={{ border: "1px solid var(--red-6)", borderRadius: 12, padding: "12px 14px", marginTop: 8 }}>
                            <Flex direction="column" gap="2">
                              {["Requires access to calendar metadata (privacy review needed)", "Less intuitive than team-based or frequency-based grouping"].map((con) => (
                                <Flex key={con} align="start" style={{ gap: 4 }}>
                                  <Box style={{ display: "inline-flex", alignItems: "center", height: 20, flexShrink: 0, marginTop: 2 }}>
                                    <Cross2Icon width={13} height={13} style={{ color: "var(--red-10)" }} />
                                  </Box>
                                  <Text size="2" style={{ color: "var(--slate-11)" }}>{con}</Text>
                                </Flex>
                              ))}
                            </Flex>
                          </Box>
                        </Box>
                        <Box style={{ marginTop: "auto", paddingTop: 8 }}>
                          <Button size="3" variant="soft" color="gray" style={{ width: "100%", paddingTop: 4, paddingBottom: 4, marginTop: 16, ...SECONDARY_BTN_STYLE }} onClick={() => openPreview(3, "XFN collaboration priority", "var(--teal-11)")}>Preview changes</Button>
                        </Box>
                      </Flex>
                    </Flex>

                  </Grid>
                </Box>
              </ScrollArea>}

              {/* ── Preview level ──────────────────────────────────────── */}
              {previewOption && (
                <Box style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", position: "relative", animation: "previewSlideIn 200ms ease-out both" }}>
                  {/* Sub-header — outside scroll area so backdrop-filter correctly blurs scrolling content behind it */}
                  <Box style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, padding: "10px 16px 10px 20px", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", border: "none", borderRadius: 0, borderBottom: "0.5px solid var(--gray-5)", boxShadow: "inset 0 4px 10px rgba(255,255,255,0.4)" }}>
                    <Flex align="center" justify="between">
                      <Flex align="center" style={{ gap: 8 }}>
                        <IconButton variant="soft" color="gray" size="3" onClick={closePreview} aria-label="Back" style={{ flexShrink: 0, width: 32, height: 32 }}>
                          <ChevronLeftIcon width={16} height={16} />
                        </IconButton>
                        <Flex direction="column" style={{ gap: 1 }}>
                          <Heading as="h2" size="2" style={{ color: "var(--slate-12)", fontWeight: 600 }}>Employee and workspace changes</Heading>
                          <Flex align="center" style={{ gap: 6 }}>
                            <Box style={{ width: 8, height: 8, borderRadius: "50%", background: previewOption.color, flexShrink: 0 }} />
                            <Text size="1" weight="medium" style={{ color: "var(--gray-11)" }}>Option {previewOption.num}</Text>
                            <Text size="2" weight="medium" style={{ color: "var(--slate-12)" }}>{previewOption.label}</Text>
                          </Flex>
                        </Flex>
                      </Flex>
                      {/* View toggle */}
                      <ToggleGroup.Root
                        type="single"
                        value={previewView}
                        onValueChange={(v) => { if (v) setPreviewView(v as "data" | "map"); }}
                        className="preview-toggle-root"
                      >
                        <ToggleGroup.Item value="data" className="preview-toggle-item" data-state={previewView === "data" ? "on" : "off"}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="6" width="4" height="15" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>
                          Summary
                        </ToggleGroup.Item>
                        <ToggleGroup.Item value="map" className="preview-toggle-item" data-state={previewView === "map" ? "on" : "off"}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 7 9 4 15 7 21 4 21 17 15 20 9 17 3 20"/><line x1="9" y1="4" x2="9" y2="17"/><line x1="15" y1="7" x2="15" y2="20"/></svg>
                          Floor map
                        </ToggleGroup.Item>
                      </ToggleGroup.Root>
                    </Flex>
                  </Box>
                  <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "var(--gray-6) transparent" }}>
                    <Box style={{ padding: "80px 0 40px" }}>
                      <Box style={{ padding: "0 36px" }}>

                      {/* ── DATA VIEW ──────────────────────────────────────── */}
                      {previewView === "data" && previewPln && (
                          <Flex direction="column" style={{ gap: 16, animation: "previewFadeUp 180ms ease-out both" }}>

                            {/* Card 1: Employee population */}
                            <Box style={{ ...GLASS_CARD_STYLE, borderRadius: 16, padding: "20px 24px", background: "white" }}>
                              <Flex justify="between" align="start" style={{ marginBottom: 16 }}>
                                <Box>
                                  <Heading as="h3" size="3" style={{ color: "var(--slate-12)" }}>Employee population</Heading>
                                  <Text as="p" size="1" color="gray" style={{ margin: "4px 0 0" }}>
                                    {previewEmpTotal - PREVIEW_EMP.futureHeadcount} current · +{PREVIEW_EMP.futureHeadcount} future headcount
                                  </Text>
                                </Box>
                              </Flex>
                              {/* Segmented bar — full segments including future headcount */}
                              {(() => {
                                const allSegments = [
                                  ...previewEmpRows.map(r => ({ ...r, isFuture: false })),
                                  { label: "Future headcount", value: PREVIEW_EMP.futureHeadcount, color: "var(--gray-5)", tooltip: null, isFuture: true },
                                ];
                                return (
                                  <>
                                    <Flex style={{ width: "100%", height: 8, gap: 2 }}>
                                      {allSegments.map(({ label, value, color, isFuture }, i) => {
                                        const isOnly = allSegments.length === 1;
                                        const isFirst = i === 0;
                                        const isLast = i === allSegments.length - 1;
                                        const borderRadius = isOnly ? 9999 : isFirst ? "9999px 0 0 9999px" : isLast ? "0 9999px 9999px 0" : 0;
                                        return (
                                          <Box
                                            key={label}
                                            ref={(el) => { if (el) previewEmpBarRefs.current.set(label, el as HTMLElement); else previewEmpBarRefs.current.delete(label); }}
                                            style={{ flex: value, height: 8 }}
                                            onMouseEnter={() => setPreviewEmpHovered(label)}
                                            onMouseLeave={() => setPreviewEmpHovered(null)}
                                          >
                                            <Box style={{
                                              width: "100%", height: "100%", background: color, borderRadius,
                                              ...(isFuture ? { backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.6) 4px, rgba(255,255,255,0.6) 5px)" } : {}),
                                              opacity: previewEmpHovered !== null && previewEmpHovered !== label ? 0.35 : 1,
                                              transition: "opacity 120ms ease",
                                              cursor: "default",
                                            }} />
                                          </Box>
                                        );
                                      })}
                                    </Flex>
                                    {/* Legend */}
                                    <Flex style={{ gap: 2, flexWrap: "wrap", marginTop: 10 }}>
                                      {allSegments.map(({ label, value, color, isFuture }) => (
                                        <Flex
                                          key={label}
                                          align="center"
                                          gap="1"
                                          style={{
                                            padding: "2px 6px 2px 4px", borderRadius: 9999, cursor: "default",
                                            opacity: previewEmpHovered !== null && previewEmpHovered !== label ? 0.35 : 1,
                                            background: previewEmpHovered === label ? "var(--gray-a3)" : "transparent",
                                            transition: "opacity 120ms ease, background 120ms ease",
                                          }}
                                          onMouseEnter={() => setPreviewEmpHovered(label)}
                                          onMouseLeave={() => setPreviewEmpHovered(null)}
                                        >
                                          <Box style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                                          <Text size="1" color="gray">{isFuture ? `+${value} future` : label}</Text>
                                          {!isFuture && <Text size="1" weight="medium" style={{ color: "var(--slate-12)" }}>{value.toLocaleString()}</Text>}
                                        </Flex>
                                      ))}
                                    </Flex>
                                  </>
                                );
                              })()}
                            </Box>

                            {/* Card 2: Workspace + desk changes */}
                            <Box style={{ ...GLASS_CARD_STYLE, borderRadius: 16, padding: "20px 24px", background: "white" }}>
                              <Heading as="h3" size="3" style={{ color: "var(--slate-12)", marginBottom: 20 }}>Workspace changes</Heading>

                              {/* Section: Workspace breakdown */}
                              <Box style={{ marginBottom: 24 }}>
                                <Text as="div" size="2" weight="medium" style={{ color: "var(--slate-12)", marginBottom: 14 }}>Workspace breakdown</Text>
                                {/* Column headers */}
                                <Grid columns="3" style={{ gap: 0, marginBottom: 16 }}>
                                  <Box />
                                  <Text size="1" weight="medium" style={{ color: "var(--gray-11)", textAlign: "center" }}>Current state</Text>
                                  <Text size="1" weight="medium" style={{ color: "var(--gray-11)", textAlign: "center" }}>Planned changes</Text>
                                </Grid>
                                {/* Assigned desks row */}
                                <Grid columns="3" style={{ gap: 0, alignItems: "center", marginBottom: 20 }}>
                                  <Box style={{ paddingRight: 12 }}>
                                    <Text size="2" style={{ color: "var(--slate-12)" }}>Assigned desks</Text>
                                    <Text as="div" size="1" color="gray">Employees with assigned desk / total desk spaces</Text>
                                  </Box>
                                  {/* Current donut */}
                                  <Flex direction="column" align="center" style={{ gap: 6 }}>
                                    <Box style={{ position: "relative", width: 96, height: 96 }}>
                                      <MultiDonutChart segments={[{ value: previewCur.assignedEmp, color: "var(--blue-9)" }]} total={previewCur.assignedSpaces} size={96} thickness={11} />
                                      <Box style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                        <Text className="data-viz-sm" style={{ fontSize: 16 }}>{previewCur.assignedEmp}</Text>
                                        <Text size="1" color="gray">/{previewCur.assignedSpaces}</Text>
                                      </Box>
                                    </Box>
                                    <Text size="1" color="gray">{previewCur.assignedEmp} emp · {previewCur.assignedSpaces} spaces</Text>
                                  </Flex>
                                  {/* Planned donut */}
                                  <Flex direction="column" align="center" style={{ gap: 6 }}>
                                    <Box style={{ position: "relative", width: 96, height: 96 }}>
                                      <MultiDonutChart segments={[{ value: previewPln.assignedEmp, color: previewOption.color }]} total={previewPln.assignedSpaces} size={96} thickness={11} />
                                      <Box style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                        <Text className="data-viz-sm" style={{ fontSize: 16 }}>{previewPln.assignedEmp}</Text>
                                        <Text size="1" color="gray">/{previewPln.assignedSpaces}</Text>
                                      </Box>
                                    </Box>
                                    <Flex align="center" style={{ gap: 4 }}>
                                      <Text size="1" color="gray">{previewPln.assignedEmp} emp · {previewPln.assignedSpaces} spaces</Text>
                                      {previewPln.assignedEmp !== previewCur.assignedEmp && (
                                        <Text size="1" style={{ color: previewPln.assignedEmp < previewCur.assignedEmp ? "var(--orange-11)" : "var(--green-11)", fontWeight: 500 }}>
                                          {previewPln.assignedEmp < previewCur.assignedEmp ? `−${previewCur.assignedEmp - previewPln.assignedEmp}` : `+${previewPln.assignedEmp - previewCur.assignedEmp}`}
                                        </Text>
                                      )}
                                    </Flex>
                                  </Flex>
                                </Grid>
                                {/* Coworking row */}
                                <Grid columns="3" style={{ gap: 0, alignItems: "center" }}>
                                  <Box style={{ paddingRight: 12 }}>
                                    <Text size="2" style={{ color: "var(--slate-12)" }}>Coworking spaces</Text>
                                    <Text as="div" size="1" color="gray">Employees in coworking / total coworking spaces</Text>
                                  </Box>
                                  <Flex direction="column" align="center" style={{ gap: 6 }}>
                                    <Box style={{ position: "relative", width: 96, height: 96 }}>
                                      <MultiDonutChart segments={[{ value: previewCur.coworkingEmp, color: "var(--purple-9)" }]} total={previewCur.coworkingSpaces} size={96} thickness={11} />
                                      <Box style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                        <Text className="data-viz-sm" style={{ fontSize: 16 }}>{previewCur.coworkingEmp}</Text>
                                        <Text size="1" color="gray">/{previewCur.coworkingSpaces}</Text>
                                      </Box>
                                    </Box>
                                    <Text size="1" color="gray">{previewCur.coworkingEmp} emp · {previewCur.coworkingSpaces} spaces</Text>
                                  </Flex>
                                  <Flex direction="column" align="center" style={{ gap: 6 }}>
                                    <Box style={{ position: "relative", width: 96, height: 96 }}>
                                      <MultiDonutChart segments={[{ value: previewPln.coworkingEmp, color: "var(--purple-9)" }]} total={previewPln.coworkingSpaces} size={96} thickness={11} />
                                      <Box style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                        <Text className="data-viz-sm" style={{ fontSize: 16 }}>{previewPln.coworkingEmp}</Text>
                                        <Text size="1" color="gray">/{previewPln.coworkingSpaces}</Text>
                                      </Box>
                                    </Box>
                                    <Flex align="center" style={{ gap: 4 }}>
                                      <Text size="1" color="gray">{previewPln.coworkingEmp} emp · {previewPln.coworkingSpaces} spaces</Text>
                                      {previewPln.coworkingEmp !== previewCur.coworkingEmp && (
                                        <Text size="1" style={{ color: previewPln.coworkingEmp > previewCur.coworkingEmp ? "var(--blue-11)" : "var(--orange-11)", fontWeight: 500 }}>
                                          {previewPln.coworkingEmp > previewCur.coworkingEmp ? `+${previewPln.coworkingEmp - previewCur.coworkingEmp}` : `−${previewCur.coworkingEmp - previewPln.coworkingEmp}`}
                                        </Text>
                                      )}
                                    </Flex>
                                  </Flex>
                                </Grid>
                              </Box>

                              <Box style={{ height: 1, background: "var(--gray-4)", margin: "0 -24px 24px" }} />

                              {/* Section: Desk allocation by category */}
                              <Box>
                                <Text as="div" size="2" weight="medium" style={{ color: "var(--slate-12)", marginBottom: 14 }}>Desk allocation by employee category</Text>
                                <Grid columns="3" style={{ gap: 0, marginBottom: 16 }}>
                                  <Box />
                                  <Text size="1" weight="medium" style={{ color: "var(--gray-11)", textAlign: "center" }}>Current state</Text>
                                  <Text size="1" weight="medium" style={{ color: "var(--gray-11)", textAlign: "center" }}>Planned changes</Text>
                                </Grid>
                                <Grid columns="3" style={{ gap: 0, alignItems: "start" }}>
                                  <Box style={{ paddingRight: 12, paddingTop: 6 }}>
                                    <Text size="2" style={{ color: "var(--slate-12)" }}>Assigned desks</Text>
                                    <Text as="div" size="1" color="gray">by employee category</Text>
                                    <Flex direction="column" style={{ gap: 5, marginTop: 12 }}>
                                      {previewCur.deskByCategory.map((d) => (
                                        <Flex key={d.label} align="center" style={{ gap: 5 }}>
                                          <Box style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                                          <Text size="1" color="gray">{d.label}</Text>
                                        </Flex>
                                      ))}
                                    </Flex>
                                  </Box>
                                  {/* Current category donut */}
                                  <Flex direction="column" align="center" style={{ gap: 6 }}>
                                    <Box style={{ position: "relative", width: 96, height: 96 }}>
                                      <MultiDonutChart segments={previewCur.deskByCategory} total={previewCur.assignedEmp} size={96} thickness={11} />
                                      <Box style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                        <Text className="data-viz-sm" style={{ fontSize: 16 }}>{previewCur.assignedEmp}</Text>
                                        <Text size="1" color="gray">desks</Text>
                                      </Box>
                                    </Box>
                                    <Flex direction="column" align="center" style={{ gap: 2 }}>
                                      {previewCur.deskByCategory.map((d) => (
                                        <Text key={d.label} size="1" color="gray">{d.label.split(" ")[0]}: {d.value}</Text>
                                      ))}
                                    </Flex>
                                  </Flex>
                                  {/* Planned category donut */}
                                  <Flex direction="column" align="center" style={{ gap: 6 }}>
                                    <Box style={{ position: "relative", width: 96, height: 96 }}>
                                      <MultiDonutChart segments={previewPln.deskByCategory} total={previewPln.assignedEmp} size={96} thickness={11} />
                                      <Box style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                        <Text className="data-viz-sm" style={{ fontSize: 16 }}>{previewPln.assignedEmp}</Text>
                                        <Text size="1" color="gray">desks</Text>
                                      </Box>
                                    </Box>
                                    <Flex direction="column" align="center" style={{ gap: 2 }}>
                                      {previewPln.deskByCategory.map((d) => (
                                        <Text key={d.label} size="1" color="gray">{d.label.split(" ")[0]}: {d.value}</Text>
                                      ))}
                                    </Flex>
                                  </Flex>
                                </Grid>
                              </Box>
                            </Box>
                          </Flex>
                      )}

                      {/* ── MAP VIEW ────────────────────────────────────────── */}
                      {previewView === "map" && (
                          <Box style={{ animation: "previewFadeUp 180ms ease-out both" }}>
                            {/* Controls */}
                            <Flex align="center" justify="between" style={{ marginBottom: 16 }}>
                              <Text size="2" color="gray">Drag to pan · Scroll to zoom</Text>
                              <Flex align="center" style={{ gap: 8 }}>
                                <Flex align="center" style={{ gap: 4, background: "rgba(255,255,255,0.8)", border: "0.5px solid var(--gray-5)", borderRadius: 9999, padding: "3px 6px" }}>
                                  <IconButton variant="ghost" color="gray" size="1" onClick={() => setMapZoom(z => Math.max(0.5, z - 0.25))} style={{ borderRadius: 9999 }}>
                                    <MinusIcon />
                                  </IconButton>
                                  <Text size="1" weight="medium" style={{ color: "var(--slate-12)", minWidth: 34, textAlign: "center" }}>{Math.round(mapZoom * 100)}%</Text>
                                  <IconButton variant="ghost" color="gray" size="1" onClick={() => setMapZoom(z => Math.min(3, z + 0.25))} style={{ borderRadius: 9999 }}>
                                    <PlusIcon />
                                  </IconButton>
                                </Flex>
                                <Flex align="center" style={{ gap: 4, background: "rgba(255,255,255,0.8)", border: "0.5px solid var(--gray-5)", borderRadius: 9999, padding: "3px 8px" }}>
                                  <IconButton variant="ghost" color="gray" size="1" onClick={() => setMapRotation(r => r - 90)} style={{ borderRadius: 9999 }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                  </IconButton>
                                  <Text size="1" weight="medium" style={{ color: "var(--slate-12)", minWidth: 28, textAlign: "center" }}>{((mapRotation % 360) + 360) % 360}°</Text>
                                  <IconButton variant="ghost" color="gray" size="1" onClick={() => setMapRotation(r => r + 90)} style={{ borderRadius: 9999 }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                                  </IconButton>
                                </Flex>
                                <button
                                  onClick={() => { setMapZoom(1); setMapRotation(0); }}
                                  style={{ padding: "5px 10px", background: "rgba(255,255,255,0.8)", border: "0.5px solid var(--gray-5)", borderRadius: 9999, color: "var(--gray-11)", fontSize: "var(--font-size-1)", fontFamily: "var(--font-body), system-ui", cursor: "pointer" }}
                                >
                                  Reset
                                </button>
                              </Flex>
                            </Flex>

                            {/* Zone legend */}
                            <Flex style={{ gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                              {Object.entries(ZONE_AA_COLORS).map(([label, color]) => (
                                <Flex key={label} align="center" style={{ gap: 6 }}>
                                  <Box style={{ width: 12, height: 12, borderRadius: 3, background: color, border: `1.5px solid ${ZONE_AA_BORDER[label]}` }} />
                                  <Text size="1" color="gray">{label}</Text>
                                </Flex>
                              ))}
                            </Flex>

                            {/* Two map panels */}
                            <Grid columns="2" style={{ gap: 16 }}>
                              {([
                                { title: "Current state", zones: previewCurrentZones },
                                { title: "Planned changes", zones: previewPlannedZones },
                              ] as { title: string; zones: MapZone[] }[]).map(({ title, zones }) => (
                                <Box key={title}>
                                  <Text as="div" size="2" weight="medium" style={{ color: "var(--slate-12)", marginBottom: 10 }}>{title}</Text>
                                  <Box style={{ borderRadius: 12, overflow: "hidden", background: "var(--gray-2)", border: "0.5px solid var(--gray-5)", aspectRatio: "1496/760" }}>
                                    <Box
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        transform: `scale(${mapZoom}) rotate(${mapRotation}deg)`,
                                        transformOrigin: "center center",
                                        transition: "transform 280ms ease",
                                        position: "relative",
                                      }}
                                    >
                                      <img
                                        src="/map_01.png"
                                        alt="Floor plan"
                                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none" }}
                                        draggable={false}
                                      />
                                      {/* Zone overlays */}
                                      {zones.map((zone) => (
                                        <Box
                                          key={zone.id}
                                          style={{
                                            position: "absolute",
                                            top: `${zone.top}%`,
                                            left: `${zone.left}%`,
                                            width: `${zone.width}%`,
                                            height: `${zone.height}%`,
                                            background: ZONE_AA_COLORS[zone.label],
                                            border: `1.5px solid ${ZONE_AA_BORDER[zone.label]}`,
                                            borderRadius: 4,
                                            transition: "all 400ms ease",
                                          }}
                                        >
                                          <Text
                                            size="1"
                                            style={{
                                              position: "absolute",
                                              top: 4,
                                              left: 5,
                                              color: ZONE_AA_BORDER[zone.label],
                                              fontWeight: 600,
                                              fontSize: 9,
                                              lineHeight: 1.2,
                                              maxWidth: "90%",
                                              pointerEvents: "none",
                                              userSelect: "none",
                                            }}
                                          >
                                            {zone.label.replace("Enterprise ", "")}
                                          </Text>
                                        </Box>
                                      ))}
                                    </Box>
                                  </Box>
                                </Box>
                              ))}
                            </Grid>
                          </Box>
                      )}
                      </Box>
                    </Box>
                  </div>
                </Box>
              )}

            </Box>
          )}
        </Box>,
        document.body
      )}

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
