/* ═══════════════════════════════════════════════════════════════════════════════
   RESTAURANT TYPES - AED Price System
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * UAE Emirates for location filtering
 */
export type UAEEmirate =
  | "Dubai"
  | "Abu Dhabi"
  | "Sharjah"
  | "Ajman"
  | "Umm Al Quwain"
  | "Ras Al Khaimah"
  | "Fujairah"

/**
 * AED Price Buckets - Numeric ranges only
 */
export type PriceBucketId = 1 | 2 | 3 | 4 | 5 | 6 | 7

/**
 * Price bucket definition with AED ranges
 */
export interface PriceBucket {
  id: PriceBucketId
  minPrice: number
  maxPrice: number | null // null = open-ended (luxury)
  labelEn: string
  labelAr: string
}

/**
 * All price buckets
 */
export const PRICE_BUCKETS: readonly PriceBucket[] = [
  { id: 1, minPrice: 0, maxPrice: 10, labelEn: "Under 10 AED", labelAr: "أقل من 10 دراهم" },
  { id: 2, minPrice: 10, maxPrice: 30, labelEn: "10–30 AED", labelAr: "10–30 درهم" },
  { id: 3, minPrice: 30, maxPrice: 50, labelEn: "30–50 AED", labelAr: "30–50 درهم" },
  { id: 4, minPrice: 50, maxPrice: 100, labelEn: "50–100 AED", labelAr: "50–100 درهم" },
  { id: 5, minPrice: 100, maxPrice: 200, labelEn: "100–200 AED", labelAr: "100–200 درهم" },
  { id: 6, minPrice: 200, maxPrice: 400, labelEn: "200–400 AED", labelAr: "200–400 درهم" },
  { id: 7, minPrice: 500, maxPrice: null, labelEn: "Above 500 AED", labelAr: "أكثر من 500 درهم" },
] as const

/**
 * Get price bucket label (always AED)
 */
export function getPriceLabel(
  bucketId: PriceBucketId,
  locale: "en" | "ar" = "ar"
): string {
  const bucket = PRICE_BUCKETS.find((b) => b.id === bucketId)
  if (!bucket) return ""
  return locale === "ar" ? bucket.labelAr : bucket.labelEn
}

/**
 * Get price bucket by min/max price values
 */
export function getPriceBucket(minPrice: number, maxPrice: number | null): PriceBucket {
  return (
    PRICE_BUCKETS.find(
      (bucket) =>
        bucket.minPrice === minPrice &&
        (bucket.maxPrice === maxPrice || (bucket.maxPrice === null && maxPrice === null))
    ) || PRICE_BUCKETS[0]
  )
}

/**
 * Cuisine types
 */
export type CuisineType =
  | "Emirati"
  | "Arabic"
  | "Lebanese"
  | "Indian"
  | "Pakistani"
  | "Iranian"
  | "Chinese"
  | "Japanese"
  | "Thai"
  | "Italian"
  | "French"
  | "American"
  | "Mexican"
  | "Seafood"
  | "Grill"
  | "International"
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

/**
 * Meal types
 */
export type MealType = "Breakfast" | "Lunch" | "Dinner"

/**
 * Atmosphere types
 */
export type AtmosphereType =
  | "Romantic"
  | "Casual"
  | "Fine Dining"
  | "Outdoor"
  | "Family Friendly"
  | "Live Music"
  | "View"

/**
 * Map coordinates
 */
export interface MapCoordinates {
  lat: number
  lng: number
}

/**
 * Restaurant Data - With AED pricing
 */
export interface ShadiRestaurant {
  // Identity
  id: string
  slug: string
  name: string

  // Images
  image: string
  images: string[]

  // Price - AED system
  priceBucketId: PriceBucketId
  minPrice: number
  maxPrice: number | null

  // Cuisine/Category
  cuisine: CuisineType
  description?: string

  // Meal Types (for filtering)
  meals?: MealType[]

  // Atmosphere (for filtering)
  atmosphere?: AtmosphereType[]

  // Location
  emirate?: UAEEmirate
  district?: string
  address?: string
  mapCoordinates?: MapCoordinates

  // Features
  features?: string[]
  isHotelRestaurant?: boolean
  hasDelivery?: boolean

  // Contact
  phone?: string
  website?: string

  // Added date for sorting
  addedDate?: string
}

/**
 * Restaurant Card Props
 */
export interface RestaurantCardProps extends ShadiRestaurant {
  href?: string
  variant?: "grid" | "list" | "detailed"
}

/**
 * Get price bucket ID for sorting
 */
export function priceBucketValue(bucketId: PriceBucketId): number {
  return bucketId
}
