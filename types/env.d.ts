/* ═══════════════════════════════════════════════════════════════════════════════
   ENVIRONMENT VARIABLE TYPES - Next.js public runtime config
   ═══════════════════════════════════════════════════════════════════════════════ */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Next.js public environment variables
      readonly NEXT_PUBLIC_SITE_URL?: string
      readonly NEXT_PUBLIC_APP_URL?: string
      readonly NEXT_PUBLIC_APP_NAME?: string

      // Supabase environment variables (for future use)
      readonly NEXT_PUBLIC_SUPABASE_URL?: string
      readonly NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string
      readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
      readonly SUPABASE_SERVICE_ROLE_KEY?: string

      // Node environment
      readonly NODE_ENV: "development" | "production" | "test"
    }
  }
}

export {}
