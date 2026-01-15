/* ═══════════════════════════════════════════════════════════════════════════════
   LANGUAGE UTILITIES - Cookie-based language management
   ═══════════════════════════════════════════════════════════════════════════════ */

import { cookies } from "next/headers"

export type Language = "ar" | "en"

export const LANGUAGE_COOKIE = "shadi_lang"

// Default language (Arabic as per requirements)
export const DEFAULT_LANGUAGE: Language = "ar"

export async function getLanguage(): Promise<Language> {
  const cookieStore = await cookies()
  const lang = cookieStore.get(LANGUAGE_COOKIE)?.value
  return (lang === "ar" || lang === "en") ? lang : DEFAULT_LANGUAGE
}

export function getLanguageDirection(lang: Language): "rtl" | "ltr" {
  return lang === "ar" ? "rtl" : "ltr"
}

export function getToggleLanguage(currentLang: Language): Language {
  return currentLang === "ar" ? "en" : "ar"
}

export function getLanguageButtonLabel(lang: Language): string {
  return lang === "ar" ? "E" : "ع"
}
