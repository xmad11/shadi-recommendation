"use client"

import { ChevronDown, X } from "lucide-react"
import { useMemo, useCallback } from "react"
import type { MealType, AtmosphereType } from "@/types/restaurant"

/* =========================
   Types
========================= */

export type CuisineOption =
  | "all"
  | "emirati"
  | "arabic"
  | "lebanese"
  | "indian"
  | "pakistani"
  | "chinese"
  | "japanese"
  | "thai"
  | "italian"
  | "seafood"
  | "international"

export type MealOption = "all" | MealType
export type AtmosphereOption = "all" | AtmosphereType

/* =========================
   Static Options
========================= */

const CUISINES = [
  { id: "all", label: "All Cuisines" },
  { id: "emirati", label: "Emirati" },
  { id: "arabic", label: "Arabic" },
  { id: "lebanese", label: "Lebanese" },
  { id: "indian", label: "Indian" },
  { id: "pakistani", label: "Pakistani" },
  { id: "chinese", label: "Chinese" },
  { id: "japanese", label: "Japanese" },
  { id: "thai", label: "Thai" },
  { id: "italian", label: "Italian" },
  { id: "seafood", label: "Seafood" },
  { id: "international", label: "International" },
] as const

const MEALS = [
  { id: "all", label: "All Meals" },
  { id: "Breakfast", label: "Breakfast" },
  { id: "Lunch", label: "Lunch" },
  { id: "Dinner", label: "Dinner" },
] as const

const ATMOSPHERES = [
  { id: "all", label: "All Atmospheres" },
  { id: "Romantic", label: "Romantic" },
  { id: "Casual", label: "Casual" },
  { id: "Fine Dining", label: "Fine Dining" },
  { id: "Outdoor", label: "Outdoor" },
  { id: "Family Friendly", label: "Family Friendly" },
  { id: "Live Music", label: "Live Music" },
  { id: "View", label: "View" },
] as const

/* =========================
   Dropdown Component
========================= */

interface DropdownProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: readonly { id: string; label: string }[]
}

function Dropdown({ label, value, onChange, options }: DropdownProps) {
  return (
    <div className="relative">
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-[var(--fg-20)] rounded-lg px-2 sm:px-4 py-2.5 pr-8 sm:pr-10 text-sm font-medium text-[var(--fg)] cursor-pointer transition-all hover:border-[var(--fg-30)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--fg-50)] pointer-events-none" strokeWidth={2} />
      </div>
    </div>
  )
}

/* =========================
   Active Badge Component
========================= */

function ActiveBadge({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-medium hover:bg-black/80 transition-colors"
    >
      {label}
      <X className="w-3 h-3" />
    </button>
  )
}

/* =========================
   Main Component
========================= */

interface FilterSystemProps {
  cuisine: CuisineOption
  onCuisineChange: (v: CuisineOption) => void
  meal: MealOption
  onMealChange: (v: MealOption) => void
  atmosphere: AtmosphereOption
  onAtmosphereChange: (v: AtmosphereOption) => void
}

export function FilterSystem({
  cuisine,
  onCuisineChange,
  meal,
  onMealChange,
  atmosphere,
  onAtmosphereChange,
}: FilterSystemProps) {
  // Stable remove callbacks
  const handleRemoveCuisine = useCallback(() => onCuisineChange("all"), [onCuisineChange])
  const handleRemoveMeal = useCallback(() => onMealChange("all"), [onMealChange])
  const handleRemoveAtmosphere = useCallback(() => onAtmosphereChange("all"), [onAtmosphereChange])

  // Memoize activeFilters to prevent recreation on every render
  const activeFilters = useMemo(() => [
    cuisine !== "all" ? { label: cuisine, remove: handleRemoveCuisine } : null,
    meal !== "all" ? { label: meal, remove: handleRemoveMeal } : null,
    atmosphere !== "all" ? { label: atmosphere, remove: handleRemoveAtmosphere } : null,
  ].filter(Boolean), [cuisine, meal, atmosphere, handleRemoveCuisine, handleRemoveMeal, handleRemoveAtmosphere])

  return (
    <div className="space-y-4">
      {/* Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Dropdown
          label="Meal"
          value={meal}
          onChange={(v) => onMealChange(v as MealOption)}
          options={MEALS}
        />
        <Dropdown
          label="Cuisine"
          value={cuisine}
          onChange={(v) => onCuisineChange(v as CuisineOption)}
          options={CUISINES}
        />
        <Dropdown
          label="Atmosphere"
          value={atmosphere}
          onChange={(v) => onAtmosphereChange(v as AtmosphereOption)}
          options={ATMOSPHERES}
        />
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-2">
          <span className="text-xs text-[var(--fg-50)]">Active filters:</span>
          {activeFilters.map((filter) => (
            <ActiveBadge
              key={filter!.label}
              label={filter!.label}
              onRemove={filter!.remove}
            />
          ))}
        </div>
      )}
    </div>
  )
}
