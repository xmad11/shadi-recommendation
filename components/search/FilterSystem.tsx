"use client"

import { X } from "lucide-react"
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
  { id: "all", label: "Cuisine" },
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
  { id: "all", label: "Meal" },
  { id: "Breakfast", label: "Breakfast" },
  { id: "Lunch", label: "Lunch" },
  { id: "Dinner", label: "Dinner" },
] as const

const ATMOSPHERES = [
  { id: "all", label: "Atmosphere" },
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
    <div className="relative flex-1 min-w-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-[var(--fg-20)] rounded-[var(--radius-lg)] px-[var(--spacing-xs)] py-[var(--spacing-xs)] text-sm font-medium text-[var(--fg)] cursor-pointer transition-all hover:border-[var(--fg-30)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-center"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/* =========================
   Active Badge Component
========================= */

type FilterType = "cuisine" | "meal" | "atmosphere"

function ActiveBadge({
  label,
  onRemove,
  type,
}: {
  label: string
  onRemove: () => void
  type: FilterType
}) {
  const colors = {
    cuisine: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    meal: "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]",
    atmosphere: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  }

  return (
    <button
      onClick={onRemove}
      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full ${colors[type]} text-xs font-medium hover:opacity-80 transition-opacity`}
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
    cuisine !== "all" ? { label: cuisine, remove: handleRemoveCuisine, type: "cuisine" as FilterType } : null,
    meal !== "all" ? { label: meal, remove: handleRemoveMeal, type: "meal" as FilterType } : null,
    atmosphere !== "all" ? { label: atmosphere, remove: handleRemoveAtmosphere, type: "atmosphere" as FilterType } : null,
  ].filter(Boolean), [cuisine, meal, atmosphere, handleRemoveCuisine, handleRemoveMeal, handleRemoveAtmosphere])

  return (
    <div className="space-y-[var(--spacing-md)]">
      {/* Dropdowns - always horizontal */}
      <div className="flex justify-center gap-[var(--spacing-xs)]">
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

      {/* Active Filters - scrollable in one line */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-[var(--spacing-xs)] overflow-x-auto pb-[var(--spacing-xs)] scrollbar-hide">
          <span className="text-xs text-[var(--fg-50)] flex-shrink-0">Active filters:</span>
          {activeFilters.map((filter) => (
            <ActiveBadge
              key={filter!.label}
              label={filter!.label}
              onRemove={filter!.remove}
              type={filter!.type}
            />
          ))}
        </div>
      )}
    </div>
  )
}
