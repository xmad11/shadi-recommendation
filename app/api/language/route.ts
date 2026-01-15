/* ═══════════════════════════════════════════════════════════════════════════════
   LANGUAGE API ROUTE - Handle language toggle requests
   ═══════════════════════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import type { Language } from "@/lib/language"
import { LANGUAGE_COOKIE, getToggleLanguage } from "@/lib/language"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentLanguage } = body as { currentLanguage: Language }

    if (currentLanguage !== "ar" && currentLanguage !== "en") {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const newLanguage = getToggleLanguage(currentLanguage)

    cookieStore.set(LANGUAGE_COOKIE, newLanguage, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    return NextResponse.json({ language: newLanguage })
  } catch (error) {
    console.error("Language toggle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
