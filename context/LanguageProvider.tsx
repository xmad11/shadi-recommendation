/* ═══════════════════════════════════════════════════════════════════════════════
   LANGUAGE PROVIDER - Client-side language state management
   ═══════════════════════════════════════════════════════════════════════════════ */

"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Language } from "@/lib/language"
import { DEFAULT_LANGUAGE, getLanguageButtonLabel, getToggleLanguage } from "@/lib/language"

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
  const [isPending, setIsPending] = useState(false)

  const toggleLanguage = useCallback(async () => {
    if (isPending) return

    setIsPending(true)
    try {
      const response = await fetch("/api/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentLanguage: language }),
      })

      if (response.ok) {
        const { language: newLang } = await response.json()
        setLanguage(newLang)
        // Reload to apply language changes to HTML
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to toggle language:", error)
    } finally {
      setIsPending(false)
    }
  }, [language, isPending])

  const value: LanguageContextValue = {
    language,
    buttonLabel: getLanguageButtonLabel(language),
    toggleLanguage,
  }

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
