import * as React from "react";

import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

const DEFAULT_COLORS = [
  "#E11D48",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#14B8A6",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
];

type ColorInputProps = {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  presets?: string[];
  fallbackColor?: string;
  allowEmpty?: boolean;
};

const normalizeHex = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(withHash)) {
    return withHash.toUpperCase();
  }
  return null;
};

function ColorInput({
  value,
  onChange,
  disabled = false,
  name,
  id,
  className,
  presets = DEFAULT_COLORS,
  fallbackColor = "#3B82F6",
  allowEmpty = true,
}: ColorInputProps) {
  const normalized = normalizeHex(value || "");
  const [textValue, setTextValue] = React.useState(
    normalized === null ? "" : normalized
  );

  React.useEffect(() => {
    if (normalized === null) return;
    setTextValue(normalized);
  }, [normalized]);

  const displayColor = normalized || fallbackColor;

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setTextValue(next);

    const parsed = normalizeHex(next);
    if (parsed === "") {
      if (allowEmpty) onChange("");
      return;
    }

    if (parsed) {
      onChange(parsed);
    }
  };

  const handlePresetClick = (preset: string) => {
    onChange(preset.toUpperCase());
  };

  const handleClear = () => {
    if (!allowEmpty) return;
    onChange("");
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative h-9 w-9">
          <div
            className={cn(
              "h-9 w-9 rounded-md border shadow-xs",
              disabled && "opacity-50"
            )}
            style={{ backgroundColor: displayColor }}
          />
          <input
            type="color"
            value={displayColor}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            disabled={disabled}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Choose color"
          />
        </div>
        <Input
          id={id}
          name={name}
          value={textValue}
          onChange={handleTextChange}
          disabled={disabled}
          placeholder="#RRGGBB"
          className="w-28 font-mono uppercase grow"
        />
        {allowEmpty && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled || !textValue}
          >
            Clear
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            className={cn(
              "h-6 w-6 rounded-full border shadow-xs transition-transform",
              "hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              disabled && "cursor-not-allowed opacity-50"
            )}
            style={{ backgroundColor: preset }}
            onClick={() => handlePresetClick(preset)}
            disabled={disabled}
            aria-label={`Set color to ${preset}`}
          />
        ))}
      </div>
    </div>
  );
}

export { ColorInput };
