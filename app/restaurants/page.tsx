import { Suspense } from "react"
import { Results, RestaurantsPageSkeleton } from "./Results"

// PPR: Prerender static shell, stream dynamic content
export const experimental_ppr = true

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<RestaurantsPageSkeleton />}>
      <Results />
    </Suspense>
  )
}
