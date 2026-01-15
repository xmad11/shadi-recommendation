"use client"

import { FilterSystem, type MealOption, type AtmosphereOption, type CuisineOption } from "./FilterSystem"
import { SortButton, type SortOptionId } from "./SortSystem"
import { ViewModeButton, type ViewMode } from "./ViewModeSystem"

interface SearchContainerProps {
  resultCount: number
  cuisine: CuisineOption
  meal: MealOption
  atmosphere: AtmosphereOption
  sort: SortOptionId
  viewMode: ViewMode
  onCuisineChange: (v: CuisineOption) => void
  onMealChange: (v: MealOption) => void
  onAtmosphereChange: (v: AtmosphereOption) => void
  onSortChange: (v: SortOptionId) => void
  onViewChange: (v: ViewMode) => void
}

export function SearchContainer(props: SearchContainerProps) {
  return (
    <div className="space-y-6">
      <FilterSystem
        cuisine={props.cuisine}
        onCuisineChange={props.onCuisineChange}
        meal={props.meal}
        onMealChange={props.onMealChange}
        atmosphere={props.atmosphere}
        onAtmosphereChange={props.onAtmosphereChange}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-black/60">
          <strong>{props.resultCount}</strong> restaurants
        </span>

        <div className="flex items-center gap-3">
          <ViewModeButton
            currentView={props.viewMode}
            onViewChange={props.onViewChange}
          />
          <SortButton
            currentSort={props.sort}
            onSortChange={props.onSortChange}
          />
        </div>
      </div>
    </div>
  )
}
