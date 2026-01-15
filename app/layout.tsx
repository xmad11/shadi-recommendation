import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { Providers } from "@/components/layout/Providers"
import { AppHeader } from "@/components/layout/Header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shadi Recommendations",
  description: "Restaurant recommendations in UAE",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AppHeader />
          <main className="min-h-[var(--layout-min-height)] pt-[var(--header-total-height)]">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
