"use client";

import { useState } from "react";
import Link from "next/link";
import { Box, Flex, Heading, Text, Badge, Separator } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import * as ToggleGroup from "@radix-ui/react-toggle-group";

// ── Constants ────────────────────────────────────────────────
const PERIOD_DAYS = 125;
const MIN_THRESHOLD = 75;
const PERIOD_LABEL = "Apr 7 – Jul 1, 2025";

const MOCK = {
  qualified: {
    daysInOffice: 83,
    name: "Jordan Lee",
    role: "Sr. Software Engineer",
    team: "Enterprise Products · Menlo Park",
  },
  coworking: {
    daysInOffice: 67,
    name: "Alex Kim",
    role: "Product Designer",
    team: "Enterprise Analytics · San Francisco",
  },
} as const;

type ScenarioKey = keyof typeof MOCK;

// ── SVG helpers ──────────────────────────────────────────────
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

// Draws a counterclockwise arc (through the top of the SVG) from fromDeg to toDeg
function arcD(cx: number, cy: number, r: number, fromDeg: number, toDeg: number) {
  const s = polar(cx, cy, r, fromDeg);
  const e = polar(cx, cy, r, toDeg);
  const large = fromDeg - toDeg > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

// ── Gauge chart ──────────────────────────────────────────────
function GaugeChart({
  value,
  total,
  threshold,
  qualified,
}: {
  value: number;
  total: number;
  threshold: number;
  qualified: boolean;
}) {
  // Geometry: semicircle opening downward, center near SVG bottom
  const cx = 200, cy = 230, R = 155, SW = 40;

  // 180° = left (0 days), 0° = right (total days). Arc travels counterclockwise through top.
  const toAngle = (v: number) => 180 - (v / total) * 179.98;

  const fullArcD = arcD(cx, cy, R, 180, 0.01); // base path shared by track + dasharray overlay
  const valueAngle = toAngle(value);
  const threshAngle = toAngle(threshold);

  const valuePt    = polar(cx, cy, R, valueAngle);
  const tInner     = polar(cx, cy, R - SW / 2 - 6, threshAngle);
  const tOuter     = polar(cx, cy, R + SW / 2 + 6, threshAngle);
  const tLabelPt   = polar(cx, cy, R + SW / 2 + 24, threshAngle);

  const color  = qualified ? "#16A34A" : "#D97706";
  const gradId = qualified ? "g-q" : "g-c";
  const gradA  = qualified ? "#4ADE80" : "#FCD34D";
  const gradB  = qualified ? "#15803D" : "#B45309";

  return (
    <svg viewBox="0 0 400 252" width="100%" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} x1="40" y1="0" x2="360" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={gradA} />
          <stop offset="100%" stopColor={gradB} />
        </linearGradient>
      </defs>

      {/* Grey background track */}
      <path d={fullArcD} fill="none" stroke="#E8E8ED" strokeWidth={SW} strokeLinecap="round" />

      {/* Progress overlay — same path, dasharray clips to value fraction */}
      <path
        d={fullArcD}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={SW}
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray={`${(value / total).toFixed(4)} 1`}
        style={{ transition: "stroke-dasharray 700ms cubic-bezier(0.4, 0, 0.2, 1)" }}
      />

      {/* Threshold marker tick */}
      <line
        x1={tInner.x.toFixed(2)} y1={tInner.y.toFixed(2)}
        x2={tOuter.x.toFixed(2)} y2={tOuter.y.toFixed(2)}
        stroke="#1C2024" strokeWidth="2.5" strokeLinecap="round"
      />

      {/* Threshold label — positioned radially outside the track */}
      <text
        x={(tLabelPt.x > cx ? tLabelPt.x + 4 : tLabelPt.x - 4).toFixed(2)}
        y={(tLabelPt.y + 4).toFixed(2)}
        textAnchor={tLabelPt.x > cx ? "start" : "end"}
        fontSize="10.5"
        fontWeight="600"
        fill="#1C2024"
        fontFamily="system-ui, sans-serif"
        style={{ letterSpacing: "-0.01em" }}
      >
        {threshold} day min
      </text>

      {/* Current value indicator dot */}
      <circle
        cx={valuePt.x.toFixed(2)} cy={valuePt.y.toFixed(2)}
        r="8" fill="white" stroke={color} strokeWidth="3"
      />

      {/* Center: large day count */}
      <text
        x={cx} y={cy - 44}
        textAnchor="middle"
        fill={color}
        fontSize="64"
        fontWeight="700"
        fontFamily="var(--font-sora), system-ui, sans-serif"
        style={{ transition: "fill 400ms ease" }}
      >
        {value}
      </text>
      <text x={cx} y={cy - 14} textAnchor="middle" fill="#60646C" fontSize="13" fontFamily="system-ui, sans-serif">
        days in office
      </text>

      {/* Scale endpoints */}
      <text x={cx - R - SW / 2 - 8} y={cy + 20} textAnchor="end" fill="#BBBFC4" fontSize="11" fontFamily="system-ui, sans-serif">0</text>
      <text x={cx + R + SW / 2 + 8} y={cy + 20} textAnchor="start" fill="#BBBFC4" fontSize="11" fontFamily="system-ui, sans-serif">{total}</text>
    </svg>
  );
}

