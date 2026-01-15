/* ═══════════════════════════════════════════════════════════════════════════════
   RESTAURANT TYPES - Simplified
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
 * Price tier levels
 */
export type PriceTier = "$" | "$$" | "$$$" | "$$$$"

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
  | string

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
  | string

/**
 * Map coordinates
 */
export interface MapCoordinates {
  lat: number
  lng: number
}

/**
 * Restaurant Data - Simplified
 */
export interface ShadiRestaurant {
  // Identity
  id: string
  slug: string
  name: string

  // Images
  image: string
  images: string[]

  // Price
  price: PriceTier

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
 * Format price for display
 */
export function formatPrice(price: PriceTier): string {
  const labels: Record<PriceTier, string> = {
    $: "Budget-friendly",
    $$: "Moderate",
    $$$: "Expensive",
    $$$$: "Very Expensive",
  }
  return labels[price] || price
}

/**
 * Get price tier as number for sorting
 */
export function priceTierValue(price: PriceTier): number {
  return { $: 1, $$: 2, $$$: 3, $$$$: 4 }[price] || 0
}
