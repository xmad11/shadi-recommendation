"use client"

import { memo, useCallback, useMemo, useState } from "react"
import { RestaurantCard } from "@/components/card"
import { CardGrid } from "@/components/cards"
import { SearchContainer } from "@/components/search/SearchContainer"
import type { CuisineOption, MealOption, AtmosphereOption } from "@/components/search/FilterSystem"
import type { ViewMode } from "@/components/search/ViewModeSystem"
import { priceTierValue } from "@/types/restaurant"

export type SortOptionId =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"

interface ResultsClientProps {
  initialData: any[] // ShadiRestaurant[]
}

export const ResultsClient = memo(function ResultsClient({ initialData }: ResultsClientProps) {
  // Local state only - no URL sync to prevent navigation issues
  const [cuisine, setCuisine] = useState<CuisineOption>("all")
  const [meal, setMeal] = useState<MealOption>("all")
  const [atmosphere, setAtmosphere] = useState<AtmosphereOption>("all")
  const [sort, setSort] = useState<SortOptionId>("newest")
  const [viewMode, setViewMode] = useState<ViewMode>("grid-2")

  const filteredRestaurants = useMemo(() => {
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

    // Sort
    switch (sort) {
      case "price-desc":
        results.sort((a, b) => priceTierValue(b.price) - priceTierValue(a.price))
        break
      case "price-asc":
        results.sort((a, b) => priceTierValue(a.price) - priceTierValue(b.price))
        break
      case "newest":
        results.sort((a, b) => {
          const dateA = a.addedDate ? new Date(a.addedDate).getTime() : 0
          const dateB = b.addedDate ? new Date(b.addedDate).getTime() : 0
          return dateB - dateA
        })
        break
      case "oldest":
        results.sort((a, b) => {
          const dateA = a.addedDate ? new Date(a.addedDate).getTime() : 0
          const dateB = b.addedDate ? new Date(b.addedDate).getTime() : 0
          return dateA - dateB
        })
        break
      case "name-asc":
        results.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        results.sort((a, b) => b.name.localeCompare(a.name))
        break
    }

    return results
  }, [cuisine, meal, atmosphere, sort, initialData])

  const handleCuisineChange = useCallback((v: CuisineOption) => setCuisine(v), [])
  const handleMealChange = useCallback((v: MealOption) => setMeal(v), [])
  const handleAtmosphereChange = useCallback((v: AtmosphereOption) => setAtmosphere(v), [])
  const handleSortChange = useCallback((v: SortOptionId) => setSort(v), [])
  const handleViewChange = useCallback((v: ViewMode) => setViewMode(v), [])

  const cardVariant = viewMode === "list" ? "list" : "detailed"

  return (
    <>
      <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--page-padding-x)] mt-[var(--spacing-md)]">
        <SearchContainer
          resultCount={filteredRestaurants.length}
          cuisine={cuisine}
          onCuisineChange={handleCuisineChange}
          meal={meal}
          onMealChange={handleMealChange}
          atmosphere={atmosphere}
          onAtmosphereChange={handleAtmosphereChange}
          sort={sort}
          onSortChange={handleSortChange}
          viewMode={viewMode}
          onViewChange={handleViewChange}
        />
      </div>

      <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--page-padding-x)] mt-[var(--spacing-lg)]">
        <CardGrid viewMode={viewMode}>
          {filteredRestaurants.map((r) => (
            <RestaurantCard key={r.id} {...r} variant={cardVariant} href={`/restaurants/${r.slug}`} />
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
      <div className="space-y-6 mb-8">
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
