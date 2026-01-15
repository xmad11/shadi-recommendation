/* ═══════════════════════════════════════════════════════════════════════════════
   SHARED THEME CONSTANTS - Used by Header and ThemeModal
   ═══════════════════════════════════════════════════════════════════════════════ */

import { MoonIcon, SunIcon } from "@/components/icons"
import { SunWarmIcon } from "@/components/icons/SunWarmIcon"
import type { ThemeMode } from "@/context/ThemeContext"

/**
 * Theme mode definitions with icons and labels
 * Used by both Header (theme indicator) and ThemeModal (theme selector)
 */
export const THEME_MODES: Array<{
  id: ThemeMode
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
}> = [
  { id: "light", icon: SunIcon, label: "Light", description: "Bright and clean" },
  { id: "warm", icon: SunWarmIcon, label: "Warm", description: "Cozy ambiance" },
  { id: "dark", icon: MoonIcon, label: "Dark", description: "Easy on eyes" },
] as const

/**
 * Simplified icon mapping for Header theme button
 */
export const THEME_ICONS: Record<ThemeMode, React.ComponentType<{ className?: string }>> = {
  light: SunIcon,
  warm: SunWarmIcon,
  dark: MoonIcon,
}
