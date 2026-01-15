"use client"

import { NavigationProvider } from "@/components/navigation/NavigationProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>
}
