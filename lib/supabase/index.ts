/* ═══════════════════════════════════════════════════════════════════════════════
   SUPABASE MODULE - Index file for Supabase exports
   ═══════════════════════════════════════════════════════════════════════════════ */

export { createClient as createServerClient } from "./server"
export { createClient as createBrowserClient } from "./client"
export type { AuthResult, User } from "./auth"
export {
  signUp,
  signIn,
  signOut,
  getUser,
  signInWithGoogle,
  handleOAuthCallback,
  requestPasswordReset,
  updatePassword,
} from "./auth"
