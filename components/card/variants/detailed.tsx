import { CardCarousel } from "@/components/carousel"
import { MapPin } from "lucide-react"
import type { PriceBucketId, MapCoordinates, UAEEmirate } from "@/types/restaurant"
import { getPriceLabel } from "@/types/restaurant"
import { memo } from "react"

export interface DetailedVariantProps {
  images: string[]
  alt: string
  title: string
  category?: string
  priceBucketId?: PriceBucketId
  locale?: "en" | "ar"
  location?: {
    emirate?: UAEEmirate
    district?: string
    address?: string
    mapCoordinates?: MapCoordinates
  }
  features?: string[]
  href?: string
}

export const DetailedVariant = memo(function DetailedVariant({
  images,
  alt,
  title,
  category,
  priceBucketId,
  locale = "ar",
  location,
  features = [],
  href,
}: DetailedVariantProps) {
  const locationStr = location ? [location.district, location.emirate].filter(Boolean).join(", ") : undefined

  const content = (
    <div className="flex flex-col h-auto group min-w-0">
      <div className="relative aspect-[4/3] rounded-[var(--radius-xl)] overflow-hidden">
        <CardCarousel images={images || []} alt={alt} height="100%" className="h-full" restaurantName={title} showIndicators={true} />
        {category && (
          <span className="absolute top-2 left-2 z-50 inline-block px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-xs font-semibold shadow-sm pointer-events-none">
            {category}
          </span>
        )}
      </div>

      <div className="mt-[var(--spacing-sm)] flex flex-col justify-start pt-1">
        <h3 className="text-[var(--font-size-sm)] font-[var(--font-weight-semibold)] text-[var(--fg)] line-clamp-1 leading-tight">{title}</h3>

        {locationStr && (
          <div className="flex items-center gap-1.5 text-sm text-[var(--fg-50)] mt-[var(--spacing-xs)]">
            <MapPin className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" aria-hidden="true" strokeWidth={1.5} />
            <span className="line-clamp-1 leading-tight">{locationStr}</span>
          </div>
        )}

        {priceBucketId && (
          <div className="flex items-center gap-1.5 mt-[var(--spacing-xs)]">
            <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-primary)]/8 text-[var(--color-primary)] text-xs font-medium">{getPriceLabel(priceBucketId, locale)}</span>
          </div>
        )}
      </div>
    </div>
  )

  return href ? <a href={href}>{content}</a> : content
})
