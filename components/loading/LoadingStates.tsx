/* ═══════════════════════════════════════════════════════════════════════════════
   LOADING STATES - Complete loading system with skeletons, lazy loading
   Token-only styling, no hardcoded values
   ═══════════════════════════════════════════════════════════════════════════════ */

"use client"

import { ArrowPathIcon, ExclamationCircleIcon } from "@/components/icons"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════════ */

interface LoadingStateProps {
  isLoading?: boolean
  children?: React.ReactNode
  fallback?: React.ReactNode
  className?: string
  delay?: number
  minDisplay?: number
}

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  variant?: "text" | "circular" | "rectangular"
  lines?: number
  animated?: boolean
}

interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
}

interface LazyLoadProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
  threshold?: number
  className?: string
}

interface SmartLoadingProps {
  isLoading: boolean
  onRetry?: () => void
  error?: string
  retryCount?: number
  className?: string
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

interface StaggeredLoadingProps {
  count?: number
  className?: string
}

interface SkeletonCardProps {
  className?: string
}

interface SkeletonListProps {
  lines?: number
  className?: string
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SUSPENSE LOADING
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * SuspenseLoading - Loading component with delay and minimum display time
 */
export function SuspenseLoading({
  isLoading = true,
  children,
  fallback,
  className = "",
  delay = 200,
  minDisplay = 500,
}: LoadingStateProps) {
  const [showLoading, setShowLoading] = useState(false)
  const startTimeRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now()

      const timer = setTimeout(() => {
        setShowLoading(true)
      }, delay)

      return () => clearTimeout(timer)
    }
    if (startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current
      if (elapsed < minDisplay) {
        const timer = setTimeout(() => {
          setShowLoading(false)
        }, minDisplay - elapsed)

        return () => clearTimeout(timer)
      }
    } else {
      setShowLoading(false)
    }
  }, [isLoading, delay, minDisplay])

  if (!isLoading && !showLoading && children) {
    return <>{children}</>
  }

  return (
    <div
      className={cn(
        "transition-opacity duration-[var(--duration-normal)]",
        showLoading ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {fallback || <DefaultLoading />}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SKELETON
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Skeleton - Placeholder loading component
 */
export function Skeleton({
  className = "",
  width = "w-full",
  height = "h-4",
  variant = "rectangular",
  lines = 1,
  animated = true,
}: SkeletonProps) {
  if (variant === "text") {
    return (
      <div className={cn("animate-pulse rounded-[var(--radius-md)]", className)}>
        <div className={cn("h-4 bg-[var(--bg-70)] rounded-[var(--radius-md)]", width, height)} />
      </div>
    )
  }

  if (variant === "circular") {
    return (
      <div
        className={cn(
          "animate-pulse rounded-[var(--radius-full)] bg-[var(--bg-70)]",
          width,
          height,
          className
        )}
      />
    )
  }

  return (
    <div className={cn("space-y-[var(--spacing-sm)]", className)}>
      {Array.from({ length: lines }, (_, index) => `skeleton-line-${index}`).map((key, idx) => (
        <div
          key={key}
          className={cn(
            "animate-pulse rounded-[var(--radius-md)] bg-[var(--bg-70)]",
            height,
            idx === lines - 1 ? width : "w-full",
            idx === 0 && animated ? "animate-shimmer" : ""
          )}
          style={
            // @design-exception DYNAMIC_VALUE: Shimmer gradient background with oklch color space requires inline style for browser-specific rendering
            idx === 0 && animated
              ? {
                  backgroundImage:
                    "linear-gradient(90deg, transparent, oklch(from var(--fg) l c h / 0.4), transparent)",
                }
              : undefined
          }
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PROGRESSIVE IMAGE
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * ProgressiveImage - Image loading with blur-up placeholder
 */
export function ProgressiveImage({
  src,
  alt,
  className = "",
  placeholder = "/placeholder-restaurant.jpg",
  onLoad,
  onError,
}: ProgressiveImageProps) {
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">("loading")
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = useCallback(() => {
    setImageState("loaded")
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setImageState("error")
    onError?.()
  }, [onError])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={placeholder}
        alt=""
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-[var(--duration-slow)]",
          imageState === "loaded" ? "opacity-0" : "opacity-100",
          imageState === "error" ? "hidden" : ""
        )}
      />

      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-[var(--duration-slow)]",
            imageState === "loading" ? "opacity-0" : "opacity-100",
            imageState === "error" ? "hidden" : ""
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}

      {imageState === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-10)]">
          <ExclamationCircleIcon className="w-[var(--icon-size-lg)] h-[var(--icon-size-lg)] text-[var(--fg-30)]" />
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LAZY LOAD
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * LazyLoad - Lazy load components when they enter viewport
 */
export function LazyLoad({
  children,
  fallback,
  rootMargin = "50px",
  threshold = 0.1,
  className = "",
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { rootMargin, threshold }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [rootMargin, threshold])

  return (
    <div ref={elementRef} className={className}>
      {isVisible ? children : fallback || <DefaultLoading />}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   STAGGERED LOADING
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * StaggeredLoading - Bouncing dots animation with token-based timing
 */
export function StaggeredLoading({ count = 3, className = "" }: StaggeredLoadingProps) {
  return (
    <div className={cn("flex space-x-[var(--spacing-sm)]", className)}>
      {Array.from({ length: count }, (_, index) => `stagger-dot-${index}`).map((key, idx) => (
        <div
          key={key}
          className="w-[var(--icon-size-xs)] h-[var(--icon-size-xs)] bg-[var(--color-primary)] rounded-[var(--radius-full)] animate-bounce"
          style={{
            animationDelay: `calc(var(--stagger-delay) * ${idx})`,
            animationDuration: "var(--stagger-duration)",
          }}
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SMART LOADING
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * SmartLoading - Loading with error handling and retry
 */
export function SmartLoading({
  isLoading,
  onRetry,
  error,
  retryCount = 0,
  className = "",
}: SmartLoadingProps) {
  if (!isLoading) {
    return null
  }

  return (
    <div
      className={cn("flex flex-col items-center justify-center p-[var(--spacing-md)]", className)}
    >
      <div className="text-center">
        {error ? (
          <div className="mb-[var(--spacing-md)]">
            <ExclamationCircleIcon className="w-[var(--icon-size-lg)] h-[var(--icon-size-lg)] text-[var(--color-error)] mx-auto mb-[var(--spacing-sm)]" />
            <p className="text-[var(--color-error)] mb-[var(--spacing-sm)]">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-[var(--spacing-md)] py-[var(--spacing-sm)] bg-[var(--color-primary)] text-[var(--color-white)] rounded-[var(--radius-lg)] hover:bg-[var(--color-primary)]/90 transition-colors flex items-center gap-[var(--spacing-sm)]"
              >
                <ArrowPathIcon className="w-[var(--icon-size-sm)] h-[var(--icon-size-sm)]" />
                Retry {retryCount > 0 && `(${retryCount})`}
              </button>
            )}
          </div>
        ) : (
          <div className="mb-[var(--spacing-md)]">
            <Spinner className="w-[var(--icon-size-lg)] h-[var(--icon-size-lg)] text-[var(--color-primary)] mx-auto" />
          </div>
        )}

        <p className="text-[var(--fg-70)] text-sm">
          {error ? "Loading failed. Please try again." : "Please wait..."}
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LOADING SPINNER
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * LoadingSpinner - CSS-based spinner with token-based sizing
 */
export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-[var(--icon-size-sm)] h-[var(--icon-size-sm)] border-[var(--border-width-thin)]",
    md: "w-[var(--icon-size-md)] h-[var(--icon-size-md)] border-[var(--border-width-thin)]",
    lg: "w-[var(--icon-size-lg)] h-[var(--icon-size-lg)] border-[calc(var(--border-width-thin)*var(--spinner-border-thick))]",
  }

  return (
    <div className={cn("inline-block", className)}>
      <Spinner className={cn("text-[var(--color-primary)]", sizeClasses[size])} />
    </div>
  )
}

/**
 * Spinner - Internal CSS spinner component
 */
function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-full)] border-[var(--fg-20)] border-t-[var(--color-primary)] animate-spin",
        className
      )}
    />
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SKELETON CARD
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * SkeletonCard - Card placeholder skeleton
 */
export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--color-white)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-[var(--spacing-md)] animate-pulse",
        className
      )}
    >
      <div className="space-y-[var(--spacing-md)]">
        <div className="h-6 bg-[var(--bg-70)] rounded-[var(--radius-md)] w-3/4" />
        <div className="h-4 bg-[var(--bg-70)] rounded-[var(--radius-md)] w-1/2 ml-4" />
        <div className="space-y-[var(--spacing-sm)]">
          <div className="h-3 bg-[var(--bg-70)] rounded-[var(--radius-md)] w-full" />
          <div className="h-3 bg-[var(--bg-70)] rounded-[var(--radius-md)] w-5/6" />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SKELETON LIST
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * SkeletonList - List item skeleton with avatars
 */
export function SkeletonList({ lines = 3, className = "" }: SkeletonListProps) {
  return (
    <div className={cn("space-y-[var(--spacing-md)]", className)}>
      {Array.from({ length: lines }, (_, index) => `skeleton-list-${index}`).map((key) => (
        <div key={key} className="flex items-center space-x-[var(--spacing-md)]">
          <div
            style={{ width: "var(--skeleton-avatar-size)", height: "var(--skeleton-avatar-size)" }}
            className="bg-[var(--bg-70)] rounded-[var(--radius-full)]"
          />
          <div className="flex-1 space-y-[var(--spacing-sm)]">
            <div className="h-4 bg-[var(--bg-70)] rounded-[var(--radius-md)] w-3/4" />
            <div className="h-4 bg-[var(--bg-70)] rounded-[var(--radius-md)] w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DEFAULT LOADING
   ═══════════════════════════════════════════════════════════════════════════════ */

function DefaultLoading() {
  return (
    <div className="flex items-center justify-center p-[var(--spacing-md)]">
      <div className="flex space-x-[var(--spacing-sm)]">
        <Spinner className="w-[var(--icon-size-md)] h-[var(--icon-size-md)] text-[var(--color-primary)]" />
        <span className="text-[var(--color-primary)] font-medium">Loading...</span>
      </div>
    </div>
  )
}
