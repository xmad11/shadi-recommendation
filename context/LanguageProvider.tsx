/* ═══════════════════════════════════════════════════════════════════════════════
   LANGUAGE PROVIDER - Client-side language state management
   ═══════════════════════════════════════════════════════════════════════════════ */

"use client"

import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, type ReactNode } from "react"
import {
  DEFAULT_LANGUAGE,
  getLanguageButtonLabel,
  getToggleLanguage,
  type Language,
} from "@/lib/language.types"

interface LanguageContextValue {
  language: Language
  buttonLabel: string
  toggleLanguage: () => Promise<void>
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
  initialLanguage: Language
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(initialLanguage)
  const languageRef = useRef(language)

  // Keep ref in sync with state
  useEffect(() => {
    languageRef.current = language
  }, [language])

  const toggleLanguage = useCallback(async () => {
    const currentLanguage = languageRef.current
    const nextLanguage = getToggleLanguage(currentLanguage)

    try {
      const response = await fetch("/api/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentLanguage }),
      })

      if (response.ok) {
        const { language: newLang } = await response.json()
        setLanguage(newLang)
        // Update HTML lang attribute without reload
        document.documentElement.lang = newLang
      }
    } catch (error) {
      console.error("Failed to toggle language:", error)
    }
  }, []) // No dependencies - uses ref instead

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      buttonLabel: getLanguageButtonLabel(language),
      toggleLanguage,
    }),
    [language, toggleLanguage]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    return {
      language: DEFAULT_LANGUAGE,
      buttonLabel: getLanguageButtonLabel(DEFAULT_LANGUAGE),
      toggleLanguage: async () => {},
    }
  }
  return context
}
