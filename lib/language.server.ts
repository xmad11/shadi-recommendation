import { cookies } from "next/headers"
import { DEFAULT_LANGUAGE, type Language } from "./language.types"

export const LANGUAGE_COOKIE = "shadi_lang"

export async function getLanguage(): Promise<Language> {
  const store = await cookies()
  const value = store.get(LANGUAGE_COOKIE)?.value
  return value === "ar" || value === "en" ? value : DEFAULT_LANGUAGE
}

export async function setLanguage(lang: Language) {
  const store = await cookies()
  store.set(LANGUAGE_COOKIE, lang, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
}
