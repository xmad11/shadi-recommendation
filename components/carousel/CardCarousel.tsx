/* ═══════════════════════════════════════════════════════════════════════════════
   CARD CAROUSEL - Embla Carousel + OptimizedImage + BlurHash
   Production-ready carousel for restaurant cards
   ═══════════════════════════════════════════════════════════════════════════════ */

"use client"

import { OptimizedImage } from "@/components/images"
import useEmblaCarousel from "embla-carousel-react"
import { memo, useCallback, useEffect, useMemo, useState } from "react"

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════════ */

export interface CardCarouselImage {
  url: string
  blurHash?: string
  alt?: string
}

export interface CardCarouselProps {
  images: string[] | CardCarouselImage[]
  alt?: string
  className?: string
  height?: string
  showIndicators?: boolean
  cardIndex?: number
  restaurantName?: string
  blurHash?: string // Fallback for string arrays
  onSlideChange?: (index: number) => void
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CARD CAROUSEL COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */

function CardCarouselComponent({
  images,
  alt = "Restaurant image",
  className = "",
  height = "100%",
  showIndicators = false,
  cardIndex = 0,
  restaurantName = "Restaurant",
  blurHash: fallbackBlurHash,
  onSlideChange,
}: CardCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: false,
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  })

  const [selectedIndex, setSelectedIndex] = useState(0)

  // Handle slide change
  const onSelect = useCallback(
    (api: ReturnType<typeof useEmblaCarousel>[1]) => {
      if (!api) return
      const index = api.selectedScrollSnap()
      setSelectedIndex(index)
      onSlideChange?.(index)
    },
    [onSlideChange]
  )

  useEffect(() => {
    if (!emblaApi) return

    onSelect(emblaApi)
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)

    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  // Generate responsive sizes prop
  const sizes =
    "(max-width: 768px) var(--carousel-image-sizes-mobile), (max-width: 1024px) var(--carousel-image-sizes-tablet), var(--carousel-image-sizes-desktop)"

  // Memoize normalized images to avoid expensive operations on every render
  const normalizedImages = useMemo<CardCarouselImage[]>(() => {
    return (images || []).map((img) => {
      if (typeof img === "string") {
        return {
          url: img,
          blurHash: fallbackBlurHash,
          alt: `${alt}`,
        }
      }
      return {
        url: img.url,
        blurHash: img.blurHash || fallbackBlurHash,
        alt: img.alt || alt,
      }
    })
  }, [images, fallbackBlurHash, alt])

  if (normalizedImages.length === 0) return null

  return (
    <div
      ref={emblaRef}
      className={`carousel-container relative overflow-hidden ${className}`}
      style={{ "--carousel-height": height } as React.CSSProperties}
      // @design-exception DYNAMIC_VALUE: Carousel height is a runtime prop passed via CSS custom property for dynamic sizing
    >
      {/* Carousel viewport */}
      <div className="flex h-full">
        {normalizedImages.map((image, index) => (
          <div
            key={`carousel-slide-${image.url}`}
            className="relative flex-shrink-0 flex-grow-0 w-full h-full"
          >
            <OptimizedImage
              src={image.url}
              alt={`${restaurantName} ${image.alt} ${index + 1}`}
              blurHash={image.blurHash}
              fill
              className="object-cover"
              sizes={sizes}
              quality={70}
              priority={cardIndex < 3}
            />
          </div>
        ))}
      </div>

      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-black)]/20 via-transparent to-transparent pointer-events-none z-0" />

      {/* Indicators */}
      {showIndicators && normalizedImages.length > 1 && (
        <div className="absolute bottom-[var(--spacing-xs)] left-1/2 -translate-x-1/2 flex gap-[var(--carousel-indicator-gap-mobile)] z-10 px-[var(--spacing-xs)] py-[var(--spacing-xs)]/2 rounded-full bg-[var(--color-black)]/20 backdrop-blur-sm sm:bottom-[var(--spacing-sm)] sm:gap-[var(--carousel-indicator-gap)] sm:px-[var(--spacing-xs)] sm:py-[var(--spacing-xs)]/2">
          {normalizedImages.map((img, index) => (
            <button
              key={`indicator-${img.url}-${index}`}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              className="transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-quart)]"
              aria-label={`Go to slide ${index + 1}`}
            >
              <span
                className={`block ${
                  index === selectedIndex
                    ? "w-[var(--carousel-indicator-width-mobile)] h-[var(--carousel-indicator-height-mobile)] bg-[var(--color-white)] rounded-[var(--radius-full)] shadow-[var(--shadow-lg)] sm:w-[var(--carousel-indicator-width)] sm:h-[var(--carousel-indicator-height)]"
                    : "w-[var(--carousel-indicator-dot-size-mobile)] h-[var(--carousel-indicator-dot-size-mobile)] bg-[var(--color-white)]/60 hover:bg-[var(--color-white)]/80 rounded-[var(--radius-full)] sm:w-[var(--carousel-indicator-dot-size)] sm:h-[var(--carousel-indicator-dot-size)]"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const CardCarousel = memo(CardCarouselComponent)
