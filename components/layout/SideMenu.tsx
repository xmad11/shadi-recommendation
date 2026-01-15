/* ═══════════════════════════════════════════════════════════════════════════════
   SIDE MENU COMPONENT - Simple navigation menu
   ═══════════════════════════════════════════════════════════════════════════════ */

"use client"

import type { PanelProps } from "@/components/types"
import { useCallback, useEffect } from "react"

const NAV_ITEMS = [
  { id: "home", label: "Discover", href: "/" },
  { id: "restaurants", label: "Restaurants", href: "/restaurants" },
  { id: "admin", label: "Admin", href: "/admin" },
] as const

export default function SideMenu({ isOpen, onClose }: PanelProps) {
  const handleBackdropKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"
    }

    return () => {
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[var(--z-side-menu-backdrop)] animate-in fade-in duration-[var(--duration-normal)] backdrop-blur-sm bg-[var(--bg)]/[var(--opacity-medium)]"
        onClick={onClose}
        onKeyDown={handleBackdropKeyDown}
        aria-hidden="true"
      />

      <div
        className="fixed top-[var(--header-offset-top)] right-0 w-[var(--side-menu-width)] h-[calc(100vh-var(--header-offset-top))] z-[var(--z-side-menu)] glass rounded-l-[var(--panel-radius)] shadow-[var(--shadow-2xl)] p-[var(--spacing-md)] animate-in slide-in-from-right duration-[var(--duration-slow)] var(--ease-out-quart)"
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 space-y-[var(--spacing-xs)]">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={onClose}
                className="group relative w-full flex items-center gap-[var(--spacing-xl)] px-[var(--spacing-sm)] py-[var(--spacing-sm)] rounded-[var(--radius-md)] text-[var(--font-size-sm)] transition-all duration-[var(--duration-fast)] hover:bg-[var(--fg-5)] touch-target"
              >
                <span className="text-[var(--fg)] group-hover:text-primary font-medium transition-colors duration-[var(--duration-fast)] leading-tight">
                  {item.label}
                </span>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-0 w-[var(--indicator-width)] rounded-l-full bg-[var(--fg)] opacity-[var(--opacity-hidden)] group-hover:opacity-[var(--opacity-full)] group-hover:h-[calc(100%-var(--spacing-sm)-var(--spacing-sm))] transition-all duration-[var(--duration-fast)]" />
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
