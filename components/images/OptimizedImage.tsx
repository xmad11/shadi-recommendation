/* ═══════════════════════════════════════════════════════════════════════════════
   OPTIMIZED IMAGE - BlurHash placeholder + Next.js Image optimization
   Phase 1 Performance: 20-char BlurHash vs 50KB placeholder images
   ═══════════════════════════════════════════════════════════════════════════════ */

"use client"

import { decodeBlurHash } from "@/lib/images/decode-blurhash"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"

export interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  blurHash?: string
  className?: string
  priority?: boolean
  loading?: "lazy" | "eager"
  fill?: boolean
  sizes?: string
  quality?: number
  onLoad?: () => void
  onError?: () => void
}

/**
 * Optimized Image Component with BlurHash placeholder
 * Shows BlurHash immediately, fades in real image when loaded
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  blurHash,
  className = "",
  priority = false,
  loading = "lazy",
  fill = false,
  sizes,
  quality = 60,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [blurDataUrl, setBlurDataUrl] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // Decode BlurHash to data URL
  useEffect(() => {
    if (blurHash && !blurDataUrl) {
      const decoded = decodeBlurHash(blurHash, 32, 32)
      if (decoded) {
        setBlurDataUrl(decoded)
      }
    }
  }, [blurHash, blurDataUrl])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  // If error and we have blurhash, show that
  if (hasError && blurDataUrl) {
    return (
      <div
        className={`bg-[var(--bg-secondary)] flex items-center justify-center ${className}`}
        // @design-exception DYNAMIC_VALUE: Width & height are runtime props from Next.js Image that cannot be expressed with static Tailwind classes
        style={{ width: fill ? "100%" : width, height: fill ? "100%" : height }}
      >
        <Image
          src={blurDataUrl}
          alt={alt}
          width={width || 400}
          height={height || 300}
          className="opacity-50"
          loading={priority ? undefined : loading}
        />
      </div>
    )
  }

  // BlurHash placeholder (shown until image loads)
  if (blurDataUrl && !isLoaded) {
    if (fill) {
      return (
        <div className={`relative ${className}`}>
          {/* BlurHash background */}
          <Image
            src={blurDataUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 render-pixelated"
            style={{ imageRendering: "pixelated" }}
            // @design-exception DYNAMIC_VALUE: imageRendering property is browser-specific and cannot be expressed with Tailwind utilities
            fill
            sizes={sizes}
            priority={priority}
            loading={priority ? undefined : loading}
          />

          {/* Real image (fades in) */}
          <Image
            ref={imgRef}
            src={src}
            alt={alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            fill
            sizes={sizes}
            quality={quality}
            priority={priority}
            loading={priority ? undefined : loading}
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      )
    }

    return (
      <div
        className={`relative ${className}`}
        // @design-exception DYNAMIC_VALUE: Width & height are runtime props from Next.js Image that cannot be expressed with static Tailwind classes
        style={{ width, height }}
      >
        {/* BlurHash background */}
        <Image
          src={blurDataUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ imageRendering: "pixelated" }}
          // @design-exception DYNAMIC_VALUE: imageRendering property is browser-specific and cannot be expressed with Tailwind utilities
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : loading}
        />

        {/* Real image (fades in) */}
        <Image
          ref={imgRef}
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          loading={priority ? undefined : loading}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    )
  }

  // Regular Next.js Image (no BlurHash)
  return (
    <Image
      ref={imgRef}
      src={src}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      fill={fill}
      sizes={sizes}
      quality={quality}
      priority={priority}
      loading={priority ? undefined : loading}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
    />
  )
}

/**
 * Skeleton placeholder for loading states
 */
export function ImageSkeleton({
  className = "",
  width = 400,
  height = 300,
}: {
  className?: string
  width?: number
  height?: number
}) {
  return (
    <div
      className={`bg-[var(--bg-secondary)] animate-pulse rounded-lg ${className}`}
      style={{ width, height }}
      // @design-exception DYNAMIC_VALUE: Width & height are runtime props that cannot be expressed with static Tailwind classes
    />
  )
}
