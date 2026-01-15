import { cn } from "@/lib/utils"
import type { ViewMode } from "@/components/search/ViewModeSystem"

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
      <div className={cn("flex flex-col space-y-4", className)}>
        {children}
      </div>
    )
  }

  // Map view mode to grid columns
  const gridClasses: Record<Exclude<ViewMode, "list">, string> = {
    "grid-1": "grid grid-cols-1 gap-6",
    "grid-2": "grid grid-cols-1 sm:grid-cols-2 gap-6",
    "grid-3": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
    "grid-4": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
  }

  return (
    <div className={cn(gridClasses[viewMode], className)}>
      {children}
    </div>
  )
}
