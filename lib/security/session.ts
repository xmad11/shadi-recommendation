/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECURE SESSION CONFIGURATION
 *
 * Cookie and session settings for maximum security.
 * These settings are applied when creating Supabase auth cookies.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { CookieOptions } from "@supabase/ssr"

/**
 * Secure cookie defaults for authentication
 * Apply these to all auth-related cookies
 */
export const SECURE_COOKIE_OPTIONS: CookieOptions = {
    // Prevent JavaScript access to cookies
    httpOnly: true,

    // Only send cookies over HTTPS in production
    secure: process.env.NODE_ENV === "production",

    // Prevent cross-site request forgery
    sameSite: "lax",

    // Cookie path
    path: "/",

    // Session timeout: 24 hours
    maxAge: 60 * 60 * 24, // 24 hours in seconds
}

/**
 * Stricter cookie options for sensitive operations
 * Use for password reset tokens, etc.
 */
export const STRICT_COOKIE_OPTIONS: CookieOptions = {
    ...SECURE_COOKIE_OPTIONS,
    sameSite: "strict",
    maxAge: 60 * 15, // 15 minutes for sensitive tokens
}

/**
 * Session configuration constants
 */
export const SESSION_CONFIG = {
    // Maximum session duration
    MAX_SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours in ms

    // Refresh token before expiry
    REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry

    // Inactivity timeout
    INACTIVITY_TIMEOUT: 60 * 60 * 1000, // 1 hour of inactivity

    // Maximum concurrent sessions per user
    MAX_CONCURRENT_SESSIONS: 5,
} as const

/**
 * Cookie names used by the application
 */
export const COOKIE_NAMES = {
    // Supabase auth cookies (managed by Supabase SSR)
    ACCESS_TOKEN: "sb-access-token",
    REFRESH_TOKEN: "sb-refresh-token",

    // Application-specific cookies
    THEME: "theme",
    LANGUAGE: "language",
    CONSENT: "cookie-consent",
} as const

/**
 * Check if a session is about to expire
 */
export function isSessionExpiringSoon(expiresAt: number): boolean {
    const now = Date.now()
    const expiresAtMs = expiresAt * 1000 // Convert to milliseconds
    return expiresAtMs - now < SESSION_CONFIG.REFRESH_THRESHOLD
}

/**
 * Get secure cookie options for the current environment
 */
export function getSecureCookieOptions(overrides?: Partial<CookieOptions>): CookieOptions {
    return {
        ...SECURE_COOKIE_OPTIONS,
        ...overrides,
    }
}
