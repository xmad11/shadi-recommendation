/* ═══════════════════════════════════════════════════════════════════════════════
   SHARED TYPES - Common interfaces used across components
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Props for panel-style components (SideMenu, ThemeModal)
 * These components slide in from the right and have click-outside-to-close
 */
export interface PanelProps {
  isOpen: boolean
  onClose: () => void
}
