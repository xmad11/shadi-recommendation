/* ═══════════════════════════════════════════════════════════════════════════════
   BASE CARD - Single source of truth for ALL cards
   2 variants: detailed, list
   ═══════════════════════════════════════════════════════════════════════════════ */

import { memo, useMemo } from "react"

export type CardVariant = "detailed" | "list"
export type CardType = "restaurant" | "blog"

export interface BaseCardProps {
  variant: CardVariant
  type: CardType
  children: React.ReactNode
  className?: string
  href?: string
  onClick?: () => void
}

/**
 * BaseCard - The ONLY card wrapper allowed
 *
 * VARIANTS:
 * - detailed: h-auto (primary listing, grid view)
 * - list: h-[var(--card-height-list)] (horizontal, image left content right)
 */
export const BaseCard = memo(function BaseCard({
  variant,
  type,
  children,
  className = "",
  href,
  onClick,
}: BaseCardProps) {
  // Fixed heights
  const heightClasses: Record<CardVariant, string> = {
    detailed: "h-auto",
    list: "h-[var(--card-height-list)]",
  }

  // Type-specific accent colors
  const accentColor =
    type === "restaurant" ? "var(--card-accent-restaurant)" : "var(--card-accent-blog)"

  // Interactive element
  const Wrapper = href ? "a" : onClick ? "button" : "div"
  const wrapperProps = useMemo<Record<string, unknown>>(() => {
    if (href) return { href, className: "block min-w-0" }
    if (onClick) return { type: "button" as const, onClick, className: "w-full text-left" }
    return { className: "min-w-0" }
  }, [href, onClick])

  return (
    <Wrapper
      className={`
        relative rounded-[var(--radius-xl)]
        bg-[var(--card-bg)]
        shadow-[var(--shadow-sm)]
        transition hover:shadow-[var(--shadow-md)]
        ${heightClasses[variant]}
        ${className}
      `}
      style={
        {
          "--card-accent": accentColor,
        } as React.CSSProperties
      }
      {...wrapperProps}
    >
      {children}
    </Wrapper>
  )
})
