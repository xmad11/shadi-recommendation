/* ═══════════════════════════════════════════════════════════════════════════════
   SUPABASE AUTH - Server actions for authentication
   ═══════════════════════════════════════════════════════════════════════════════ */

"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "./server"

export interface AuthResult {
  success: boolean
  error?: string
  message?: string
  code?: string // Error code for programmatic handling
}

export interface User {
  id: string
  email: string
  user_metadata?: Record<string, unknown>
}

/**
 * Normalize Supabase errors to user-friendly messages
 */
function normalizeAuthError(error: {
  message?: string
  name?: string
  status?: number
}): AuthResult {
  const errorMessage = error.message?.toLowerCase() || ""
  const errorName = error.name?.toLowerCase() || ""

  // Network errors
  if (
    errorName.includes("network") ||
    errorMessage.includes("network") ||
    errorMessage.includes("fetch")
  ) {
    return {
      success: false,
      error: "Network error. Please check your connection and try again.",
      code: "NETWORK_ERROR",
    }
  }

  // Timeout errors
  if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
    return {
      success: false,
      error: "Request timed out. Please try again.",
      code: "TIMEOUT_ERROR",
    }
  }

  // Invalid credentials
  if (errorMessage.includes("invalid") && errorMessage.includes("credentials")) {
    return {
      success: false,
      error: "Invalid email or password.",
      code: "INVALID_CREDENTIALS",
    }
  }

  // User not found
  if (errorMessage.includes("user not found")) {
    return {
      success: false,
      error: "No account found with this email.",
      code: "USER_NOT_FOUND",
    }
  }

  // Email already exists
  if (errorMessage.includes("already") && errorMessage.includes("registered")) {
    return {
      success: false,
      error: "An account with this email already exists.",
      code: "EMAIL_ALREADY_EXISTS",
    }
  }

  // Weak password
  if (
    errorMessage.includes("password") &&
    (errorMessage.includes("weak") || errorMessage.includes("length"))
  ) {
    return {
      success: false,
      error: "Password is too weak. Please use a stronger password.",
      code: "WEAK_PASSWORD",
    }
  }

  // Server errors (5xx)
  if (error.status && error.status >= 500) {
    return {
      success: false,
      error: "Server error. Please try again later.",
      code: "SERVER_ERROR",
    }
  }

  // Rate limiting
  if (errorMessage.includes("too many") || errorMessage.includes("rate limit")) {
    return {
      success: false,
      error: "Too many attempts. Please wait a moment and try again.",
      code: "RATE_LIMITED",
    }
  }

  // Generic error fallback
  return {
    success: false,
    error: error.message || "An unexpected error occurred. Please try again.",
    code: "UNKNOWN_ERROR",
  }
}

/**
 * Sign up a new user with email and password
 * Compatible with React 19's useActionState
 */
export async function signUp(_state: AuthResult | null, formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string | undefined

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    }
  }

  if (password.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters",
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || "",
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return normalizeAuthError(error)
  }

  // Check if email confirmation is required
  if (data.user && !data.session) {
    return {
      success: true,
      message: "Please check your email to confirm your account",
    }
  }

  return {
    success: true,
    message: "Account created successfully",
  }
}

/**
 * Sign in with email and password
 * Compatible with React 19's useActionState
 */
export async function signIn(_state: AuthResult | null, formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return normalizeAuthError(error)
  }

  revalidatePath("/", "layout")
  return {
    success: true,
    message: "Signed in successfully",
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  revalidatePath("/", "layout")
  return {
    success: true,
    message: "Signed out successfully",
  }
}

/**
 * Get the current user
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email || "",
    user_metadata: user.user_metadata,
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    redirect("/login?error=oauth_error")
  }

  if (data.url) {
    redirect(data.url)
  }
}

/**
 * Handle OAuth callback
 */
export async function handleOAuthCallback(): Promise<void> {
  const _supabase = await createClient()

  // The callback is handled by Supabase automatically
  // This function can be used for additional processing if needed
  redirect("/dashboard")
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const email = formData.get("email") as string

  if (!email) {
    return {
      success: false,
      error: "Email is required",
    }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
    message: "Please check your email for password reset instructions",
  }
}

/**
 * Update user password
 */
export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!password || !confirmPassword) {
    return {
      success: false,
      error: "Password and confirmation are required",
    }
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: "Passwords do not match",
    }
  }

  if (password.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters",
    }
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
    message: "Password updated successfully",
  }
}
