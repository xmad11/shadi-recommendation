/* ═══════════════════════════════════════════════════════════════════════════════
   APP HEADER - Simple header with logo, menu button, and language toggle
   ═══════════════════════════════════════════════════════════════════════════════ */

"use client"

import { Bars3BottomRightIcon } from "@/components/icons"
import { BackButton } from "@/components/navigation/BackButton"
import { useNavigation } from "@/components/navigation/NavigationProvider"
import { useLanguage } from "@/context/LanguageProvider"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import SideMenu from "./SideMenu"

/* ─────────────────────────────────────────────────────────────────────────
   Component constants
   ───────────────────────────────────────────────────────────────────────── */
const SCROLL_HIDE_THRESHOLD = 50
const SCROLL_GLASS_THRESHOLD = 20

function AppHeaderComponent() {
  const { activePanel, openMenu, closeAll, showBackButton } = useNavigation()
  const { buttonLabel, toggleLanguage } = useLanguage()
  const [visible, setVisible] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  /* ─────────────────────────────────────────────────────────────────────────
     Scroll handler with requestAnimationFrame throttling
     ───────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const updateScrollState = () => {
      const currentScrollY = window.scrollY
      setVisible(currentScrollY < lastScrollY.current || currentScrollY < SCROLL_HIDE_THRESHOLD)
      setIsScrolled(currentScrollY > SCROLL_GLASS_THRESHOLD)
      lastScrollY.current = currentScrollY
      ticking.current = false
    }

    const handleScroll = () => {
      if (!ticking.current) {
        ticking.current = true
        requestAnimationFrame(updateScrollState)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  /* ─────────────────────────────────────────────────────────────────────────
     Panel handlers
     ───────────────────────────────────────────────────────────────────────── */
  const handleMenuClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (activePanel === "menu") {
        closeAll()
      } else {
        openMenu()
      }
    },
    [activePanel, closeAll, openMenu]
  )

  const handleHeaderClick = useCallback(() => {
    if (activePanel !== "none") {
      closeAll()
    }
  }, [activePanel, closeAll])

  /* ─────────────────────────────────────────────────────────────────────────
     Pre-compute class names
     ───────────────────────────────────────────────────────────────────────── */
  const headerClasses = useMemo(() => {
    const visibilityClasses = visible
      ? "translate-y-0 opacity-[var(--opacity-full)]"
      : "-translate-y-[calc(var(--header-height)*2)] opacity-[var(--opacity-faint)] pointer-events-none"

    const scrolledClasses = isScrolled
      ? "glass-header rounded-[var(--radius-3xl)] shadow-[var(--shadow-xl)] py-[var(--header-padding-y)] px-[var(--header-padding-x-scrolled)]"
      : "bg-transparent py-[var(--header-padding-y)] px-[var(--header-padding-x-normal)]"

    return `fixed top-[var(--header-offset-top)] left-1/2 -translate-x-1/2 z-[var(--z-header)] w-[var(--header-width)] transition-all duration-700 var(--ease-out-quart) ${visibilityClasses} ${scrolledClasses}`
  }, [visible, isScrolled])

  const logoClasses = useMemo(() => {
    return "h-[var(--header-logo-size)] w-auto relative transition-transform duration-500 group-hover:scale-110"
  }, [])

  const showHeaderClick = activePanel !== "none"

  return (
    <>
      <nav
        onClick={showHeaderClick ? handleHeaderClick : undefined}
        className={headerClasses}
        aria-label="Navigation"
      >
        <div className="flex justify-between items-center">
          {/* Left side - Back button + Branding */}
          <div className="flex items-center gap-[var(--spacing-md)]">
            {showBackButton && <BackButton className="flex-shrink-0" />}
            <a href="/" className="flex items-center gap-[var(--header-logo-gap)] group">
              <img src="/LOGO/logo.svg" alt="Shadi" className={logoClasses} />
              <span className="font-black text-[var(--font-size-xl)] tracking-tighter uppercase hidden sm:block self-center">
                Shadi<span className="text-primary italic">.</span>
              </span>
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-[var(--header-actions-gap)]">
            {/* Language Toggle Button */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-lg bg-[var(--fg-10)] text-[var(--fg)] font-medium hover:bg-[var(--fg-20)] transition-colors touch-target"
              aria-label="Toggle language"
            >
              {buttonLabel}
            </button>

            <button
              type="button"
              onClick={handleMenuClick}
              className="transition-all active:scale-95 group relative p-[var(--spacing-sm)] touch-target"
              aria-label="Open menu"
            >
              <Bars3BottomRightIcon className="h-[var(--icon-size-lg)] w-[var(--icon-size-lg)] text-[var(--fg)] stroke-[2px]" />
            </button>
          </div>
        </div>
      </nav>

      {/* Side Menu Panel */}
      {activePanel === "menu" && <SideMenu isOpen={true} onClose={closeAll} />}
    </>
  )
}

export const AppHeader = memo(AppHeaderComponent)
export default memo(AppHeaderComponent)
