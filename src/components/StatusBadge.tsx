"use client";
import { Badge } from "@radix-ui/themes";
import { PlanStatus } from "@/lib/types";

const config: Record<PlanStatus, { color: "gray" | "blue" | "orange" | "green" | "jade"; label: string }> = {
  "Plan draft":   { color: "gray",   label: "Plan draft" },
  "Policy draft": { color: "blue",   label: "Policy draft" },
  "Submitted":    { color: "orange", label: "Submitted" },
  "Approved":     { color: "jade",   label: "Approved" },
  "Live":         { color: "green",  label: "Live" },
};

export function StatusBadge({ status }: { status: PlanStatus }) {
  const { color, label } = config[status];
  return (
    <Badge color={color} variant="soft" radius="full" size="1">
      {label}
    </Badge>
  );
}
