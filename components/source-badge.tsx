import { cn } from "@/lib/utils"

export type Level = "市" | "区" | "校" | "我"

const styles: Record<Level, string> = {
  市: "bg-[oklch(0.6_0.13_40)] text-white",
  区: "bg-[oklch(0.55_0.09_200)] text-white",
  校: "bg-brand text-brand-foreground",
  我: "bg-muted-foreground/80 text-background",
}

const labels: Record<Level, string> = {
  市: "市级",
  区: "区级",
  校: "校本",
  我: "我的",
}

export function SourceBadge({
  level,
  showLabel = false,
}: {
  level: Level
  showLabel?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded text-[11px] font-medium",
        showLabel ? "px-1.5 py-0.5" : "",
      )}
    >
      <span
        className={cn(
          "grid size-[18px] place-items-center rounded text-[11px] font-bold",
          styles[level],
        )}
      >
        {level}
      </span>
      {showLabel && (
        <span className="text-muted-foreground">{labels[level]}</span>
      )}
    </span>
  )
}
