import { mockRestaurants } from "@/__mock__/restaurants"
import { ResultsClient } from "./ResultsClient"

// Next.js 15+: Use fetch with revalidate for PPR caching
export const revalidate = 600 // 10 minutes

export async function Results() {
  // Simulate data fetching with cache - freeze the data to prevent mutations
  const initialData = Object.freeze([...mockRestaurants])

  return <ResultsClient initialData={initialData} />
}

export { RestaurantsPageSkeleton } from "./ResultsClient"
