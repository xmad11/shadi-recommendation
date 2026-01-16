/* ═══════════════════════════════════════════════════════════════════════════════
   CARD SYSTEM - Unified card architecture
   ═══════════════════════════════════════════════════════════════════════════════ */

// Base
export { BaseCard } from "./BaseCard"
export type { BaseCardProps, CardVariant, CardType } from "./BaseCard"

// Semantic cards
export { RestaurantCard } from "./RestaurantCard"

// Re-export restaurant types from central types file
export type {
  ShadiRestaurant,
  RestaurantCardProps,
  UAEEmirate,
  PriceBucketId,
  MealType,
  AtmosphereType,
  MapCoordinates,
} from "@/types/restaurant"

export { getPriceLabel, priceBucketValue } from "@/types/restaurant"

// Variants (pure UI components)
export * from "./variants"
