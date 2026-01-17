"use client"

import { memo, useCallback, useEffect, useMemo, useState, useRef } from "react"
import { List, Square, Columns2, Columns3, Columns4, ArrowUpDown, ArrowDownUp, ArrowUp, ArrowDown } from "lucide-react"
import { RestaurantCard } from "@/components/card"
import { CardGrid, type ViewMode } from "@/components/cards"
import { FilterSystem, type CuisineOption, type MealOption, type AtmosphereOption } from "@/components/search/FilterSystem"
import { priceBucketValue, type ShadiRestaurant } from "@/types/restaurant"
import { useLanguage } from "@/context/LanguageProvider"

export type SortOptionId =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"

interface ResultsClientProps {
  initialData: ShadiRestaurant[]
}

// Sort options configuration
const SORT_OPTIONS = [
  { id: "newest" as const, icon: ArrowUpDown, label: "Newest First" },
  { id: "oldest" as const, icon: ArrowDownUp, label: "Oldest First" },
  { id: "price-asc" as const, icon: ArrowUp, label: "Price: Low to High" },
  { id: "price-desc" as const, icon: ArrowDown, label: "Price: High to Low" },
] as const

// View options configuration
// Mobile: list, grid-1, grid-2
// Tablet: list, grid-2, grid-3
// Desktop: list, grid-2, grid-3, grid-4
const ALL_VIEW_OPTIONS = [
  { id: "list" as const, icon: List, label: "List View", minBreakpoint: "mobile" as const, maxBreakpoint: undefined as Breakpoint | undefined },
  { id: "grid-1" as const, icon: Square, label: "1 Column", minBreakpoint: "mobile" as const, maxBreakpoint: "mobile" as Breakpoint | undefined },
  { id: "grid-2" as const, icon: Columns2, label: "2 Columns", minBreakpoint: "mobile" as const, maxBreakpoint: undefined as Breakpoint | undefined },
  { id: "grid-3" as const, icon: Columns3, label: "3 Columns", minBreakpoint: "tablet" as const, maxBreakpoint: undefined as Breakpoint | undefined },
  { id: "grid-4" as const, icon: Columns4, label: "4 Columns", minBreakpoint: "desktop" as const, maxBreakpoint: undefined as Breakpoint | undefined },
] as const

// Breakpoint definitions matching Tailwind's default breakpoints
type Breakpoint = "mobile" | "tablet" | "desktop"
const BREAKPOINT_VALUES: Record<Breakpoint, number> = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
}

// Helper: Get current breakpoint
function getBreakpoint(): Breakpoint {
  if (typeof window === "undefined") return "desktop"
  const width = window.innerWidth
  if (width < BREAKPOINT_VALUES.tablet) return "mobile"
  if (width < BREAKPOINT_VALUES.desktop) return "tablet"
  return "desktop"
}

// Helper: Get visible view options for current breakpoint
// Mobile: list, grid-1, grid-2
// Tablet: list, grid-2, grid-3
// Desktop: list, grid-2, grid-3, grid-4
function getVisibleOptions(breakpoint: Breakpoint) {
  const breakpointOrder: Breakpoint[] = ["mobile", "tablet", "desktop"]
  const currentLevel = breakpointOrder.indexOf(breakpoint)

  return ALL_VIEW_OPTIONS.filter(opt => {
    const minLevel = breakpointOrder.indexOf(opt.minBreakpoint)
    const maxLevel = opt.maxBreakpoint !== undefined ? breakpointOrder.indexOf(opt.maxBreakpoint) : Infinity
    return currentLevel >= minLevel && currentLevel <= maxLevel
  })
}

