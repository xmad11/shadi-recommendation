/* ═══════════════════════════════════════════════════════════════════════════════
   USE BREAKPOINT HOOK - Track viewport breakpoint

   Uses CSS breakpoint tokens:
   - Mobile: < 768px (--breakpoint-md)
   - Tablet: 768px - 1023px (--breakpoint-md to --breakpoint-lg)
   - Desktop: ≥ 1024px (--breakpoint-lg)
   ═══════════════════════════════════════════════════════════════════════════════ */

import type { Breakpoint } from "@/types/breakpoint"
import { useEffect, useState } from "react"

export type { Breakpoint }

/**
 * Get the current breakpoint based on window width
 * Matches CSS breakpoint tokens: --breakpoint-md: 768px, --breakpoint-lg: 1024px
 */
export function getBreakpoint(): Breakpoint {
  if (typeof window === "undefined") return "mobile"
  if (window.innerWidth >= 1024) return "desktop"
  if (window.innerWidth >= 768) return "tablet"
  return "mobile"
}

/**
 * Hook to track viewport breakpoint changes
 * Updates on window resize
 *
 * Returns null until after hydration to prevent SSR mismatch
 */
export function useBreakpoint(): Breakpoint | null {
  const [breakpoint, setBreakpoint] = useState<Breakpoint | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setBreakpoint(getBreakpoint())

    const handleResize = () => {
      setBreakpoint(getBreakpoint())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Return null during SSR to prevent hydration mismatch
  if (!isMounted) return null
  return breakpoint
}