// ── Shared glass-card style ───────────────────────────────────
const GLASS: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.88)",
  backdropFilter: "blur(28px) saturate(1.8) brightness(1.04)",
  WebkitBackdropFilter: "blur(28px) saturate(1.8) brightness(1.04)",
  border: "0.5px solid rgba(255, 255, 255, 0.75)",
  borderRadius: 20,
  boxShadow: "0 2px 23px rgba(0,0,0,0.054), inset 0 1px 0 rgba(255,255,255,0.9)",
};

// ── Page ─────────────────────────────────────────────────────
export default function DeskStatusPage() {
  const [scenario, setScenario] = useState<ScenarioKey>("qualified");
  const data = MOCK[scenario];
  const qualified = data.daysInOffice >= MIN_THRESHOLD;
  const gap = qualified ? data.daysInOffice - MIN_THRESHOLD : MIN_THRESHOLD - data.daysInOffice;

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "#F0F0F3",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <Flex
        align="center"
        gap="3"
        px="6"
        py="3"
        style={{
          background: "#FCFCFD",
          borderBottom: "0.5px solid #E8E8ED",
          flexShrink: 0,
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Flex align="center" gap="2" style={{ color: "#60646C" }}>
            <ArrowLeftIcon />
            <Text size="2">Back</Text>
          </Flex>
        </Link>
        <Separator orientation="vertical" style={{ height: 16 }} />
        <Box
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: "#2657E8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(38,87,232,0.4)",
            flexShrink: 0,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="17" height="17" color="white">
            <path fill="currentColor" d="M6.75 13.25a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm12.8.25c.206 0 .375 0 .512.01.141.012.27.038.392.1.188.095.34.248.437.436.061.121.087.251.098.392.011.137.011.306.011.512v4.6c0 .206 0 .375-.01.512-.012.141-.038.27-.1.392a.999.999 0 0 1-.436.437 1.027 1.027 0 0 1-.392.098c-.137.011-.306.011-.512.011h-4.6c-.205 0-.375 0-.512-.01a1.027 1.027 0 0 1-.392-.1.999.999 0 0 1-.437-.436 1.027 1.027 0 0 1-.098-.392c-.011-.137-.011-.306-.011-.512v-4.6c0-.205 0-.375.01-.512.012-.141.038-.27.1-.392a.999.999 0 0 1 .436-.437c.121-.061.251-.087.392-.098.137-.011.306-.011.512-.011h4.6Zm-2.3-10.75a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-7.918.251c.085.001.162.004.23.01.141.011.27.037.392.098.188.096.34.249.437.437.061.121.087.251.098.392.011.137.011.307.011.512v4.6c0 .205 0 .375-.01.512-.012.141-.038.27-.1.392a.999.999 0 0 1-.436.437 1.027 1.027 0 0 1-.392.098c-.137.011-.307.011-.512.011h-4.6c-.205 0-.375 0-.513-.01a1.027 1.027 0 0 1-.391-.1.999.999 0 0 1-.437-.436 1.026 1.026 0 0 1-.098-.392 3.588 3.588 0 0 1-.01-.23L3 9.05v-4.6c0-.205 0-.375.01-.513.012-.14.038-.27.1-.391a1 1 0 0 1 .436-.437c.121-.061.251-.087.392-.098C4.075 3 4.245 3 4.45 3h4.6l.282.001Z" />
          </svg>
        </Box>
        <Heading size="4" style={{ fontFamily: "var(--font-ibm-plex-sans), system-ui, sans-serif" }}>
          Desk Assignment Status
        </Heading>
      </Flex>

      {/* ── Body ── */}
      <Box style={{ flex: 1, overflowY: "auto", padding: "32px 24px" }}>
        <Box style={{ maxWidth: 600, margin: "0 auto" }}>
          <Flex direction="column" gap="5">

            {/* Scenario toggle */}
            <Flex align="center" justify="center" gap="3">
              <Text
                size="1"
                color="gray"
                weight="medium"
                style={{ textTransform: "uppercase", letterSpacing: "0.07em" }}
              >
                Preview scenario
              </Text>
              <ToggleGroup.Root
                type="single"
                value={scenario}
                onValueChange={(v) => v && setScenario(v as ScenarioKey)}
                className="view-toggle-root"
              >
                <ToggleGroup.Item value="qualified" className="view-toggle-item">
                  Qualified
                </ToggleGroup.Item>
                <ToggleGroup.Item value="coworking" className="view-toggle-item">
                  Coworking
                </ToggleGroup.Item>
              </ToggleGroup.Root>
            </Flex>

            {/* ── Main status card ── */}
            <Box style={GLASS}>

              {/* Employee header */}
              <Flex align="center" justify="between" px="6" pt="5" pb="4">
                <Flex direction="column" gap="1">
                  <Heading size="4">{data.name}</Heading>
                  <Text size="2" color="gray">{data.role}</Text>
                  <Text size="1" color="gray">{data.team}</Text>
                </Flex>
                <Badge
                  size="2"
                  color={qualified ? "green" : "orange"}
                  variant="soft"
                  radius="full"
                  style={{ flexShrink: 0 }}
                >
                  {qualified ? "Assigned desk" : "Coworking space"}
                </Badge>
              </Flex>

              <Separator size="4" />

              {/* Gauge */}
              <Box px="5" pt="5" pb="0" style={{ overflow: "visible" }}>
                <GaugeChart
                  value={data.daysInOffice}
                  total={PERIOD_DAYS}
                  threshold={MIN_THRESHOLD}
                  qualified={qualified}
                />
              </Box>

              {/* Gauge legend */}
              <Flex justify="center" gap="5" pt="2" pb="3">
                <Flex align="center" gap="2">
                  <Box
                    style={{
                      width: 2,
                      height: 14,
                      background: "#1C2024",
                      borderRadius: 1,
                    }}
                  />
                  <Text size="1" color="gray">{MIN_THRESHOLD}-day minimum</Text>
                </Flex>
                <Flex align="center" gap="2">
                  <Box
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "white",
                      border: `2.5px solid ${qualified ? "#16A34A" : "#D97706"}`,
                    }}
                  />
                  <Text size="1" color="gray">Your progress: {data.daysInOffice} days</Text>
                </Flex>
              </Flex>

              {/* Period */}
              <Flex justify="center" pb="4">
                <Text size="1" color="gray">
                  Evaluation period: {PERIOD_LABEL} · {PERIOD_DAYS} days
                </Text>
              </Flex>

              <Separator size="4" />

              {/* Outcome callout */}
              <Box
                px="6"
                py="4"
                style={{
                  background: qualified
                    ? "linear-gradient(135deg, rgba(22,163,74,0.06) 0%, rgba(74,222,128,0.03) 100%)"
                    : "linear-gradient(135deg, rgba(217,119,6,0.07) 0%, rgba(252,211,77,0.03) 100%)",
                  borderTop: qualified
                    ? "0.5px solid rgba(22,163,74,0.18)"
                    : "0.5px solid rgba(217,119,6,0.18)",
                  borderRadius: "0 0 20px 20px",
                }}
              >
                <Flex align="start" gap="3">
                  <Box mt="1" style={{ flexShrink: 0 }}>
                    {qualified ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="10" fill="rgba(22,163,74,0.14)" />
                        <path d="M5.5 10.5L8.5 13.5L14.5 7" stroke="#16A34A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="10" fill="rgba(217,119,6,0.14)" />
                        <path d="M10 6.5v4.5M10 13.5h.01" stroke="#D97706" strokeWidth="1.75" strokeLinecap="round" />
                      </svg>
                    )}
                  </Box>
                  <Flex direction="column" gap="1">
                    <Text
                      size="2"
                      weight="bold"
                      style={{ color: qualified ? "#15803D" : "#92400E" }}
                    >
                      {qualified
                        ? "You qualify for an assigned desk"
                        : "You'll be placed in a coworking space"}
                    </Text>
                    <Text
                      size="1"
                      style={{
                        color: qualified ? "#166534" : "#78350F",
                        lineHeight: 1.65,
                      }}
                    >
                      {qualified
                        ? `You've exceeded the ${MIN_THRESHOLD}-day minimum by ${gap} ${gap === 1 ? "day" : "days"}. Your assigned desk will be confirmed once your organization's plans are approved.`
                        : `You're ${gap} ${gap === 1 ? "day" : "days"} short of the ${MIN_THRESHOLD}-day minimum. A coworking reservation will be arranged for you once plans are finalized.`}
                    </Text>
                  </Flex>
                </Flex>
              </Box>
            </Box>

            {/* ── Stat tiles ── */}
            <Flex gap="3">
              {[
                {
                  label: "Days in office",
                  value: String(data.daysInOffice),
                  sub: `of ${PERIOD_DAYS} total`,
                  color: qualified ? "#16A34A" : "#D97706",
                },
                {
                  label: "Minimum required",
                  value: String(MIN_THRESHOLD),
                  sub: "days",
                  color: "#1C2024",
                },
                {
                  label: "Evaluation period",
                  value: String(PERIOD_DAYS),
                  sub: "Q2 to Q3 · 2025",
                  color: "#1C2024",
                },
              ].map((tile) => (
                <Box
                  key={tile.label}
                  style={{ flex: 1, ...GLASS, padding: "16px 20px" }}
                >
                  <Flex direction="column" gap="1">
                    <Text size="1" color="gray">
                      {tile.label}
                    </Text>
                    <Text
                      size="5"
                      weight="bold"
                      style={{
                        color: tile.color,
                        fontFamily: "var(--font-sora), system-ui, sans-serif",
                        lineHeight: 1.1,
                        transition: "color 400ms ease",
                      }}
                    >
                      {tile.value}
                    </Text>
                    <Text size="1" color="gray">
                      {tile.sub}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </Flex>

          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
