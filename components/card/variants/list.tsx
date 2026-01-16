import { CardCarousel } from "@/components/carousel"
import { MapPin } from "lucide-react"
import type { PriceBucketId, MapCoordinates, UAEEmirate } from "@/types/restaurant"
import { getPriceLabel } from "@/types/restaurant"
import { memo } from "react"

export interface ListVariantProps {
  images: string[]
  alt: string
  title: string
  description?: string
  cuisine?: string
  category?: string
  priceBucketId?: PriceBucketId
  locale?: "en" | "ar"
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
  priceBucketId,
  locale = "ar",
  location,
  href,
}: ListVariantProps) {
  const mainCategory = cuisine || category
  const locationStr = location ? [location.district, location.emirate].filter(Boolean).join(", ") : undefined

  const content = (
    <div className="flex bg-[var(--card-bg)] rounded-[var(--radius-xl)] hover:shadow-[var(--shadow-lg)] transition-all cursor-pointer group overflow-hidden">
      <div className="relative w-[var(--card-list-image-width)] lg:w-[var(--card-list-image-width-desktop)] flex-shrink-0 overflow-hidden rounded-[var(--radius-xl)] bg-[var(--fg-10)]">
        <CardCarousel images={images || []} alt={alt} height="100%" className="h-full" restaurantName={title} showIndicators={true} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-[var(--card-gap-sm)] p-[var(--card-gap-md)]">
        <h3 className="text-[var(--card-title-base)] font-[var(--font-weight-semibold)] text-[var(--fg)] line-clamp-1 leading-tight">{title}</h3>

        {locationStr && (
          <div className="flex items-center gap-1.5 text-sm text-[var(--fg-50)]">
            <MapPin className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" strokeWidth={1.5} />
            <span className="line-clamp-1 leading-tight">{locationStr}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {mainCategory && (
            <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-primary)]/8 text-[var(--color-primary)] text-xs font-medium line-clamp-1">
              {mainCategory}
            </span>
          )}
          {priceBucketId && <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-primary)]/8 text-[var(--color-primary)] text-xs font-medium">{getPriceLabel(priceBucketId, locale)}</span>}
        </div>
      </div>
    </div>
  )

  return href ? <a href={href}>{content}</a> : content
})