// Inline Sort Button Component
function SortButton({ currentSort, onSortChange }: { currentSort: SortOptionId; onSortChange: (id: SortOptionId) => void }) {
  const currentIndex = SORT_OPTIONS.findIndex(opt => opt.id === currentSort)
  const currentOption = SORT_OPTIONS[currentIndex >= 0 ? currentIndex : 0]
  const CurrentIcon = currentOption.icon

  const handleClick = useCallback(() => {
    const nextIndex = (currentIndex + 1) % SORT_OPTIONS.length
    onSortChange(SORT_OPTIONS[nextIndex].id)
  }, [currentIndex, onSortChange])

  return (
    <button
      type="button"
      onClick={handleClick}
      className="p-[var(--spacing-xs)] rounded-[var(--radius-lg)] bg-[var(--color-white)] border border-[var(--fg-20)] text-[var(--fg)] hover:border-[var(--fg-30)] hover:bg-[var(--fg-5)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
      aria-label={`Sort: ${currentOption.label}. Click to cycle through sort options.`}
      title={currentOption.label}
    >
      <CurrentIcon className="w-[var(--icon-size-md)] h-[var(--icon-size-md)]" strokeWidth={2} />
    </button>
  )
}

// Inline View Mode Button Component - Fixed to prevent infinite loops
function ViewModeButton({ currentView, onViewChange }: { currentView: ViewMode; onViewChange: (view: ViewMode) => void }) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => getBreakpoint())
  const [visibleOptions, setVisibleOptions] = useState(() => getVisibleOptions(getBreakpoint()))

  // Use refs to track current values without triggering effect re-runs
  const currentViewRef = useRef(currentView)
  const onViewChangeRef = useRef(onViewChange)

  // Keep refs in sync
  useEffect(() => {
    currentViewRef.current = currentView
    onViewChangeRef.current = onViewChange
  }, [currentView, onViewChange])

  // Update breakpoint and visible options on resize and orientation change
  useEffect(() => {
    const handleResize = () => {
      const newBreakpoint = getBreakpoint()
      if (newBreakpoint !== breakpoint) {
        setBreakpoint(newBreakpoint)
        const newVisibleOptions = getVisibleOptions(newBreakpoint)
        setVisibleOptions(newVisibleOptions)

        // If current view is no longer visible, switch to first visible option
        const isCurrentVisible = newVisibleOptions.some(opt => opt.id === currentViewRef.current)
        if (!isCurrentVisible && newVisibleOptions.length > 0) {
          onViewChangeRef.current(newVisibleOptions[0].id)
        }
      }
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
    }
  }, [breakpoint])

  const currentIndex = visibleOptions.findIndex(opt => opt.id === currentView)
  const currentOption = visibleOptions[currentIndex >= 0 ? currentIndex : 0]
  const CurrentIcon = currentOption.icon

  const handleClick = useCallback(() => {
    const nextIndex = (currentIndex + 1) % visibleOptions.length
    onViewChange(visibleOptions[nextIndex].id)
  }, [currentIndex, visibleOptions, onViewChange])

  // Don't render if no options available
  if (visibleOptions.length === 0) return null

  return (
    <button
      type="button"
      onClick={handleClick}
      className="p-[var(--spacing-xs)] rounded-[var(--radius-lg)] bg-[var(--color-white)] border border-[var(--fg-20)] text-[var(--fg)] hover:border-[var(--fg-30)] hover:bg-[var(--fg-5)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
      aria-label={`View: ${currentOption.label}. Click to cycle through view options.`}
      title={currentOption.label}
    >
      <CurrentIcon className="w-[var(--icon-size-md)] h-[var(--icon-size-md)]" strokeWidth={2} />
    </button>
  )
}

