// lib/language.types.ts

export type Language = "ar" | "en"

export const DEFAULT_LANGUAGE: Language = "ar"

export function getToggleLanguage(lang: Language): Language {
  return lang === "ar" ? "en" : "ar"
}

export function getLanguageButtonLabel(lang: Language): string {
  return lang === "ar" ? "E" : "ع"
}
