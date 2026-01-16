import type { ShadiRestaurant } from "@/types/restaurant"
import { memo } from "react"
import { BaseCard, type CardVariant } from "./BaseCard"
import { DetailedVariant, ListVariant } from "./variants"

export const RestaurantCard = memo(function RestaurantCard({
  id,
  image,
  images,
  priceBucketId,
  cuisine,
  description,
  emirate,
  district,
  address,
  mapCoordinates,
  features,
  name,
  variant = "detailed",
  href,
  locale = "ar",
}: ShadiRestaurant & {
  variant?: CardVariant
  href?: string
  locale?: "en" | "ar"
}) {
  const location = emirate || district ? { emirate, district, address, mapCoordinates } : undefined

  return (
    <BaseCard variant={variant} type="restaurant">
      {variant === "detailed" && (
        <DetailedVariant
          images={images}
          alt={name}
          title={name}
          category={cuisine}
          priceBucketId={priceBucketId}
          locale={locale}
          location={location}
          features={features}
          href={href}
        />
      )}
      {variant === "list" && (
        <ListVariant
          images={images}
          alt={name}
          title={name}
          description={description}
          cuisine={cuisine}
          priceBucketId={priceBucketId}
          locale={locale}
          location={location}
          href={href}
        />
      )}
    </BaseCard>
  )
})