export const ResultsClient = memo(function ResultsClient({ initialData }: ResultsClientProps) {
  const { language } = useLanguage()
  // Local state only - no URL sync to prevent navigation issues
  const [cuisine, setCuisine] = useState<CuisineOption>("all")
  const [meal, setMeal] = useState<MealOption>("all")
  const [atmosphere, setAtmosphere] = useState<AtmosphereOption>("all")
  const [sort, setSort] = useState<SortOptionId>("newest")
  const [viewMode, setViewMode] = useState<ViewMode>("grid-2")

  const filteredRestaurants = useMemo(() => {
    // Handle undefined or null initialData
    if (!initialData || !Array.isArray(initialData)) return []

    let results = [...initialData]

    // Filter by meal
    if (meal !== "all") {
      results = results.filter((r) => r.meals?.includes(meal))
    }

    // Filter by cuisine
    if (cuisine !== "all") {
      results = results.filter((r) => r.cuisine?.toLowerCase() === cuisine.toLowerCase())
    }

    // Filter by atmosphere
    if (atmosphere !== "all") {
      results = results.filter((r) => r.atmosphere?.includes(atmosphere))
    }

    // Sort (create new array to avoid mutation)
    const sorted = [...results].sort((a, b) => {
      switch (sort) {
        case "price-desc":
          return priceBucketValue(b.priceBucketId) - priceBucketValue(a.priceBucketId)
        case "price-asc":
          return priceBucketValue(a.priceBucketId) - priceBucketValue(b.priceBucketId)
        case "newest":
          const dateA = a.addedDate ? new Date(a.addedDate).getTime() : 0
          const dateB = b.addedDate ? new Date(b.addedDate).getTime() : 0
          return dateB - dateA
        case "oldest":
          const dateC = a.addedDate ? new Date(a.addedDate).getTime() : 0
          const dateD = b.addedDate ? new Date(b.addedDate).getTime() : 0
          return dateC - dateD
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        default:
          return 0
      }
    })

    return sorted
  }, [cuisine, meal, atmosphere, sort, initialData])

  const handleCuisineChange = useCallback((v: CuisineOption) => setCuisine(v), [])
  const handleMealChange = useCallback((v: MealOption) => setMeal(v), [])
  const handleAtmosphereChange = useCallback((v: AtmosphereOption) => setAtmosphere(v), [])
  const handleSortChange = useCallback((v: SortOptionId) => setSort(v), [])
  const handleViewChange = useCallback((v: ViewMode) => setViewMode(v), [])

  const cardVariant = viewMode === "list" ? "list" : "detailed"

  return (
    <>
      <div className="w-full sm:max-w-[var(--page-max-width)] mx-auto px-[var(--space-1)] sm:px-[var(--page-padding-x)] mt-[var(--spacing-md)]">
        <div className="space-y-[var(--spacing-lg)]">
          <FilterSystem
            cuisine={cuisine}
            onCuisineChange={handleCuisineChange}
            meal={meal}
            onMealChange={handleMealChange}
            atmosphere={atmosphere}
            onAtmosphereChange={handleAtmosphereChange}
          />

          <div className="flex flex-wrap items-center justify-between gap-[var(--spacing-xs)]">
            <span className="text-[var(--font-size-xs)] text-[var(--fg)]/60">
              <strong>{filteredRestaurants.length}</strong> restaurants
            </span>

            <div className="flex items-center gap-[var(--spacing-sm)] flex-wrap">
              <ViewModeButton
                currentView={viewMode}
                onViewChange={handleViewChange}
              />
              <SortButton
                currentSort={sort}
                onSortChange={handleSortChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full sm:max-w-[var(--page-max-width)] mx-auto px-[var(--space-1)] sm:px-[var(--page-padding-x)] mt-[var(--spacing-lg)]">
        <CardGrid viewMode={viewMode}>
          {filteredRestaurants.map((r) => (
            <RestaurantCard
              key={r.id}
              id={r.id}
              name={r.name}
              image={r.image}
              images={r.images}
              priceBucketId={r.priceBucketId}
              cuisine={r.cuisine}
              description={r.description}
              emirate={r.emirate}
              district={r.district}
              address={r.address}
              mapCoordinates={r.mapCoordinates}
              features={r.features}
              meals={r.meals}
              atmosphere={r.atmosphere}
              minPrice={r.minPrice}
              maxPrice={r.maxPrice}
              hasDelivery={r.hasDelivery}
              isHotelRestaurant={r.isHotelRestaurant}
              phone={r.phone}
              website={r.website}
              addedDate={r.addedDate}
              slug={r.slug}
              variant={cardVariant}
              href={`/restaurants/${r.slug}`}
              locale={language}
            />
          ))}
        </CardGrid>
      </div>
    </>
  )
})

// Skeleton component for Suspense fallback
export function RestaurantsPageSkeleton() {
  return (
    <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--page-padding-x)] mt-[var(--spacing-md)]">
      <div className="space-y-[var(--spacing-lg)] mb-8">
        <div className="h-8 bg-black/5 rounded w-48 animate-pulse" />
        <div className="h-6 bg-black/5 rounded w-32 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden">
            <div className="aspect-video bg-black/5 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-5 bg-black/5 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-black/5 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
