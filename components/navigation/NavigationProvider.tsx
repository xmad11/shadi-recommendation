/* ═══════════════════════════════════════════════════════════════════════════════
   NAVIGATION PROVIDER - UI-only navigation state
   Manages panel state (menu/theme) for Header/SideMenu/ThemeModal
   ═══════════════════════════════════════════════════════════════════════════════ */

"use client"

import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react"

export type ActivePanel = "none" | "menu" | "theme"

interface NavigationContextType {
  activePanel: ActivePanel
  setActivePanel: (panel: ActivePanel) => void
  openMenu: () => void
  openTheme: () => void
  closeAll: () => void
  showBackButton: boolean
  showBackButtonInHeader: () => void
  hideBackButton: () => void
}

const NavigationContext = createContext<NavigationContextType | null>(null)

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider")
  }
  return context
}

interface NavigationProviderProps {
  children: ReactNode
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>("none")
  const [showBackButton, setShowBackButton] = useState(false)

  const openMenu = useCallback(() => setActivePanel("menu"), [])
  const openTheme = useCallback(() => setActivePanel("theme"), [])
  const closeAll = useCallback(() => setActivePanel("none"), [])
  const showBackButtonInHeader = useCallback(() => setShowBackButton(true), [])
  const hideBackButton = useCallback(() => setShowBackButton(false), [])

  // Memoize context value to prevent infinite re-renders
  const contextValue = useMemo(
    () => ({
      activePanel,
      setActivePanel,
      openMenu,
      openTheme,
      closeAll,
      showBackButton,
      showBackButtonInHeader,
      hideBackButton,
    }),
    [activePanel, showBackButton]
  )

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  )
}
