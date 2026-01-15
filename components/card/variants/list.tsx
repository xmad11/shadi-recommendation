import { CardCarousel } from "@/components/carousel"
import { MapPinIcon } from "@/components/icons"
import type { PriceTier, MapCoordinates, UAEEmirate } from "@/types/restaurant"
import { memo } from "react"

export interface ListVariantProps {
  images: string[]
  alt: string
  title: string
  description?: string
  cuisine?: string
  category?: string
  price?: PriceTier
  location?: {
    emirate?: UAEEmirate
    district?: string
    address?: string
    mapCoordinates?: MapCoordinates
  }
  href?: string
}

export const ListVariant = memo(function ListVariant({
  images,
  alt,
  title,
  cuisine,
  category,
  price,
  location,
  href,
}: ListVariantProps) {
  const hasMultipleImages = (images?.length || 0) > 1
  const mainCategory = cuisine || category
  const locationStr = location ? [location.district, location.emirate].filter(Boolean).join(", ") : undefined

  const content = (
    <div className="flex bg-[var(--card-bg)] rounded-[var(--radius-xl)] hover:shadow-[var(--shadow-lg)] transition-all cursor-pointer group overflow-hidden">
      <div className="relative w-[var(--card-list-image-width)] lg:w-[var(--card-list-image-width-desktop)] flex-shrink-0 overflow-hidden rounded-[var(--radius-xl)] bg-[var(--fg-10)]">
        <CardCarousel images={images || []} alt={alt} height="100%" className="h-full" restaurantName={title} showIndicators={false} />

        {hasMultipleImages && (
          <div className="absolute bottom-[var(--dot-size-xs)] left-1/2 -translate-x-1/2 flex gap-[var(--dot-size-xs)] pointer-events-none">
            {images.slice(0, 3).map((img, i) => (
              <span key={`list-dot-${i}-${img}`} className="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-full bg-[var(--color-white)]/80 shadow-sm" />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-[var(--card-gap-sm)] p-[var(--card-gap-md)]">
        <h3 className="text-[var(--card-title-base)] font-[var(--font-weight-semibold)] text-[var(--fg)] line-clamp-1 leading-tight">{title}</h3>

        <div className="flex items-center gap-[var(--card-gap-md)] text-[var(--card-meta-xs)] text-secondary-gray">
          {locationStr && (
            <span className="flex items-center gap-[var(--card-gap-xs)] line-clamp-1 leading-tight">
              <MapPinIcon className="w-[var(--icon-size-sm)] h-[var(--icon-size-sm)] text-secondary-gray flex-shrink-0" />
              <span className="text-secondary-gray line-clamp-1 leading-tight">{locationStr}</span>
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          {mainCategory && (
            <span className="inline-flex items-center bg-badge-primary/10 text-badge-primary rounded-[var(--radius-sm)] px-[var(--card-gap-sm)] py-[var(--card-gap-xs)] text-[var(--font-size-sm)] font-medium line-clamp-1">
              {mainCategory}
            </span>
          )}
          {price && <span className="text-secondary-gray ml-auto">{price}</span>}
        </div>
      </div>
    </div>
  )

  return href ? <a href={href}>{content}</a> : content
})
