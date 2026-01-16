import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { Providers } from "@/components/layout/Providers"
import { AppHeader } from "@/components/layout/Header"
import { getLanguage } from "@/lib/language.server"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shadi Recommendations",
  description: "Restaurant recommendations in UAE",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const language = await getLanguage()

  return (
    <html lang={language} dir="ltr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers initialLanguage={language}>
          <AppHeader />
          <main className="min-h-[var(--layout-min-height)] pt-[var(--header-total-height)] px-[var(--spacing-xs)] sm:px-[var(--page-padding-x)]">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
