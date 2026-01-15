import type { ShadiRestaurant } from "@/types/restaurant"
import { memo } from "react"
import { BaseCard, type CardVariant } from "./BaseCard"
import { DetailedVariant, ListVariant } from "./variants"

export const RestaurantCard = memo(function RestaurantCard({
  id,
  name,
  images,
  price,
  cuisine,
  description,
  emirate,
  district,
  address,
  mapCoordinates,
  features,
  variant = "detailed",
  href,
}: ShadiRestaurant & {
  variant?: CardVariant
  href?: string
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
          price={price}
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
          price={price}
          location={location}
          href={href}
        />
      )}
    </BaseCard>
  )
})
