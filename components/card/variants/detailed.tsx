import { CardCarousel } from "@/components/carousel"
import { MapPinIcon } from "@/components/icons"
import type { PriceTier, RestaurantLocation } from "@/types/restaurant"
import { memo } from "react"

export interface DetailedVariantProps {
  images: string[]
  alt: string
  title: string
  category?: string
  price?: PriceTier
  location?: RestaurantLocation
  features?: string[]
  href?: string
}

export const DetailedVariant = memo(function DetailedVariant({
  images,
  alt,
  title,
  category,
  price,
  location,
  features = [],
  href,
}: DetailedVariantProps) {
  const hasMultipleImages = (images?.length || 0) > 1
  const locationStr = location ? [location.district, location.emirate].filter(Boolean).join(", ") : undefined

  const content = (
    <div className="flex flex-col h-auto group">
      <div className="relative aspect-[4/3] rounded-[var(--radius-xl)] overflow-hidden">
        <CardCarousel images={images || []} alt={alt} height="100%" className="h-full" restaurantName={title} showIndicators={false} />

        {hasMultipleImages && (
          <div className="absolute top-[var(--dot-size-xs)] left-1/2 -translate-x-1/2 flex gap-[var(--dot-size-xs)]">
            {images.slice(0, 3).map((img, i) => (
              <span key={`image-dot-${i}-${img}`} className="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-full bg-[var(--color-white)]/80 shadow-sm" />
            ))}
          </div>
        )}
      </div>

      <div className="mt-[var(--spacing-sm)] flex flex-col justify-start">
        <h3 className="text-[var(--font-size-sm)] font-[var(--font-weight-semibold)] text-[var(--fg)] line-clamp-1 leading-tight">{title}</h3>

        {locationStr && (
          <div className="flex items-center gap-[var(--card-gap-xs)] mt-[var(--spacing-xs)]">
            <MapPinIcon className="w-[var(--font-size-sm)] h-[var(--font-size-sm)] text-secondary-gray flex-shrink-0" aria-hidden="true" />
            <span className="text-[var(--font-size-sm)] text-secondary-gray line-clamp-1 leading-tight">{locationStr}</span>
          </div>
        )}

        {(category || price) && (
          <div className="flex items-center justify-between mt-[var(--spacing-xs)]">
            {category && <span className="inline-block px-[var(--card-gap-xs)] py-[var(--radius-xs)] bg-badge-primary/10 text-badge-primary rounded text-[var(--card-meta-2xs)] font-medium truncate text-[var(--font-size-xs)]">{category}</span>}
            {price && <span className="text-secondary-gray ml-auto text-[var(--font-size-xs)]">{price}</span>}
          </div>
        )}
      </div>
    </div>
  )

  return href ? <a href={href}>{content}</a> : content
})
