/* ═══════════════════════════════════════════════════════════════════════════════
   PAGE CONTAINER - Layout primitive for page content
   Responsibility: Horizontal padding + max width (nothing else)
   ═══════════════════════════════════════════════════════════════════════════════ */

import { memo } from "react"
import type { ReactNode } from "react"

export interface PageContainerProps {
  children: ReactNode
  className?: string
}

/**
 * PageContainer - Centralized layout primitive
 * - Handles horizontal padding
 * - Handles max width
 * - No other layout decisions
 *
 * Used by: Hero, Sections, Grids
 * Pages should NOT manage padding/max-width directly
 */
export const PageContainer = memo(function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <div
      className={`
        mx-auto w-full max-w-[var(--page-max-width)]
        px-[var(--page-padding-x)]
        ${className}
      `}
    >
      {children}
    </div>
  )
})
