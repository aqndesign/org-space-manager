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
  Strong,
  Text,
  TextArea,
  Tooltip,
} from "@radix-ui/themes";
import { ChevronDownIcon, ChevronLeftIcon, CheckCircledIcon, Cross2Icon, MagicWandIcon, MinusIcon, PlusIcon, MixerHorizontalIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { addPlan, getPlansByAA, getPlansByLocation, PLANS } from "@/lib/mock-data";
import { BlobCanvas } from "@/components/BlobCanvas";
import { NewPlanModal } from "@/components/NewPlanModal";
import { VoiceInputButton } from "@/components/VoiceInputButton";
import { useIsMobile } from "@/lib/use-is-mobile";
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
    <Link href={`/plans/${plan.id}?from=${view === "aa" ? "aa" : "location"}`} style={{ textDecoration: "none" }}>
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

// Cause line for the AI summary in the workspace-changes card, per option.
const REC_CHANGE_CAUSE: Record<1 | 2 | 3, string> = {
  1: "employees badging in fewer than 3 days per week move to drop-in seating instead of holding a dedicated desk",
  2: "seats consolidate into contiguous team neighborhoods, and desks that fall outside each team's zone are released",
  3: "desks re-anchor around each person's most frequent collaborators, and seats with low cross-team overlap are released",
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

// ── Preview: desk clusters measured from floorplan_01.png ────────────────────
// Each cluster is one physical desk pod (bench) drawn on the plan. x/y/w/h hug
// the drawn desk block (% of the 2816×1536 image) — chairs excluded — and
// cols×rows is the pod's seat grid. The floor's center (meeting rooms, core,
// kitchens) intentionally has no clusters, so zones can never cover rooms.
type DeskCluster = { id: string; band: "top" | "bottom" | "left" | "right"; x: number; y: number; w: number; h: number; cols: number; rows: number };

const DESK_CLUSTERS: DeskCluster[] = [
  // Top desk farm — double benches, 2 cols × 3 rows (T8a/T8b flank a planter spine)
  { id: "T1",  band: "top", x:  8.70, y: 2.3, w: 3.00, h: 11.0, cols: 2, rows: 3 },
  { id: "T2",  band: "top", x: 13.00, y: 2.3, w: 3.00, h: 11.0, cols: 2, rows: 3 },
  { id: "T3",  band: "top", x: 17.05, y: 2.3, w: 3.00, h: 11.0, cols: 2, rows: 3 },
  { id: "T4",  band: "top", x: 21.30, y: 2.3, w: 3.00, h: 11.0, cols: 2, rows: 3 },
  { id: "T5",  band: "top", x: 25.85, y: 2.3, w: 3.00, h: 11.0, cols: 2, rows: 3 },
  { id: "T6",  band: "top", x: 30.30, y: 2.3, w: 3.00, h: 11.0, cols: 2, rows: 3 },
  { id: "T7",  band: "top", x: 34.85, y: 2.3, w: 3.00, h: 11.0, cols: 2, rows: 3 },
  { id: "T8a", band: "top", x: 39.20, y: 2.3, w: 1.10, h: 11.0, cols: 1, rows: 3 },
  { id: "T8b", band: "top", x: 42.90, y: 2.3, w: 1.10, h: 11.0, cols: 1, rows: 3 },
  { id: "T9",  band: "top", x: 45.65, y: 2.3, w: 2.40, h: 11.0, cols: 2, rows: 3 },
  { id: "T10", band: "top", x: 52.00, y: 2.3, w: 2.30, h: 11.0, cols: 2, rows: 3 },
  { id: "T11", band: "top", x: 56.40, y: 2.3, w: 2.35, h: 11.0, cols: 2, rows: 3 },
  { id: "T12", band: "top", x: 61.00, y: 2.3, w: 2.30, h: 11.0, cols: 2, rows: 3 },
  { id: "T13", band: "top", x: 84.90, y: 2.3, w: 2.70, h: 11.0, cols: 2, rows: 3 },
  { id: "T14", band: "top", x: 89.40, y: 2.3, w: 1.20, h: 11.0, cols: 1, rows: 3 },
  // Bottom desk farm — quads, 2 cols × 2 rows
  { id: "B1",  band: "bottom", x:  2.20, y: 90.2, w: 4.10, h: 6.6, cols: 2, rows: 2 },
  { id: "B2",  band: "bottom", x:  8.40, y: 90.2, w: 4.10, h: 6.6, cols: 2, rows: 2 },
  { id: "B3",  band: "bottom", x: 14.60, y: 90.2, w: 4.00, h: 6.6, cols: 2, rows: 2 },
  { id: "B4",  band: "bottom", x: 20.80, y: 90.2, w: 4.00, h: 6.6, cols: 2, rows: 2 },
  { id: "B5",  band: "bottom", x: 27.00, y: 90.2, w: 4.00, h: 6.6, cols: 2, rows: 2 },
  { id: "B6",  band: "bottom", x: 38.50, y: 90.2, w: 4.00, h: 6.6, cols: 2, rows: 2 },
  { id: "B7",  band: "bottom", x: 44.70, y: 90.2, w: 4.00, h: 6.6, cols: 2, rows: 2 },
  { id: "B8",  band: "bottom", x: 51.00, y: 90.2, w: 4.00, h: 6.6, cols: 2, rows: 2 },
  { id: "B9",  band: "bottom", x: 57.20, y: 90.2, w: 4.00, h: 6.6, cols: 2, rows: 2 },
  { id: "B10", band: "bottom", x: 69.60, y: 90.2, w: 4.00, h: 6.6, cols: 2, rows: 2 },
  { id: "B11", band: "bottom", x: 75.70, y: 90.2, w: 4.00, h: 6.6, cols: 2, rows: 2 },
  { id: "B12", band: "bottom", x: 81.80, y: 90.2, w: 4.00, h: 6.6, cols: 2, rows: 2 },
  { id: "B13", band: "bottom", x: 87.90, y: 90.2, w: 4.00, h: 6.6, cols: 2, rows: 2 },
  // Left desk column — rows of 3, chairs above/below (L1 is a half pod)
  { id: "L1", band: "left", x: 1.20, y: 17.0, w: 6.10, h: 1.6, cols: 3, rows: 1 },
  { id: "L2", band: "left", x: 1.20, y: 23.3, w: 6.10, h: 2.9, cols: 3, rows: 2 },
  { id: "L3", band: "left", x: 1.20, y: 31.5, w: 6.10, h: 2.8, cols: 3, rows: 2 },
  { id: "L4", band: "left", x: 1.20, y: 40.0, w: 6.10, h: 3.5, cols: 3, rows: 2 },
  { id: "L5", band: "left", x: 1.20, y: 48.4, w: 6.10, h: 3.2, cols: 3, rows: 2 },
  { id: "L6", band: "left", x: 1.20, y: 56.1, w: 6.10, h: 3.0, cols: 3, rows: 2 },
  { id: "L7", band: "left", x: 1.20, y: 66.3, w: 6.10, h: 3.1, cols: 3, rows: 2 },
  { id: "L8", band: "left", x: 1.20, y: 73.7, w: 6.10, h: 2.9, cols: 3, rows: 2 },
  { id: "L9", band: "left", x: 1.20, y: 81.7, w: 6.10, h: 2.9, cols: 3, rows: 2 },
  // Right desk column — rows of 3, interrupted mid-column by the AA conference room
  { id: "R1", band: "right", x: 92.40, y: 20.8, w: 6.00, h: 2.8, cols: 3, rows: 2 },
  { id: "R2", band: "right", x: 92.40, y: 28.9, w: 6.00, h: 2.8, cols: 3, rows: 2 },
  { id: "R3", band: "right", x: 92.40, y: 36.5, w: 6.00, h: 2.8, cols: 3, rows: 2 },
  { id: "R4", band: "right", x: 92.40, y: 44.2, w: 6.00, h: 2.8, cols: 3, rows: 2 },
  { id: "R5", band: "right", x: 92.40, y: 66.5, w: 6.00, h: 2.8, cols: 3, rows: 2 },
  { id: "R6", band: "right", x: 92.40, y: 74.0, w: 6.00, h: 2.8, cols: 3, rows: 2 },
  { id: "R7", band: "right", x: 92.40, y: 81.4, w: 6.00, h: 2.8, cols: 3, rows: 2 },
];

// Which team occupies each pod, per scenario. Pods left out are open/coworking.
type TeamAssignment = Record<string, string | undefined>;

const podIds = (prefix: string, from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `${prefix}${from + i}`);
const TOP_MAIN_PODS = [...podIds("T", 1, 7), "T8a", "T8b", ...podIds("T", 9, 12)];
const assignPods = (spec: [string[], string][]): TeamAssignment =>
  Object.fromEntries(spec.flatMap(([ids, team]) => ids.map((id) => [id, team] as const)));

const CLUSTER_TEAMS: { current: TeamAssignment; planned: Record<1 | 2 | 3, TeamAssignment> } = {
  current: assignPods([
    [TOP_MAIN_PODS, "Enterprise Products"],
    [podIds("L", 1, 9), "Enterprise Analytics"],
    [podIds("R", 1, 7), "Enterprise Solutions"],
    [podIds("B", 1, 9), "Enterprise Ticketing"],
  ]),
  planned: {
    // In-person time priority — neighborhoods contract, freeing pods for drop-in.
    1: assignPods([
      [podIds("T", 1, 7), "Enterprise Products"],
      [podIds("L", 1, 6), "Enterprise Analytics"],
      [podIds("R", 1, 4), "Enterprise Solutions"],
      [podIds("B", 1, 6), "Enterprise Ticketing"],
    ]),
    // Team colocation priority — every pod assigned, Solutions annexes the top-right pods.
    2: assignPods([
      [TOP_MAIN_PODS, "Enterprise Products"],
      [podIds("L", 1, 9), "Enterprise Analytics"],
      [[...podIds("R", 1, 7), "T13", "T14"], "Enterprise Solutions"],
      [podIds("B", 1, 13), "Enterprise Ticketing"],
    ]),
    // XFN collaboration priority — teams interleave across bands.
    3: assignPods([
      [podIds("T", 1, 6), "Enterprise Products"],
      [["T7", "T8a", "T8b", ...podIds("T", 9, 12)], "Enterprise Solutions"],
      [podIds("L", 1, 4), "Enterprise Analytics"],
      [podIds("L", 5, 9), "Enterprise Products"],
      [podIds("R", 1, 4), "Enterprise Ticketing"],
      [podIds("R", 5, 7), "Enterprise Solutions"],
      [podIds("B", 1, 6), "Enterprise Analytics"],
      [podIds("B", 7, 13), "Enterprise Ticketing"],
    ]),
  },
};

type TeamBlock = { team: string; x: number; y: number; w: number; h: number };
type TeamDesk = { team: string; x: number; y: number; w: number; h: number; name: string; open: boolean };

// Unified zone blocks: bounding boxes of contiguous same-team pod runs within a
// band. A run breaks at unassigned pods and at large gaps (printer nooks, the
// AA room, wall dividers), so blocks never stretch over non-desk space.
function computeTeamBlocks(assign: TeamAssignment): TeamBlock[] {
  const blocks: TeamBlock[] = [];
  for (const band of ["top", "bottom", "left", "right"] as const) {
    const horiz = band === "top" || band === "bottom";
    const pods = DESK_CLUSTERS.filter((c) => c.band === band).sort((a, b) => (horiz ? a.x - b.x : a.y - b.y));
    const gapLimit = horiz ? 4.5 : 6.5;
    const padX = horiz ? 0.8 : 0.4;   // horizontal bands have chairs at pod sides
    const padY = horiz ? 0.5 : 1.2;   // vertical bands have chairs above/below rows
    let run: DeskCluster[] = [];
    let team: string | undefined;
    const flush = () => {
      if (run.length && team) {
        const x0 = Math.min(...run.map((c) => c.x));
        const y0 = Math.min(...run.map((c) => c.y));
        const x1 = Math.max(...run.map((c) => c.x + c.w));
        const y1 = Math.max(...run.map((c) => c.y + c.h));
        blocks.push({ team, x: x0 - padX, y: y0 - padY, w: x1 - x0 + padX * 2, h: y1 - y0 + padY * 2 });
      }
      run = [];
      team = undefined;
    };
    for (const c of pods) {
      const t = assign[c.id];
      if (!t) { flush(); continue; }
      const prev = run[run.length - 1];
      const gap = prev ? (horiz ? c.x - (prev.x + prev.w) : c.y - (prev.y + prev.h)) : 0;
      if (team !== t || gap > gapLimit) flush();
      team = t;
      run.push(c);
    }
    flush();
  }
  return blocks;
}

const EMP_FIRST = ["Ava", "Liam", "Maya", "Noah", "Zoe", "Ethan", "Ivy", "Lucas", "Nora", "Owen", "Mia", "Eli", "Ruby", "Jack", "Lena", "Theo", "Isla", "Finn", "Aria", "Cole", "Nina", "Rhys", "Tara", "Jude"];
const EMP_LAST = ["Tran", "Kimura", "Patel", "Nguyen", "Chen", "Garcia", "Silva", "Khan", "Sato", "Lopez", "Mori", "Shah", "Park", "Diaz", "Wong", "Reyes", "Cruz", "Ito", "Vu", "Han", "Osei", "Bell", "Nair", "Cho"];
const EMPLOYEE_NAMES = Array.from(
  { length: 288 },
  (_, i) => `${EMP_FIRST[i % EMP_FIRST.length]} ${EMP_LAST[(i * 5 + Math.floor(i / 24) * 7 + 3) % EMP_LAST.length]}`,
);

// Per-desk highlights: split each assigned pod into its seat grid. A slice of
// seats stays open so the zoomed-in view reads as a believable seating chart.
function computeTeamDesks(assign: TeamAssignment): TeamDesk[] {
  const desks: TeamDesk[] = [];
  let seat = 0;
  for (const c of DESK_CLUSTERS) {
    const team = assign[c.id];
    if (!team) continue;
    const cw = c.w / c.cols;
    const ch = c.h / c.rows;
    for (let r = 0; r < c.rows; r++) {
      for (let col = 0; col < c.cols; col++) {
        const open = seat % 9 === 5;
        desks.push({
          team,
          x: c.x + col * cw + cw * 0.07,
          y: c.y + r * ch + ch * 0.1,
          w: cw * 0.86,
          h: ch * 0.8,
          name: EMPLOYEE_NAMES[seat % EMPLOYEE_NAMES.length],
          open,
        });
        seat++;
      }
    }
  }
  return desks;
}

const TEAM_BLOCKS = {
  current: computeTeamBlocks(CLUSTER_TEAMS.current),
  planned: {
    1: computeTeamBlocks(CLUSTER_TEAMS.planned[1]),
    2: computeTeamBlocks(CLUSTER_TEAMS.planned[2]),
    3: computeTeamBlocks(CLUSTER_TEAMS.planned[3]),
  },
};
const TEAM_DESKS = {
  current: computeTeamDesks(CLUSTER_TEAMS.current),
  planned: {
    1: computeTeamDesks(CLUSTER_TEAMS.planned[1]),
    2: computeTeamDesks(CLUSTER_TEAMS.planned[2]),
    3: computeTeamDesks(CLUSTER_TEAMS.planned[3]),
  },
};

// Letterboxes children to the floor plan's aspect ratio within whatever space
// the host box gets — needed because the split sections resize freely.
function FitBox({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      const ratio = 2816 / 1536;
      let w = r.width, h = w / ratio;
      if (h > r.height) { h = r.height; w = h * ratio; }
      setSize(w > 40 ? { w, h } : null);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={hostRef} onClick={onClick} style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", ...style }}>
      {size && <div style={{ width: size.w, height: size.h, position: "relative", flexShrink: 0 }}>{children}</div>}
    </div>
  );
}

// Floor plan image + zone overlays. Blocks and desks crossfade based on
// deskMode, so zooming in swaps unified team zones for per-desk highlights.
function FloorMapSurface({ blocks, desks, deskMode }: { blocks: TeamBlock[]; desks?: TeamDesk[] | null; deskMode?: boolean }) {
  return (
    <>
      <img
        src="/floorplan_01.png"
        alt="Floor plan"
        draggable={false}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", userSelect: "none", pointerEvents: "none" }}
      />
      <div style={{ position: "absolute", inset: 0, opacity: deskMode ? 0 : 1, transition: "opacity 220ms ease", pointerEvents: "none" }}>
        {blocks.map((b, i) => (
          <div
            key={`${b.team}-${i}`}
            style={{ position: "absolute", top: `${b.y}%`, left: `${b.x}%`, width: `${b.w}%`, height: `${b.h}%`, background: ZONE_AA_COLORS[b.team], border: `1.5px solid ${ZONE_AA_BORDER[b.team]}`, borderRadius: 6 }}
          >
            <span style={{ position: "absolute", top: 3, left: 5, right: 4, color: ZONE_AA_BORDER[b.team], fontWeight: 600, fontSize: 9, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", userSelect: "none" }}>
              {b.team.replace("Enterprise ", "")}
            </span>
          </div>
        ))}
      </div>
      {desks && (
        <div style={{ position: "absolute", inset: 0, opacity: deskMode ? 1 : 0, transition: "opacity 220ms ease", pointerEvents: deskMode ? "auto" : "none" }}>
          {desks.map((dk, i) => (
            <div
              key={i}
              title={dk.open ? "Open desk" : `${dk.name} · ${dk.team.replace("Enterprise ", "")}`}
              style={{
                position: "absolute",
                top: `${dk.y}%`,
                left: `${dk.x}%`,
                width: `${dk.w}%`,
                height: `${dk.h}%`,
                background: dk.open ? "rgba(120,127,140,0.14)" : ZONE_AA_COLORS[dk.team],
                border: dk.open ? "1px dashed rgba(120,127,140,0.55)" : `1px solid ${ZONE_AA_BORDER[dk.team]}`,
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

const COLLAPSIBLE_FILTERS = ['evaluation', 'status', 'location', 'aa'] as const;
type CollapsibleFilter = (typeof COLLAPSIBLE_FILTERS)[number];

// Cross-plan suggestion pills for the landing composer; the details page
// has its own plan-scoped set.
const LANDING_PROMPTS = [
  "What needs my attention first?",
  "Which locations are over capacity?",
  "How does utilization compare across AAs?",
  "Which plans are awaiting approval?",
];

/* ─── Assistant: what needs attention, surfaced after the intro ── */
// Intro pacing: the greeting rise + gradient sweep + subtitle (.intro-*
// delays in globals.css) settle by ~1.4s; the assistant then thinks for a
// beat and surfaces the attention highlight.
const ATTENTION_THINK_AT = 1600;
const ATTENTION_SHOW_AT = 2700;

// Workflow states that are waiting on someone, in badge colors matching
// StatusBadge. Capacity is deliberately not a group — every mock plan is
// over capacity, so only the sharpest squeeze is called out below.
const ATTENTION_GROUPS: { status: PlanStatus; label: string; color: "orange" | "blue" | "gray" }[] = [
  { status: "Submitted", label: "Awaiting approval", color: "orange" },
  { status: "Policy draft", label: "Criteria decisions needed", color: "blue" },
  { status: "Plan draft", label: "Not yet published", color: "gray" },
];

function AttentionCard({ plans }: { plans: Plan[] }) {
  const groups = ATTENTION_GROUPS
    .map((g) => ({ ...g, items: plans.filter((p) => p.status === g.status) }))
    .filter((g) => g.items.length > 0);
  // The location feeling the squeeze hardest: largest gap between core staff
  // (full-time + part-time, the optimizer's baseline) and desk capacity.
  const worst = plans.reduce<{ plan: Plan; core: number; capacity: number } | null>((acc, p) => {
    const core = p.employeeAssessment.fullTime + p.employeeAssessment.partTime;
    const capacity = p.workspaceAssessment.assignedDesks + p.workspaceAssessment.availableDesks;
    return core - capacity > (acc ? acc.core - acc.capacity : 0) ? { plan: p, core, capacity } : acc;
  }, null);

  return (
    <Flex direction="column" align="start" className="chat-bubble">
      {/* Light bubble: gray-2 + hairline border keeps definition on the white
          panel while leaving text and badges enough contrast */}
      <Box px="3" py="3" style={{ background: "var(--gray-2)", border: "0.5px solid var(--gray-4)", borderRadius: "16px 16px 16px 4px", width: "100%" }}>
        {groups.length === 0 ? (
          <Text as="div" size="2" style={{ lineHeight: 1.5 }}>
            {/* {" "} — this Next's JSX transform eats a trailing text child's
                leading space after an expression, so spell it out */}
            I looked across all {plans.length}{" "}plans — nothing is waiting on anyone right now.
          </Text>
        ) : (
          <>
            <Text as="div" size="2" style={{ marginBottom: 8, lineHeight: 1.5 }}>
              I looked across all {plans.length}{" "}plans so you don&apos;t have to — here&apos;s what needs attention:
            </Text>
            <Flex direction="column" gap="2">
              {groups.map((g) => (
                <Flex key={g.status} direction="column" gap="1">
                  <Flex align="center" justify="between" gap="2">
                    <Text size="1" color="gray" highContrast>{g.label}</Text>
                    <Badge color={g.color} variant="soft" radius="full" highContrast>{g.items.length}</Badge>
                  </Flex>
                  <Flex wrap="wrap" gap="1">
                    {g.items.map((p) => (
                      <Button key={p.id} asChild size="1" variant="surface" radius="full" style={{ fontWeight: "var(--font-weight-regular)" }}>
                        <Link href={`/plans/${p.id}`}>
                          {p.allocationArea} · {p.workLocation}
                        </Link>
                      </Button>
                    ))}
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </>
        )}
        {worst && (
          <>
            <Separator size="4" my="2" />
            <Text as="div" size="1" color="gray" highContrast style={{ lineHeight: 1.5 }}>
              Sharpest capacity squeeze: <Strong>{worst.plan.allocationArea}</Strong> at <Strong>{worst.plan.workLocation}</Strong> — {worst.core} core staff for {worst.capacity}{" "}desks. Open any plan and I&apos;ll take it from there.
            </Text>
          </>
        )}
      </Box>
    </Flex>
  );
}

export default function LandingPage() {
  const bannerLottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => { bannerLottieRef.current?.setSpeed(0.4); }, []);

  const [bannerVisible, setBannerVisible] = useState(true);
  const [bannerExpanded, setBannerExpanded] = useState(false);

  const [view, setView] = useState<"location" | "aa">("location");
  const [agentOpen, setAgentOpen] = useState(false);
  const isMobile = useIsMobile();

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
  // The timeout is a fallback for hidden/background tabs where rAF never fires.
  useEffect(() => {
    if (agentOpen) {
      const id = requestAnimationFrame(() => setAgentPanelVisible(true));
      const fallback = setTimeout(() => setAgentPanelVisible(true), 80);
      return () => {
        cancelAnimationFrame(id);
        clearTimeout(fallback);
      };
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

  // After the intro settles, the assistant thinks for a beat and then surfaces
  // the attention highlight. Transitions are monotonic (never back to
  // "thinking") so a user message can fast-forward past pending timers.
  const [attentionStage, setAttentionStage] = useState<"hidden" | "thinking" | "shown">("hidden");
  useEffect(() => {
    if (!agentOpen || attentionStage === "shown") return;
    const think = setTimeout(() => setAttentionStage((s) => (s === "shown" ? s : "thinking")), ATTENTION_THINK_AT);
    const show = setTimeout(() => setAttentionStage("shown"), ATTENTION_SHOW_AT);
    return () => {
      clearTimeout(think);
      clearTimeout(show);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentOpen]);

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
  const [recPhase, setRecPhase] = useState<"idle" | "expanding" | "content" | "closing">("idle");
  const [recIsExpanded, setRecIsExpanded] = useState(false);
  const [recRect, setRecRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [contentFaded, setContentFaded] = useState(false);

  // ── Preview level within the rec modal ───────────────────────────────────────
  const [previewOption, setPreviewOption] = useState<{ num: 1 | 2 | 3; label: string; color: string } | null>(null);
  const [previewView, setPreviewView] = useState<"data" | "map">("data");
  const [previewEmpHovered, setPreviewEmpHovered] = useState<string | null>(null);
  const previewEmpBarRefs = useRef<Map<string, HTMLElement>>(new Map());
  const previewOptionRef = useRef<{ num: 1 | 2 | 3; label: string; color: string } | null>(null);

  // ── Preview sub-header height — the floor-map card must clear it, unlike the
  // Summary view which intentionally scrolls underneath its blur ──────────────
  const subHeaderRef = useRef<HTMLDivElement>(null);
  const [subHeaderH, setSubHeaderH] = useState(76);
  useLayoutEffect(() => {
    const el = subHeaderRef.current;
    if (!el || !previewOption) return;
    setSubHeaderH(el.offsetHeight);
    const ro = new ResizeObserver(() => setSubHeaderH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [previewOption]);

  // ── Floor map: resizable split + click-to-expand pan/zoom state ────────────
  const [splitPct, setSplitPct] = useState(50);
  const splitRef = useRef<HTMLDivElement>(null);
  const [expandedPanel, setExpandedPanel] = useState<"current" | "planned" | null>(null);
  const expandedPanelRef = useRef<"current" | "planned" | null>(null);
  const [expZoom, setExpZoom] = useState(1);
  const [expRotation, setExpRotation] = useState(0);
  const [expPan, setExpPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panDragRef = useRef<{ px: number; py: number; bx: number; by: number } | null>(null);
  const expCanvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recPhase === "idle") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (expandedPanelRef.current) {
          collapseMap();
        } else if (previewOptionRef.current) {
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

  // Wheel-zoom inside the expanded floor map. Attached manually because React
  // registers wheel listeners as passive, which would forbid preventDefault.
  useEffect(() => {
    if (!expandedPanel) return;
    const el = expCanvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setExpZoom((z) => Math.min(4, Math.max(0.5, z * Math.exp(-e.deltaY * 0.0016))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [expandedPanel]);

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
    setRecPhase("closing");                          // step 1: cards + header exit
    setTimeout(() => {
      setRecPhase("expanding");                      // step 2: modal frame shrinks — page stays hidden
      setRecIsExpanded(false);
      setTimeout(() => {
        setRecPhase("idle");                         // step 3: portal unmounts…
        setRecRect(null);
        setRecTitle(null);
        setContentFaded(false);                      // …then page fades in (visible now that modal is gone)
      }, 280);
    }, 380);                                         // opt1 exits last: 160ms delay + 200ms anim = 360ms + 20ms grace
  }

  function openPreview(num: 1 | 2 | 3, label: string, color: string) {
    const opt = { num, label, color };
    previewOptionRef.current = opt;
    setPreviewOption(opt);
    setPreviewView("data");
    setSplitPct(50);
    collapseMap();
  }

  function closePreview() {
    previewOptionRef.current = null;
    setPreviewOption(null);
    collapseMap();
  }

  // ── Floor map interactions ─────────────────────────────────────────────────
  function expandMap(panel: "current" | "planned") {
    expandedPanelRef.current = panel;
    setExpandedPanel(panel);
    setExpZoom(1);
    setExpRotation(0);
    setExpPan({ x: 0, y: 0 });
  }

  function collapseMap() {
    expandedPanelRef.current = null;
    setExpandedPanel(null);
    setExpZoom(1);
    setExpRotation(0);
    setExpPan({ x: 0, y: 0 });
    setIsPanning(false);
    panDragRef.current = null;
  }

  function onMapPanStart(e: React.PointerEvent<HTMLDivElement>) {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* inactive pointer id — drag still works via event bubbling */ }
    panDragRef.current = { px: e.clientX, py: e.clientY, bx: expPan.x, by: expPan.y };
    setIsPanning(true);
  }

  function onMapPanMove(e: React.PointerEvent<HTMLDivElement>) {
    const p = panDragRef.current;
    if (!p) return;
    setExpPan({ x: p.bx + (e.clientX - p.px), y: p.by + (e.clientY - p.py) });
  }

  function onMapPanEnd() {
    panDragRef.current = null;
    setIsPanning(false);
  }

  function onSplitDragStart(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    const host = splitRef.current;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const move = (ev: PointerEvent) => {
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.min(72, Math.max(28, pct)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
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

  function sendAgentMessage(text?: string) {
    const content = (text ?? agentInput).trim();
    if (!content) return;
    setAttentionStage("shown"); // user takes the lead — skip the thinking beat
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

  // Mobile surfaces only live plans — their Insights page is the one
  // experience that works at phone density.
  const filteredPlans = plans.filter(p =>
    (!isMobile || p.status === "Live") &&
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
  const previewAssignedDelta = previewPln ? previewPln.assignedEmp - previewCur.assignedEmp : 0;
  const previewCoworkDelta = previewPln ? previewPln.coworkingEmp - previewCur.coworkingEmp : 0;
  const previewEmpTotal = PREVIEW_EMP.fullTime + PREVIEW_EMP.inboundEmbeds + PREVIEW_EMP.outboundEmbeds + PREVIEW_EMP.contingent + PREVIEW_EMP.interns + PREVIEW_EMP.futureHeadcount;
  const previewEmpRows: { label: string; value: number; color: string; tooltip: string | null }[] = [
    { label: "Full-time", value: PREVIEW_EMP.fullTime, color: "var(--blue-9)", tooltip: null },
    { label: "Inbound embeds", value: PREVIEW_EMP.inboundEmbeds, color: "var(--purple-9)", tooltip: "Employees from other teams embedded within this allocation area" },
    { label: "Outbound embeds", value: PREVIEW_EMP.outboundEmbeds, color: "var(--violet-9)", tooltip: "Employees from this area embedded in other teams' spaces" },
    { label: "Contingent workers", value: PREVIEW_EMP.contingent, color: "var(--orange-9)", tooltip: null },
    { label: "Interns", value: PREVIEW_EMP.interns, color: "var(--green-9)", tooltip: null },
  ];
  const previewCurrentBlocks = TEAM_BLOCKS.current;
  const previewPlannedBlocks = previewOption ? TEAM_BLOCKS.planned[previewOption.num] : TEAM_BLOCKS.current;
  const expandedBlocks = expandedPanel === "current" ? previewCurrentBlocks : previewPlannedBlocks;
  const expandedDesks = expandedPanel === "current"
    ? TEAM_DESKS.current
    : previewOption ? TEAM_DESKS.planned[previewOption.num] : TEAM_DESKS.current;
  const deskDetail = expZoom >= 1.75;

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
          {/* Scrollable content — left edge retracts to make room for the panel,
              which sits on the left to match the plan details page */}
          <Box className="scrollable-content" style={{ position: "absolute", top: 0, left: agentPanelVisible ? 376 : 0, bottom: 0, right: 0, overflowY: "auto", opacity: contentFaded ? 0 : 1, pointerEvents: contentFaded ? "none" : undefined, transition: "opacity 250ms ease-in-out, left 300ms ease-in-out" }}>
        <Box
          px="2"
          pt="2"
          pb={{ initial: "4", sm: "6" }}
          style={{
            maxWidth: 1400,
            margin: "0 auto",
          }}
        >
          <Flex direction="column" gap="4">
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
                  borderRadius: "28px 32px 28px 28px",
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
                left: 8,
                bottom: 8,
                width: 360,
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                background: "rgba(255, 255, 255, 0.72)",
                backdropFilter: "blur(28px) saturate(1.8) brightness(1.04)",
                WebkitBackdropFilter: "blur(28px) saturate(1.8) brightness(1.04)",
                borderTop: "0.5px solid rgba(255,255,255,0.88)",
                borderLeft: "0.5px solid rgba(255,255,255,0.42)",
                borderRight: "0.5px solid rgba(255,255,255,0.72)",
                borderBottom: "0.5px solid rgba(255,255,255,0.32)",
                borderRadius: 20,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.92)",
                overflow: "hidden",
                transform: agentPanelVisible ? "translateX(0)" : "translateX(calc(-100% - 8px))",
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
                {/* Intro sequence — same staging as the plan details page:
                    greeting rises, its gradient sweeps, the subtitle follows */}
                <Flex direction="column" align="center" gap="2" py="6">
                  <Text size="5" weight="bold" className="intro-rise" style={{ fontFamily: "var(--font-heading)", textAlign: "center" }}>
                    <span className="intro-gradient">Hi, I&apos;m your Campus assistant!</span>
                  </Text>
                  <Text size="1" color="gray" align="center" className="intro-rise intro-rise-subtitle">Ask me anything about your space plans, desk utilization, or allocation areas.</Text>
                </Flex>

                {/* Progressive disclosure: a thinking beat, then the highlight
                    of what needs attention across all plans */}
                {attentionStage === "thinking" && (
                  <Flex direction="column" align="start" className="chat-bubble" aria-live="polite">
                    <Flex align="center" gap="1" px="3" py="2" style={{ background: "var(--gray-2)", border: "0.5px solid var(--gray-4)", borderRadius: "16px 16px 16px 4px" }} aria-label="Assistant is thinking">
                      <Box as="span" className="think-dot" />
                      <Box as="span" className="think-dot" />
                      <Box as="span" className="think-dot" />
                    </Flex>
                  </Flex>
                )}
                {attentionStage === "shown" && <AttentionCard plans={plans} />}

                {agentMessages.map((msg, i) => (
                  <Flex key={i} direction="column" align={msg.role === "user" ? "end" : "start"}>
                    <Box
                      px="3"
                      py="2"
                      style={{
                        background: msg.role === "user" ? "var(--blue-9)" : "var(--gray-2)",
                        border: msg.role === "user" ? undefined : "0.5px solid var(--gray-4)",
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

            {/* Suggested prompts — one horizontal row above the composer,
                disclosed together with the attention highlight */}
            {attentionStage === "shown" && (
              <Box px="4" pb="2" className="chat-bubble" style={{ flexShrink: 0 }}>
                <div className="prompt-row">
                  {LANDING_PROMPTS.map((p) => (
                    <button key={p} className="prompt-pill" onClick={() => sendAgentMessage(p)}>
                      {p}
                    </button>
                  ))}
                </div>
              </Box>
            )}

            {/* Composer — brand-gradient glow behind a borderless surface */}
            <Box px="4" pt="2" pb="4" style={{ flexShrink: 0, borderRadius: "0 0 20px 20px" }}>
              <Box className="composer-glow">
                <Flex direction="column" className="composer-surface">
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
                    style={{ resize: "none", minHeight: 52 }}
                  />
                  <Flex justify="end" align="center" gap="3" px="2" pb="2">
                    <VoiceInputButton value={agentInput} onValueChange={setAgentInput} />
                    <IconButton size="2" radius="full" className="btn-primary btn-send" onClick={() => sendAgentMessage()} disabled={!agentInput.trim()} aria-label="Send message">
                      <PaperPlaneIcon />
                    </IconButton>
                  </Flex>
                </Flex>
              </Box>
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
          {(recPhase === "content" || recPhase === "closing") && (
            <Box style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", zIndex: 1, overflow: "hidden" }}>
              {/* Modal header */}
              <Box style={{ padding: "28px 16px 24px", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(24px) saturate(1.8)", WebkitBackdropFilter: "blur(24px) saturate(1.8)", borderBottom: "0.5px solid var(--gray-5)", flexShrink: 0, animation: "recHeaderIn 250ms ease-in-out 350ms both" }}>
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

              {/* ── Body: no container-level fade — each card owns its own exit animation */}
              <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>


              {/* ── Main level: options grid ──────────────────────────── */}
              {!previewOption && <ScrollArea style={{ flex: 1 }}>
                <Box style={{ padding: 16, display: "flex", flexDirection: "column", minHeight: "100%" }}>
                  <Grid columns={{ initial: "1", md: "3" }} style={{ alignItems: "stretch", gap: 16, flex: 1 }}>

                    {/* Option 1: In-Person Frequency Priority */}
                    <Flex key={recPhase === "closing" ? "opt1-c" : "opt1-o"} direction="column" style={{ ...GLASS_CARD_STYLE, background: "color-mix(in srgb, color-mix(in srgb, var(--blue-3) 56%, white) 72%, transparent)", borderRadius: 16, animation: recPhase === "closing" ? "recItemOut 200ms ease-in 160ms both" : "recItemIn 200ms ease-out 80ms both" }}>
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
                          Employees are segmented by badge-in frequency.
                          Assigned desks go to those who come in at least{" "}
                          <Text weight="medium" style={{ color: "var(--slate-12)" }}>3 days per week</Text>.
                          Everyone else shifts to drop-in or coworking zones at the same location.
                        </Text>
                        <Box style={{ marginTop: 8 }}>
                          <Heading as="h3" size="2" style={{ color: "var(--slate-12)", marginBottom: 10 }}>Outcome</Heading>
                          <Box style={{ background: "var(--green-2)", borderRadius: 12, padding: "12px 14px" }}>
                            <Flex direction="column" gap="2">
                              {["Desk assignments reflect actual usage patterns", "Rewards consistent in-person culture", "Frees up desks for future headcount growth"].map((pro) => (
                                <Flex key={pro} align="start" style={{ gap: 4 }}>
                                  <Box style={{ display: "inline-flex", alignItems: "center", height: 20, flexShrink: 0, marginTop: 2 }}>
                                    <CheckCircledIcon width={15} height={15} style={{ color: "var(--green-10)" }} />
                                  </Box>
                                  <Text size="2" style={{ color: "var(--slate-12)" }}>{pro}</Text>
                                </Flex>
                              ))}
                            </Flex>
                          </Box>
                          <Box style={{ background: "var(--red-2)", borderRadius: 12, padding: "12px 14px", marginTop: 8 }}>
                            <Flex direction="column" gap="2">
                              {["Some employees may lose their assigned desk", "Relies on accurate badge-in data availability"].map((con) => (
                                <Flex key={con} align="start" style={{ gap: 4 }}>
                                  <Box style={{ display: "inline-flex", alignItems: "center", height: 20, flexShrink: 0, marginTop: 2 }}>
                                    <Cross2Icon width={13} height={13} style={{ color: "var(--red-10)" }} />
                                  </Box>
                                  <Text size="2" style={{ color: "var(--slate-12)" }}>{con}</Text>
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
                    <Flex key={recPhase === "closing" ? "opt2-c" : "opt2-o"} direction="column" style={{ ...GLASS_CARD_STYLE, background: "color-mix(in srgb, color-mix(in srgb, var(--purple-3) 56%, white) 72%, transparent)", borderRadius: 16, animation: recPhase === "closing" ? "recItemOut 200ms ease-in 80ms both" : "recItemIn 200ms ease-out 180ms both" }}>
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
                          Employees in the same allocation area are grouped into dedicated floor zones at {recTitle}.
                          Teams sit in contiguous neighborhoods, maximizing proximity for standups and collaboration.
                          Overflow headcount is redistributed to the nearest compatible office.
                        </Text>
                        <Box style={{ marginTop: 8 }}>
                          <Heading as="h3" size="2" style={{ color: "var(--slate-12)", marginBottom: 10 }}>Outcome</Heading>
                          <Box style={{ background: "var(--green-2)", borderRadius: 12, padding: "12px 14px" }}>
                            <Flex direction="column" gap="2">
                              {["Strong team identity and colocation on office days", "Easy for teammates to find each other", "Simplifies desk management and onboarding"].map((pro) => (
                                <Flex key={pro} align="start" style={{ gap: 4 }}>
                                  <Box style={{ display: "inline-flex", alignItems: "center", height: 20, flexShrink: 0, marginTop: 2 }}>
                                    <CheckCircledIcon width={15} height={15} style={{ color: "var(--green-10)" }} />
                                  </Box>
                                  <Text size="2" style={{ color: "var(--slate-12)" }}>{pro}</Text>
                                </Flex>
                              ))}
                            </Flex>
                          </Box>
                          <Box style={{ background: "var(--red-2)", borderRadius: 12, padding: "12px 14px", marginTop: 8 }}>
                            <Flex direction="column" gap="2">
                              {["May require displacing some teams to other locations", "Needs coordinated agreement across team leaders and planners"].map((con) => (
                                <Flex key={con} align="start" style={{ gap: 4 }}>
                                  <Box style={{ display: "inline-flex", alignItems: "center", height: 20, flexShrink: 0, marginTop: 2 }}>
                                    <Cross2Icon width={13} height={13} style={{ color: "var(--red-10)" }} />
                                  </Box>
                                  <Text size="2" style={{ color: "var(--slate-12)" }}>{con}</Text>
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
                    <Flex key={recPhase === "closing" ? "opt3-c" : "opt3-o"} direction="column" style={{ ...GLASS_CARD_STYLE, background: "color-mix(in srgb, color-mix(in srgb, var(--teal-3) 56%, white) 72%, transparent)", borderRadius: 16, animation: recPhase === "closing" ? "recItemOut 200ms ease-in 0ms both" : "recItemIn 200ms ease-out 280ms both" }}>
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
                          Seating is arranged by cross-functional collaboration patterns, not org chart.
                          Employees land near their most frequent collaborators across teams—regardless of pillar or allocation area.
                          Assignments refresh each quarter to stay current with how work actually flows.
                        </Text>
                        <Box style={{ marginTop: 8 }}>
                          <Heading as="h3" size="2" style={{ color: "var(--slate-12)", marginBottom: 10 }}>Outcome</Heading>
                          <Box style={{ background: "var(--green-2)", borderRadius: 12, padding: "12px 14px" }}>
                            <Flex direction="column" gap="2">
                              {["Optimizes for real-world collaboration patterns", "Bridges cross-functional silos naturally", "Self-updating — adapts automatically each quarter"].map((pro) => (
                                <Flex key={pro} align="start" style={{ gap: 4 }}>
                                  <Box style={{ display: "inline-flex", alignItems: "center", height: 20, flexShrink: 0, marginTop: 2 }}>
                                    <CheckCircledIcon width={15} height={15} style={{ color: "var(--green-10)" }} />
                                  </Box>
                                  <Text size="2" style={{ color: "var(--slate-12)" }}>{pro}</Text>
                                </Flex>
                              ))}
                            </Flex>
                          </Box>
                          <Box style={{ background: "var(--red-2)", borderRadius: 12, padding: "12px 14px", marginTop: 8 }}>
                            <Flex direction="column" gap="2">
                              {["Requires access to calendar metadata (privacy review needed)", "Less intuitive than team-based or frequency-based grouping"].map((con) => (
                                <Flex key={con} align="start" style={{ gap: 4 }}>
                                  <Box style={{ display: "inline-flex", alignItems: "center", height: 20, flexShrink: 0, marginTop: 2 }}>
                                    <Cross2Icon width={13} height={13} style={{ color: "var(--red-10)" }} />
                                  </Box>
                                  <Text size="2" style={{ color: "var(--slate-12)" }}>{con}</Text>
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
                  <Box ref={subHeaderRef as React.Ref<HTMLDivElement>} style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, padding: "10px 16px 10px 20px", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(150%)", WebkitBackdropFilter: "blur(20px) saturate(150%)", border: "none", borderRadius: 0, borderBottom: "0.5px solid var(--gray-5)", boxShadow: "inset 0 4px 10px rgba(255,255,255,0.4)" }}>
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
                  {previewView === "data" && (
                  <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "var(--gray-6) transparent" }}>
                    <Box style={{ padding: "80px 0 16px" }}>
                      <Box style={{ padding: "0 16px" }}>

                      {/* ── DATA VIEW ──────────────────────────────────────── */}
                      {previewPln && (
                          <Flex direction="column" style={{ gap: 16, animation: "previewFadeUp 180ms ease-out both" }}>

                            {/* Card 1: Employee population */}
                            <Box style={{ ...GLASS_CARD_STYLE, borderRadius: 16, padding: "20px 24px", background: "white" }}>
                              <Flex justify="between" align="start" style={{ marginBottom: 16 }}>
                                <Box>
                                  <Heading as="h3" size="3" style={{ color: "var(--slate-12)" }}>Employee population</Heading>
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
                                            padding: "2px 8px", borderRadius: 9999, cursor: "default",
                                            opacity: previewEmpHovered !== null && previewEmpHovered !== label ? 0.35 : 1,
                                            background: previewEmpHovered === label ? "var(--gray-a3)" : "transparent",
                                            transition: "opacity 120ms ease, background 120ms ease",
                                          }}
                                          onMouseEnter={() => setPreviewEmpHovered(label)}
                                          onMouseLeave={() => setPreviewEmpHovered(null)}
                                        >
                                          <Box style={{ width: 12, height: 12, borderRadius: 2, background: color, flexShrink: 0 }} />
                                          <Text size="1" color="gray" style={{ marginInline: 4 }}>{isFuture ? "Future headcount" : label}</Text>
                                          <Text size="1" weight="medium" style={{ color: "var(--slate-12)" }}>{value.toLocaleString()}</Text>
                                        </Flex>
                                      ))}
                                    </Flex>
                                  </>
                                );
                              })()}
                            </Box>

                            {/* Card 2: Workspace + desk changes */}
                            <Box style={{ ...GLASS_CARD_STYLE, borderRadius: 16, padding: "20px 24px", background: "white" }}>
                              <Heading as="h3" size="3" style={{ color: "var(--slate-12)", marginBottom: 16 }}>Workspace changes</Heading>

                              {/* AI summary — what changes and what causes it */}
                              <Flex style={{ gap: 10, alignItems: "flex-start", padding: "12px 14px", background: "linear-gradient(135deg, var(--blue-2), var(--purple-2))", border: "0.5px solid var(--blue-4)", borderRadius: 12, marginBottom: 24 }}>
                                <Box style={{ width: 24, height: 24, borderRadius: 8, background: "linear-gradient(135deg, #2657E8, #6421CA)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="12" height="12" style={{ color: "white" }}>
                                    <path fill="currentColor" d="M11.925 2.044c-.397-1.1-1.952-1.1-2.35 0L7.693 7.243a.75.75 0 0 1-.45.45L2.044 9.574c-1.1.398-1.1 1.953 0 2.351l5.2 1.882a.75.75 0 0 1 .45.45l1.88 5.199c.399 1.1 1.954 1.1 2.351 0l1.882-5.2a.75.75 0 0 1 .45-.45l5.199-1.88c1.1-.399 1.1-1.954 0-2.352l-5.2-1.881a.75.75 0 0 1-.45-.45l-1.88-5.2ZM19.5 15.375a.806.806 0 0 0-.754.521l-.641 1.699a.875.875 0 0 1-.51.51l-1.699.641a.806.806 0 0 0 0 1.508l1.7.641c.234.089.42.275.509.51l.641 1.699a.806.806 0 0 0 1.508 0l.641-1.7a.875.875 0 0 1 .51-.509l1.699-.641a.806.806 0 0 0 0-1.508l-1.7-.641a.875.875 0 0 1-.509-.51l-.641-1.699a.806.806 0 0 0-.754-.521Z" />
                                  </svg>
                                </Box>
                                <Box>
                                  <Text as="div" size="1" weight="medium" style={{ color: "var(--slate-12)", marginBottom: 2 }}>What changes in this plan</Text>
                                  <Text as="p" size="1" style={{ color: "var(--gray-11)", margin: 0, lineHeight: 1.6 }}>
                                    <Text weight="medium" style={{ color: "var(--slate-12)" }}>{Math.abs(previewAssignedDelta)} employees</Text>
                                    {" "}shift from assigned desks ({previewCur.assignedEmp} → {previewPln.assignedEmp}) to coworking seating ({previewCur.coworkingEmp} → {previewPln.coworkingEmp}) because {REC_CHANGE_CAUSE[previewOption.num]}. Capacity itself doesn’t change — {previewCur.assignedSpaces} desk spaces and {previewCur.coworkingSpaces} coworking spaces remain.
                                  </Text>
                                </Box>
                              </Flex>

                              {/* Section: Workspace breakdown */}
                              <Box style={{ marginBottom: 24 }}>
                                <Heading as="h4" size="2" style={{ color: "var(--slate-12)", marginBottom: 16 }}>Workspace breakdown</Heading>

                                {/* Assigned desks — title stacked above the viz pair */}
                                <Box style={{ marginBottom: 24 }}>
                                  <Text as="div" size="2" weight="medium" style={{ color: "var(--slate-12)" }}>Assigned desks</Text>
                                  <Text as="div" size="1" color="gray" style={{ marginBottom: 14 }}>Employees with an assigned desk · {previewCur.assignedSpaces} desk spaces total (unchanged)</Text>
                                  <Grid columns="2" style={{ gap: 16 }}>
                                    <Flex direction="column" align="center" style={{ gap: 6 }}>
                                      <Text size="1" weight="medium" style={{ color: "var(--gray-11)" }}>Current state</Text>
                                      <Box style={{ position: "relative", width: 96, height: 96 }}>
                                        <MultiDonutChart segments={[{ value: previewCur.assignedEmp, color: "var(--blue-9)" }]} total={previewCur.assignedSpaces} size={96} thickness={11} />
                                        <Box style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                          <Text className="data-viz-sm" style={{ fontSize: 16 }}>{previewCur.assignedEmp}</Text>
                                          <Text size="1" color="gray">emp</Text>
                                        </Box>
                                      </Box>
                                      <Text size="1" color="gray">{previewCur.assignedEmp} employees assigned</Text>
                                    </Flex>
                                    <Flex direction="column" align="center" style={{ gap: 6 }}>
                                      <Text size="1" weight="medium" style={{ color: "var(--gray-11)" }}>Planned changes</Text>
                                      <Box style={{ position: "relative", width: 96, height: 96 }}>
                                        <MultiDonutChart segments={[{ value: previewPln.assignedEmp, color: previewOption.color }]} total={previewPln.assignedSpaces} size={96} thickness={11} />
                                        <Box style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                          <Text className="data-viz-sm" style={{ fontSize: 16 }}>{previewPln.assignedEmp}</Text>
                                          <Text size="1" color="gray">emp</Text>
                                        </Box>
                                      </Box>
                                      <Flex align="center" style={{ gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                                        <Text size="1" color="gray">{previewPln.assignedEmp} employees assigned</Text>
                                        {previewAssignedDelta !== 0 && (
                                          <Text size="1" style={{ background: previewAssignedDelta < 0 ? "var(--orange-3)" : "var(--green-3)", color: previewAssignedDelta < 0 ? "var(--orange-11)" : "var(--green-11)", borderRadius: 9999, padding: "1px 8px", fontWeight: 500 }}>
                                            {previewAssignedDelta < 0 ? "−" : "+"}{Math.abs(previewAssignedDelta)} employees
                                          </Text>
                                        )}
                                      </Flex>
                                    </Flex>
                                  </Grid>
                                </Box>

                                {/* Coworking spaces — title stacked above the viz pair */}
                                <Box>
                                  <Text as="div" size="2" weight="medium" style={{ color: "var(--slate-12)" }}>Coworking spaces</Text>
                                  <Text as="div" size="1" color="gray" style={{ marginBottom: 14 }}>Employees in coworking · {previewCur.coworkingSpaces} coworking spaces total (unchanged)</Text>
                                  <Grid columns="2" style={{ gap: 16 }}>
                                    <Flex direction="column" align="center" style={{ gap: 6 }}>
                                      <Text size="1" weight="medium" style={{ color: "var(--gray-11)" }}>Current state</Text>
                                      <Box style={{ position: "relative", width: 96, height: 96 }}>
                                        <MultiDonutChart segments={[{ value: previewCur.coworkingEmp, color: "var(--purple-9)" }]} total={previewCur.coworkingSpaces} size={96} thickness={11} />
                                        <Box style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                          <Text className="data-viz-sm" style={{ fontSize: 16 }}>{previewCur.coworkingEmp}</Text>
                                          <Text size="1" color="gray">emp</Text>
                                        </Box>
                                      </Box>
                                      <Text size="1" color="gray">{previewCur.coworkingEmp} employees in coworking</Text>
                                    </Flex>
                                    <Flex direction="column" align="center" style={{ gap: 6 }}>
                                      <Text size="1" weight="medium" style={{ color: "var(--gray-11)" }}>Planned changes</Text>
                                      <Box style={{ position: "relative", width: 96, height: 96 }}>
                                        <MultiDonutChart segments={[{ value: previewPln.coworkingEmp, color: "var(--purple-9)" }]} total={previewPln.coworkingSpaces} size={96} thickness={11} />
                                        <Box style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                          <Text className="data-viz-sm" style={{ fontSize: 16 }}>{previewPln.coworkingEmp}</Text>
                                          <Text size="1" color="gray">emp</Text>
                                        </Box>
                                      </Box>
                                      <Flex align="center" style={{ gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                                        <Text size="1" color="gray">{previewPln.coworkingEmp} employees in coworking</Text>
                                        {previewCoworkDelta !== 0 && (
                                          <Text size="1" style={{ background: previewCoworkDelta > 0 ? "var(--blue-3)" : "var(--orange-3)", color: previewCoworkDelta > 0 ? "var(--blue-11)" : "var(--orange-11)", borderRadius: 9999, padding: "1px 8px", fontWeight: 500 }}>
                                            {previewCoworkDelta > 0 ? "+" : "−"}{Math.abs(previewCoworkDelta)} employees
                                          </Text>
                                        )}
                                      </Flex>
                                    </Flex>
                                  </Grid>
                                </Box>
                              </Box>

                              <Box style={{ height: 1, background: "var(--gray-4)", margin: "0 -24px 24px" }} />

                              {/* Section: Desk allocation by category */}
                              <Box>
                                <Heading as="h4" size="2" style={{ color: "var(--slate-12)", marginBottom: 4 }}>Desk allocation by employee category</Heading>
                                <Text as="div" size="1" color="gray" style={{ marginBottom: 10 }}>Who holds the assigned desks in each state</Text>
                                <Flex align="center" style={{ gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                                  {previewCur.deskByCategory.map((d) => (
                                    <Flex key={d.label} align="center" style={{ gap: 5 }}>
                                      <Box style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                                      <Text size="1" color="gray">{d.label}</Text>
                                    </Flex>
                                  ))}
                                </Flex>
                                <Grid columns="2" style={{ gap: 16 }}>
                                  <Flex direction="column" align="center" style={{ gap: 6 }}>
                                    <Text size="1" weight="medium" style={{ color: "var(--gray-11)" }}>Current state</Text>
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
                                  <Flex direction="column" align="center" style={{ gap: 6 }}>
                                    <Text size="1" weight="medium" style={{ color: "var(--gray-11)" }}>Planned changes</Text>
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

                      </Box>
                    </Box>
                  </div>
                  )}

                  {/* ── MAP VIEW — full-height card with resizable split ─── */}
                  {previewView === "map" && (
                    <Box style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", padding: `${subHeaderH + 12}px 16px 16px`, animation: "previewFadeUp 180ms ease-out both" }}>
                      <Box style={{ flex: 1, minHeight: 0, position: "relative", display: "flex", flexDirection: "column", background: "white", borderRadius: 16, border: "0.5px solid var(--gray-5)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" }}>

                        {/* Legend */}
                        <Flex align="center" style={{ gap: 16, flexWrap: "wrap", padding: "12px 20px", borderBottom: "0.5px solid var(--gray-4)", flexShrink: 0 }}>
                          {Object.entries(ZONE_AA_COLORS).map(([label, color]) => (
                            <Flex key={label} align="center" style={{ gap: 6 }}>
                              <Box style={{ width: 12, height: 12, borderRadius: 3, background: color, border: `1.5px solid ${ZONE_AA_BORDER[label]}` }} />
                              <Text size="1" color="gray">{label}</Text>
                            </Flex>
                          ))}
                          <Text size="1" color="gray" style={{ marginLeft: "auto" }}>Click a map to expand</Text>
                        </Flex>

                        {/* Resizable split: current | planned */}
                        <div ref={splitRef} style={{ flex: 1, minHeight: 0, display: "flex" }}>
                          <Box style={{ width: `calc(${splitPct}% - 6px)`, minWidth: 0, display: "flex", flexDirection: "column" }}>
                            <Text as="div" size="2" weight="medium" style={{ color: "var(--slate-12)", padding: "12px 20px 0", flexShrink: 0 }}>Current state</Text>
                            <FitBox onClick={() => expandMap("current")} style={{ cursor: "zoom-in", padding: 12 }}>
                              <FloorMapSurface blocks={previewCurrentBlocks} />
                            </FitBox>
                          </Box>
                          <div
                            role="separator"
                            aria-orientation="vertical"
                            onPointerDown={onSplitDragStart}
                            style={{ width: 12, flexShrink: 0, cursor: "col-resize", position: "relative", touchAction: "none" }}
                          >
                            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "var(--gray-4)" }} />
                            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 4, height: 44, borderRadius: 9999, background: "var(--gray-6)" }} />
                          </div>
                          <Box style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                            <Text as="div" size="2" weight="medium" style={{ color: "var(--slate-12)", padding: "12px 20px 0", flexShrink: 0 }}>Planned changes</Text>
                            <FitBox onClick={() => expandMap("planned")} style={{ cursor: "zoom-in", padding: 12 }}>
                              <FloorMapSurface blocks={previewPlannedBlocks} />
                            </FitBox>
                          </Box>
                        </div>

                        {/* ── Expanded map — covers the card; pan/zoom toolbar lives here ── */}
                        {expandedPanel && (
                          <Box style={{ position: "absolute", inset: 0, zIndex: 20, background: "white", display: "flex", flexDirection: "column", animation: "previewFadeUp 160ms ease-out both" }}>
                            <Flex align="center" justify="between" style={{ padding: "10px 16px", borderBottom: "0.5px solid var(--gray-4)", flexShrink: 0, gap: 12 }}>
                              <Flex align="center" style={{ gap: 10, minWidth: 0 }}>
                                <IconButton variant="soft" color="gray" size="2" onClick={collapseMap} aria-label="Back to side-by-side maps" style={{ width: 28, height: 28 }}>
                                  <ChevronLeftIcon width={14} height={14} />
                                </IconButton>
                                <Text size="2" weight="medium" style={{ color: "var(--slate-12)", whiteSpace: "nowrap" }}>
                                  {expandedPanel === "current" ? "Current state" : "Planned changes"}
                                </Text>
                                <Text size="1" color="gray" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {deskDetail ? "Showing individual desk assignments — hover a desk" : "Drag to pan · Scroll to zoom · Zoom in to see desks"}
                                </Text>
                              </Flex>
                              <Flex align="center" style={{ gap: 8, flexShrink: 0 }}>
                                <Flex align="center" style={{ gap: 4, background: "rgba(255,255,255,0.8)", border: "0.5px solid var(--gray-5)", borderRadius: 9999, padding: "3px 6px" }}>
                                  <IconButton variant="ghost" color="gray" size="1" onClick={() => setExpZoom((z) => Math.max(0.5, z - 0.25))} style={{ borderRadius: 9999 }} aria-label="Zoom out">
                                    <MinusIcon />
                                  </IconButton>
                                  <Text size="1" weight="medium" style={{ color: "var(--slate-12)", minWidth: 34, textAlign: "center" }}>{Math.round(expZoom * 100)}%</Text>
                                  <IconButton variant="ghost" color="gray" size="1" onClick={() => setExpZoom((z) => Math.min(4, z + 0.25))} style={{ borderRadius: 9999 }} aria-label="Zoom in">
                                    <PlusIcon />
                                  </IconButton>
                                </Flex>
                                <Flex align="center" style={{ gap: 4, background: "rgba(255,255,255,0.8)", border: "0.5px solid var(--gray-5)", borderRadius: 9999, padding: "3px 8px" }}>
                                  <IconButton variant="ghost" color="gray" size="1" onClick={() => setExpRotation((r) => r - 90)} style={{ borderRadius: 9999 }} aria-label="Rotate counterclockwise">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                  </IconButton>
                                  <Text size="1" weight="medium" style={{ color: "var(--slate-12)", minWidth: 28, textAlign: "center" }}>{((expRotation % 360) + 360) % 360}°</Text>
                                  <IconButton variant="ghost" color="gray" size="1" onClick={() => setExpRotation((r) => r + 90)} style={{ borderRadius: 9999 }} aria-label="Rotate clockwise">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                                  </IconButton>
                                </Flex>
                                <button
                                  onClick={() => { setExpZoom(1); setExpRotation(0); setExpPan({ x: 0, y: 0 }); }}
                                  style={{ padding: "5px 10px", background: "rgba(255,255,255,0.8)", border: "0.5px solid var(--gray-5)", borderRadius: 9999, color: "var(--gray-11)", fontSize: "var(--font-size-1)", fontFamily: "var(--font-body), system-ui", cursor: "pointer" }}
                                >
                                  Reset
                                </button>
                              </Flex>
                            </Flex>
                            <div
                              ref={expCanvasRef}
                              onPointerDown={onMapPanStart}
                              onPointerMove={onMapPanMove}
                              onPointerUp={onMapPanEnd}
                              onPointerCancel={onMapPanEnd}
                              style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden", cursor: isPanning ? "grabbing" : "grab", touchAction: "none", background: "var(--gray-1)" }}
                            >
                              <FitBox style={{ position: "absolute", inset: 0, padding: 16 }}>
                                <div style={{ position: "absolute", inset: 0, transform: `translate(${expPan.x}px, ${expPan.y}px) scale(${expZoom}) rotate(${expRotation}deg)`, transformOrigin: "center center", transition: isPanning ? "none" : "transform 220ms ease" }}>
                                  <FloorMapSurface blocks={expandedBlocks} desks={expandedDesks} deskMode={deskDetail} />
                                </div>
                              </FitBox>
                            </div>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              </div>{/* ── end body wrapper ── */}
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
