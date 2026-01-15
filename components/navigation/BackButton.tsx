/* ═══════════════════════════════════════════════════════════════════════════════
   BACK BUTTON - Single source of truth for back navigation
   Uses router.back() ONLY
   NO window.location.href
   NO inline SVGs
   ═══════════════════════════════════════════════════════════════════════════════ */

"use client"

import { ChevronLeft } from "@/components/icons"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { type ButtonHTMLAttributes, forwardRef } from "react"

export const BackButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const router = useRouter()

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => router.back()}
        className={cn(
          "p-[var(--spacing-xs)]",
          "rounded-full",
          "bg-[var(--bg)]",
          "shadow-lg",
          "border border-[var(--fg-10)]",
          // Phase 3 Fix: Force text color for visibility
          "text-gray-900",
          "hover:text-gray-700",
          "hover:bg-[var(--fg-5)]",
          "transition-all",
          className
        )}
        aria-label="Go back"
        {...props}
      >
        <ChevronLeft className="w-[var(--icon-size-md)] h-[var(--icon-size-md)]" />
      </button>
    )
  }
)

BackButton.displayName = "BackButton"
