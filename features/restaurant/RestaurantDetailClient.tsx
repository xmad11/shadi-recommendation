/* ═══════════════════════════════════════════════════════════════════════════════
   RESTAURANT DETAIL CLIENT - Fixed layout
   ═══════════════════════════════════════════════════════════════════════════════ */

"use client"

import { MapPin } from "lucide-react"
import { useNavigation } from "@/components/navigation/NavigationProvider"
import { getPriceLabel } from "@/types/restaurant"
import type { ShadiRestaurant } from "@/types/restaurant"
import { CardCarousel } from "@/components/carousel"
import { memo, useCallback, useEffect } from "react"
import { useLanguage } from "@/context/LanguageProvider"

interface RestaurantDetailClientProps {
  restaurant: ShadiRestaurant
}

function RestaurantDetailClient({ restaurant }: RestaurantDetailClientProps) {
  const { language } = useLanguage()
  const { showBackButtonInHeader, hideBackButton } = useNavigation()

  useEffect(() => {
    showBackButtonInHeader()
    return () => {
      hideBackButton()
    }
  }, [showBackButtonInHeader, hideBackButton])

  return (
    <div className="min-h-screen w-full">
      <main className="w-full">
        {/* Hero Image Carousel */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-[var(--fg-5)] mx-auto px-[var(--page-padding-x)] max-w-[var(--page-max-width)] mt-[var(--spacing-md)] rounded-[var(--radius-xl)] overflow-hidden">
          <CardCarousel images={restaurant.images} alt={restaurant.name} height="100%" className="h-full" restaurantName={restaurant.name} showIndicators={true} />
        </div>

        {/* Restaurant Info - Full width, left-aligned text */}
        <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--page-padding-x)] py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--fg)] mb-4">
            {restaurant.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--fg-50)] mb-4">
            {(restaurant.district || restaurant.emirate) && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[var(--color-primary)]" strokeWidth={1.5} />
                <span>{[restaurant.district, restaurant.emirate].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {restaurant.priceBucketId && <span>{getPriceLabel(restaurant.priceBucketId, language)}</span>}
            {restaurant.cuisine && <span>{restaurant.cuisine}</span>}
          </div>

          {restaurant.features && restaurant.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {restaurant.features.map((feature: string) => (
                <span
                  key={feature}
                  className="px-3 py-1 rounded-full bg-[var(--color-primary)]/8 text-[var(--color-primary)] text-xs font-medium"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {restaurant.description && (
          <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--page-padding-x)] py-4">
            <p className="text-[var(--fg-50)] leading-relaxed">{restaurant.description}</p>
          </div>
        )}

        {/* Contact Info */}
        <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--page-padding-x)] py-8 border-t border-[var(--fg-10)]">
          <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurant.phone && (
              <div className="p-4 rounded-xl bg-[var(--fg-5)]">
                <p className="text-xs text-[var(--fg-40)] mb-1">Phone</p>
                <p className="text-sm font-medium text-[var(--fg)]">{restaurant.phone}</p>
              </div>
            )}
            {restaurant.website && (
              <div className="p-4 rounded-xl bg-[var(--fg-5)]">
                <p className="text-xs text-[var(--fg-40)] mb-1">Website</p>
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}
            {restaurant.address && (
              <div className="p-4 rounded-xl bg-[var(--fg-5)] md:col-span-2">
                <p className="text-xs text-[var(--fg-40)] mb-1">Address</p>
                <p className="text-sm font-medium text-[var(--fg)]">{restaurant.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-[var(--fg-10)] mt-12">
          <div className="flex flex-col items-center gap-3">
            <img src="/LOGO/logo.svg" alt="Shadi" className="h-8 opacity-40" />
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--fg-30)]">
              Your Gateway to Great Food
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default memo(RestaurantDetailClient)
