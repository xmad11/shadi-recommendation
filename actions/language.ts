/* ═══════════════════════════════════════════════════════════════════════════════
   LANGUAGE ACTIONS - Server actions for language management
   ═══════════════════════════════════════════════════════════════════════════════ */

"use server"

import { setLanguage, getToggleLanguage, type Language } from "@/lib/language.server"

export async function setLanguageAction(currentLang: Language): Promise<{ language: Language }> {
  const newLang = getToggleLanguage(currentLang)
  await setLanguage(newLang)
  return { language: newLang }
}
