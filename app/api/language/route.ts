/* ═══════════════════════════════════════════════════════════════════════════════
   LANGUAGE API ROUTE - Handle language toggle requests
   ═══════════════════════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server"
import { setLanguage } from "@/lib/language.server"
import { getToggleLanguage, type Language } from "@/lib/language.types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentLanguage } = body as { currentLanguage: Language }

    if (currentLanguage !== "ar" && currentLanguage !== "en") {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 })
    }

    const newLanguage = getToggleLanguage(currentLanguage)
    await setLanguage(newLanguage)

    return NextResponse.json({ language: newLanguage })
  } catch (error) {
    console.error("Language toggle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
