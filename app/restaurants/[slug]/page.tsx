import { mockRestaurants } from "@/__mock__/restaurants"
import RestaurantDetailClient from "@/features/restaurant/RestaurantDetailClient"
import { notFound } from "next/navigation"
import { Suspense } from "react"

type Props = {
  params: Promise<{ slug: string }>
}

async function getRestaurantBySlug(slug: string) {
  // In production, this would fetch from the database
  // For now, we'll search the mock data
  return mockRestaurants.find((r) => r.slug === slug)
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const restaurant = await getRestaurantBySlug(slug)
  if (!restaurant) return { title: "Restaurant Not Found" }
  return { title: restaurant.name }
}

// PPR-compatible: Server component that accesses params
async function RestaurantPageContent({ params }: Props) {
  const { slug } = await params
  const restaurant = await getRestaurantBySlug(slug)
  if (!restaurant) notFound()

  // Calculate similar restaurants server-side (best practice)
  const similarRestaurants = mockRestaurants
    .filter((r) => r.id !== restaurant.id)
    .slice(0, 8)
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      images: r.images,
      rating: r.rating,
      cuisine: r.cuisine,
      district: r.district,
      emirate: r.emirate,
    }))

  return <RestaurantDetailClient restaurant={restaurant} similarRestaurants={similarRestaurants} />
}

// PPR-compatible: Wrapper with Suspense boundary
export default function RestaurantPage({ params }: Props) {
  return (
    <Suspense fallback={<RestaurantDetailSkeleton />}>
      <RestaurantPageContent params={params} />
    </Suspense>
  )
}

// Loading skeleton
function RestaurantDetailSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <div className="h-20 border-b border-[var(--fg-10)] animate-pulse bg-[var(--fg-5)]" />

      {/* Content skeleton */}
      <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--page-padding-x)] py-[var(--spacing-lg)]">
        {/* Hero image skeleton */}
        <div className="aspect-[21/9] rounded-[var(--radius-xl)] bg-[var(--fg-10)] animate-pulse mb-[var(--spacing-lg)]" />

        {/* Title section skeleton */}
        <div className="space-y-[var(--spacing-sm)] mb-[var(--spacing-lg)]">
          <div className="h-8 bg-[var(--fg-10)] rounded animate-pulse w-3/4" />
          <div className="h-4 bg-[var(--fg-5)] rounded animate-pulse w-1/2" />
        </div>

        {/* Info cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-md)]" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => `skeleton-info-${i}`).map((key) => (
            <div
              key={key}
              className="h-24 bg-[var(--fg-10)] rounded-[var(--radius-lg)] animate-pulse"
              aria-label={`Loading info card ${key.split("-")[2]}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
