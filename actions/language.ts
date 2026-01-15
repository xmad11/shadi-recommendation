/* ═══════════════════════════════════════════════════════════════════════════════
   LANGUAGE ACTIONS - Server actions for language management
   ═══════════════════════════════════════════════════════════════════════════════ */

"use server"

import { cookies } from "next/headers"
import type { Language } from "@/lib/language"
import { LANGUAGE_COOKIE, getToggleLanguage } from "@/lib/language"

export async function setLanguageAction(currentLang: Language): Promise<{ language: Language }> {
  const cookieStore = await cookies()
  const newLang = getToggleLanguage(currentLang)

  cookieStore.set(LANGUAGE_COOKIE, newLang, {
    httpOnly: false, // Allow JavaScript access
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  return { language: newLang }
}
