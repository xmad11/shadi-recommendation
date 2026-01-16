"use client"

import { NavigationProvider } from "@/components/navigation/NavigationProvider"
import { LanguageProvider } from "@/context/LanguageProvider"
import type { Language } from "@/lib/language.types"

interface ProvidersProps {
  children: React.ReactNode
  initialLanguage: Language
}

export function Providers({ children, initialLanguage }: ProvidersProps) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <NavigationProvider>{children}</NavigationProvider>
    </LanguageProvider>
  )
}
