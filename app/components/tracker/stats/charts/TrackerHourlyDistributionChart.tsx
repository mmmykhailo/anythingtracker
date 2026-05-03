import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { toMidnight } from "~/lib/dates";
import type { Tracker } from "~/lib/trackers";
import { formatClockTick, toRadians } from "~/lib/utils";

interface Entry {
  id: string;
  trackerId: string;
  date: string;
  value: number;
  comment?: string;
  createdAt: Date;
}

interface TrackerHourlyDistributionChartProps {
  tracker: Tracker;
  entries: Entry[];
  fromDate: Date;
  toDate: Date;
}

const formatHourLabel = (hour: number) =>
  `${hour.toString().padStart(2, "0")}:00`;

const polarToCartesian = (
  cx: number,
  cy: number,
  r: number,
  angle: number,
) => ({
  x: cx + r * Math.cos(toRadians(angle)),
  y: cy + r * Math.sin(toRadians(angle)),
});

const describeArc = (
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
) => {
  const startOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const startInner = polarToCartesian(cx, cy, innerRadius, endAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
};

export function TrackerHourlyDistributionChart({
  tracker,
  entries,
  fromDate,
  toDate,
}: TrackerHourlyDistributionChartProps) {
  // Normalize fromDate and toDate to midnight to ensure inclusive range
  const fromDateMid = toMidnight(fromDate);
  const toDateMid = toMidnight(toDate);

  const chartData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    hourLabel: hour.toString().padStart(2, "0"),
    label: formatHourLabel(hour),
    fullLabel: `${formatHourLabel(hour)} - ${formatHourLabel(
      hour + 1,
    )}`.replace("24:00", "00:00"),
    count: 0,
  }));

  for (const entry of entries) {
    const createdAt = new Date(entry.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      continue;
    }
    const hour = createdAt.getHours();
    chartData[hour].count += 1;
  }

  const total = chartData.reduce((sum, item) => sum + item.count, 0);
  const maxBucket = chartData.reduce(
    (max, item) => (item.count > max.count ? item : max),
    chartData[0],
  );

  const hasData = total > 0;
  const chartColor = "var(--chart-4)";

  const size = 240;
  const center = size / 2;
  const innerRadius = 52;
  const outerRadius = 108;
  const gap = 2;
  const slice = 360 / 24;
  const CLOCK_TICKS = [0, 6, 12, 18];
  const ALL_HOURS = Array.from({ length: 24 }, (_, hour) => hour);
  const maxValue = Math.max(1, maxBucket.count);
  const tickInnerRadius = Math.max(12, innerRadius - 16);
  const tickOuterRadius = innerRadius - 8;
  const labelRadius = Math.max(14, innerRadius - 30);

  return (
    <Card className="select-none">
      <CardHeader>
        <CardTitle>Hourly Distribution</CardTitle>
        <CardDescription>
          {format(fromDateMid, "MMM d, yyyy")} -{" "}
          {format(toDateMid, "MMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="flex items-center justify-center">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="h-full w-full max-w-[320px]"
              role="img"
              aria-label="Hourly distribution chart"
            >
              {chartData.map((bucket) => {
                const start = -90 + bucket.hour * slice + gap / 2;
                const end = start + slice - gap;
                const radius =
                  innerRadius +
                  (bucket.count / maxValue) * (outerRadius - innerRadius);

                return (
                  <Tooltip key={`tooltip-${bucket.hour}`}>
                    <TooltipTrigger asChild>
                      <g className="cursor-pointer">
                        <path
                          d={describeArc(
                            center,
                            center,
                            innerRadius,
                            outerRadius,
                            start,
                            end,
                          )}
                          fill="var(--muted)"
                          opacity={0.3}
                        />
                        {bucket.count > 0 && (
                          <path
                            d={describeArc(
                              center,
                              center,
                              innerRadius,
                              radius,
                              start,
                              end,
                            )}
                            fill={chartColor}
                          />
                        )}
                      </g>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6}>
                      <div className="font-medium">{bucket.fullLabel}</div>
                      <div className="text-muted-foreground">
                        {bucket.count} entries
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              {ALL_HOURS.map((hour) => {
                const angle = -90 + hour * slice;
                const innerPoint = polarToCartesian(
                  center,
                  center,
                  tickInnerRadius,
                  angle,
                );
                const outerPoint = polarToCartesian(
                  center,
                  center,
                  tickOuterRadius,
                  angle,
                );
                const isMajor = CLOCK_TICKS.includes(hour);

                return (
                  <line
                    key={`tick-${hour}`}
                    x1={innerPoint.x}
                    y1={innerPoint.y}
                    x2={outerPoint.x}
                    y2={outerPoint.y}
                    stroke={isMajor ? "#F8FAFC" : "var(--muted-foreground)"}
                    strokeOpacity={isMajor ? 0.9 : 0.5}
                    strokeWidth={isMajor ? 1.6 : 1}
                    strokeLinecap="round"
                  />
                );
              })}
              {CLOCK_TICKS.map((hour) => {
                const angle = -90 + hour * slice;
                const labelPoint = polarToCartesian(
                  center,
                  center,
                  labelRadius,
                  angle,
                );

                return (
                  <text
                    key={`label-${hour}`}
                    x={labelPoint.x}
                    y={labelPoint.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#F8FAFC"
                    fontSize="10"
                    fontWeight="800"
                  >
                    {formatClockTick(hour)}
                  </text>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available for the selected period
          </div>
        )}
      </CardContent>
      {hasData && (
        <CardFooter className="text-sm text-muted-foreground">
          Peak hour: {maxBucket.label} ({maxBucket.count} entries)
        </CardFooter>
      )}
    </Card>
  );
}
