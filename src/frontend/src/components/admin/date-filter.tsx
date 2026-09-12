import { CalendarRange } from "lucide-react";
import { useState } from "react";

import type { DateRange } from "@/backend";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PresetKey = "today" | "last7" | "last30" | "last90" | "custom";

const presets: { key: PresetKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "last7", label: "Last 7 days" },
  { key: "last30", label: "Last 30 days" },
  { key: "last90", label: "Last 90 days" },
  { key: "custom", label: "Custom" },
];

function presetToRange(key: PresetKey): DateRange | null {
  switch (key) {
    case "today":
      return { __kind__: "today", today: null };
    case "last7":
      return { __kind__: "last7Days", last7Days: null };
    case "last30":
      return { __kind__: "last30Days", last30Days: null };
    case "last90":
      return { __kind__: "last90Days", last90Days: null };
    default:
      return null;
  }
}

function rangeToPreset(range: DateRange | null): PresetKey {
  if (!range) return "last30";
  switch (range.__kind__) {
    case "today":
      return "today";
    case "last7Days":
      return "last7";
    case "last30Days":
      return "last30";
    case "last90Days":
      return "last90";
    case "custom":
      return "custom";
  }
}

function toTimestamp(dateString: string, endOfDay: boolean): bigint {
  const date = new Date(`${dateString}T${endOfDay ? "23:59:59" : "00:00:00"}`);
  return BigInt(date.getTime()) * 1_000_000n;
}

interface DateFilterProps {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
}

/**
 * Date range filter for admin analytics. Emits a backend `DateRange` value
 * that survives refresh via the URL (the caller owns URL persistence).
 */
export function DateFilter({ value, onChange }: DateFilterProps) {
  const [active, setActive] = useState<PresetKey>(rangeToPreset(value));
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const selectPreset = (key: PresetKey) => {
    setActive(key);
    if (key === "custom") {
      if (from && to) {
        onChange({
          __kind__: "custom",
          custom: { from: toTimestamp(from, false), to: toTimestamp(to, true) },
        });
      } else {
        onChange(null);
      }
      return;
    }
    onChange(presetToRange(key));
  };

  const applyCustom = () => {
    if (!from || !to) return;
    setActive("custom");
    onChange({
      __kind__: "custom",
      custom: { from: toTimestamp(from, false), to: toTimestamp(to, true) },
    });
  };

  return (
    <div data-ocid="date_filter" className="flex flex-wrap items-center gap-2">
      <div className="bg-muted flex flex-wrap items-center gap-1 rounded-lg p-1">
        {presets.map((preset) => (
          <Button
            key={preset.key}
            type="button"
            variant="ghost"
            size="sm"
            data-ocid={`date_filter.${preset.key}`}
            onClick={() => selectPreset(preset.key)}
            className={cn(
              "h-7 px-3 text-xs",
              active === preset.key
                ? "bg-card text-foreground shadow-subtle"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {active === "custom" && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <CalendarRange className="text-muted-foreground size-4" />
            <input
              type="date"
              data-ocid="date_filter.from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-muted h-8 rounded-md border border-transparent px-2 text-xs focus:border-ring focus:outline-none"
              aria-label="From date"
            />
            <span className="text-muted-foreground text-xs">to</span>
            <input
              type="date"
              data-ocid="date_filter.to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-muted h-8 rounded-md border border-transparent px-2 text-xs focus:border-ring focus:outline-none"
              aria-label="To date"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            data-ocid="date_filter.apply"
            onClick={applyCustom}
            disabled={!from || !to}
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
