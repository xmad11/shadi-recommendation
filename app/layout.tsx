import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { Providers } from "@/components/layout/Providers"
import { AppHeader } from "@/components/layout/Header"
import { getLanguage } from "@/lib/language.server"
import { getLanguageDirection } from "@/lib/language.types"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shadi Recommendations",
  description: "Restaurant recommendations in UAE",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const language = await getLanguage()
  const direction = getLanguageDirection(language)

  return (
    <html lang={language} dir={direction} suppressHydrationWarning>
      <body className={inter.className}>
        <Providers initialLanguage={language}>
          <AppHeader />
          <main className="min-h-[var(--layout-min-height)] pt-[var(--header-total-height)]">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
