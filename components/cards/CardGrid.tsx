import { cn } from "@/lib/utils"

export type ViewMode = "list" | "grid-1" | "grid-2" | "grid-3" | "grid-4"

export function CardGrid({
  children,
  viewMode = "grid-2",
  className = "",
}: {
  children: React.ReactNode
  viewMode?: ViewMode
  className?: string
}) {
  // For list view, return a simple flex column layout
  if (viewMode === "list") {
    return (
      <div className={cn("flex flex-col gap-[var(--spacing-md)] w-full", className)}>
        {children}
      </div>
    )
  }

  // Grid layouts with proper column counts and spacing
  // Mobile: grid-1 (1 col), grid-2 (2 cols)
  // Tablet: grid-2 (2 cols), grid-3 (3 cols), grid-4 (2 cols)
  // Desktop: grid-2 (2 cols), grid-3 (3 cols), grid-4 (4 cols)
  const gridClasses: Record<Exclude<ViewMode, "list">, string> = {
    "grid-1": "grid grid-cols-1 gap-[var(--spacing-sm)]",
    "grid-2": "grid grid-cols-2 gap-[var(--spacing-xs)] sm:gap-[var(--spacing-md)]",
    "grid-3": "grid grid-cols-2 sm:grid-cols-3 gap-[var(--spacing-sm)]",
    "grid-4": "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-sm)]",
  }

  return (
    <div className={cn("w-full", gridClasses[viewMode], className)}>
      {children}
    </div>
  )
}
