/* ═══════════════════════════════════════════════════════════════════════════════
   LANGUAGE ACTIONS - Server actions for language management
   ═══════════════════════════════════════════════════════════════════════════════ */

"use server"

import { setLanguage } from "@/lib/language.server"
import { getToggleLanguage, type Language } from "@/lib/language.types"

export async function setLanguageAction(currentLang: Language): Promise<{ language: Language }> {
  const newLang = getToggleLanguage(currentLang)
  await setLanguage(newLang)
  return { language: newLang }
}
