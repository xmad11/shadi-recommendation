/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ZERO TRUST SECURITY UTILITIES
 *
 * Provides utilities for implementing zero-trust security model.
 * Every request must be verified, regardless of source.
 *
 * Principles:
 * 1. Never trust, always verify
 * 2. Assume breach
 * 3. Verify explicitly
 * 4. Use least privilege access
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cache } from "react"
import { auditLog } from "./audit"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VerifiedUser {
    id: string
    email: string
    role: "user" | "admin" | "moderator"
    permissions: string[]
    sessionValid: boolean
    lastVerified: Date
}

export interface AccessCheck {
    allowed: boolean
    reason?: string
    user?: VerifiedUser
}

// ─── Permission Definitions ──────────────────────────────────────────────────

export const PERMISSIONS = {
    // User permissions
    PROFILE_READ: "profile:read",
    PROFILE_UPDATE: "profile:update",
    REVIEWS_CREATE: "reviews:create",
    REVIEWS_UPDATE_OWN: "reviews:update:own",
    REVIEWS_DELETE_OWN: "reviews:delete:own",

    // Moderator permissions
    REVIEWS_UPDATE_ANY: "reviews:update:any",
    REVIEWS_DELETE_ANY: "reviews:delete:any",
    USERS_VIEW: "users:view",

    // Admin permissions
    USERS_MANAGE: "users:manage",
    ROLES_MANAGE: "roles:manage",
    SETTINGS_MANAGE: "settings:manage",
    AUDIT_VIEW: "audit:view",
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// ─── Role-Permission Mapping ─────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
    user: [
        PERMISSIONS.PROFILE_READ,
        PERMISSIONS.PROFILE_UPDATE,
        PERMISSIONS.REVIEWS_CREATE,
        PERMISSIONS.REVIEWS_UPDATE_OWN,
        PERMISSIONS.REVIEWS_DELETE_OWN,
    ],
    moderator: [
        PERMISSIONS.PROFILE_READ,
        PERMISSIONS.PROFILE_UPDATE,
        PERMISSIONS.REVIEWS_CREATE,
        PERMISSIONS.REVIEWS_UPDATE_OWN,
        PERMISSIONS.REVIEWS_DELETE_OWN,
        PERMISSIONS.REVIEWS_UPDATE_ANY,
        PERMISSIONS.REVIEWS_DELETE_ANY,
        PERMISSIONS.USERS_VIEW,
    ],
    admin: Object.values(PERMISSIONS),
}

// ─── Verification Functions ──────────────────────────────────────────────────

/**
 * Verify and get current user (cached per request)
 * This is the core zero-trust verification function
 */
export const verifySession = cache(async (): Promise<VerifiedUser | null> => {
    const supabase = await createClient()

    // Step 1: Verify the JWT token is valid
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return null
    }

    // Step 2: Check if session is still valid
    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
        return null
    }

    // Step 3: Verify session hasn't expired
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
    if (expiresAt < Date.now()) {
        await supabase.auth.signOut()
        return null
    }

    // Step 4: Fetch current role from database (not from JWT)
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    const role = (profile?.role as "user" | "admin" | "moderator") ?? "user"
    const permissions = ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.user

    return {
        id: user.id,
        email: user.email ?? "",
        role,
        permissions,
        sessionValid: true,
        lastVerified: new Date(),
    }
})

/**
 * Check if user has specific permission
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
    const user = await verifySession()
    if (!user) return false
    return user.permissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(permissions: Permission[]): Promise<boolean> {
    const user = await verifySession()
    if (!user) return false
    return permissions.some((p) => user.permissions.includes(p))
}

/**
 * Check if user has all specified permissions
 */
export async function hasAllPermissions(permissions: Permission[]): Promise<boolean> {
    const user = await verifySession()
    if (!user) return false
    return permissions.every((p) => user.permissions.includes(p))
}

// ─── Access Control Functions ────────────────────────────────────────────────

/**
 * Require authentication - redirect if not authenticated
 * Use in Server Components and Route Handlers
 */
export async function requireAuth(redirectTo = "/login"): Promise<VerifiedUser> {
    const user = await verifySession()

    if (!user) {
        await auditLog.securityEvent("security_unauthorized", {
            reason: "No valid session",
            redirect: redirectTo,
        })
        redirect(redirectTo)
    }

    return user
}

/**
 * Require specific permission - redirect if not authorized
 */
export async function requirePermission(
    permission: Permission,
    redirectTo = "/unauthorized"
): Promise<VerifiedUser> {
    const user = await requireAuth(redirectTo)

    if (!user.permissions.includes(permission)) {
        await auditLog.securityEvent(
            "security_unauthorized",
            {
                reason: "Insufficient permissions",
                required: permission,
                userRole: user.role,
            },
            user.id
        )
        redirect(redirectTo)
    }

    return user
}

/**
 * Check access without redirecting
 */
export async function checkAccess(permission?: Permission): Promise<AccessCheck> {
    const user = await verifySession()

    if (!user) {
        return { allowed: false, reason: "Not authenticated" }
    }

    if (permission && !user.permissions.includes(permission)) {
        return { allowed: false, reason: "Insufficient permissions", user }
    }

    return { allowed: true, user }
}

// ─── Resource-level Access Control ──────────────────────────────────────────

/**
 * Check if user can access a specific resource
 */
export async function canAccessResource(
    resourceType: string,
    resourceId: string,
    action: "read" | "update" | "delete"
): Promise<AccessCheck> {
    const user = await verifySession()

    if (!user) {
        return { allowed: false, reason: "Not authenticated" }
    }

    // Admins can access everything
    if (user.role === "admin") {
        return { allowed: true, user }
    }

    const supabase = await createClient()

    // Check resource ownership
    const { data: resource } = await supabase
        .from(resourceType)
        .select("user_id")
        .eq("id", resourceId)
        .single()

    if (!resource) {
        return { allowed: false, reason: "Resource not found", user }
    }

    const isOwner = resource.user_id === user.id

    // Check action-specific permissions
    switch (action) {
        case "read":
            // Most resources are readable by authenticated users
            return { allowed: true, user }

        case "update":
            if (isOwner) return { allowed: true, user }
            if (user.role === "moderator") return { allowed: true, user }
            return { allowed: false, reason: "Not resource owner", user }

        case "delete":
            if (isOwner) return { allowed: true, user }
            if (user.role === "moderator") return { allowed: true, user }
            return { allowed: false, reason: "Not resource owner", user }

        default:
            return { allowed: false, reason: "Unknown action", user }
    }
}

// ─── Suspicious Activity Detection ───────────────────────────────────────────

interface ActivityContext {
    userId: string
    action: string
    ipAddress?: string
    timestamp: Date
}

const recentActivity = new Map<string, ActivityContext[]>()

/**
 * Track user activity for anomaly detection
 */
export async function trackActivity(context: ActivityContext): Promise<void> {
    const key = context.userId
    const activities = recentActivity.get(key) ?? []

    // Keep only last 100 activities per user
    if (activities.length >= 100) {
        activities.shift()
    }

    activities.push(context)
    recentActivity.set(key, activities)

    // Check for suspicious patterns
    await detectAnomalies(context.userId, activities)
}

/**
 * Detect suspicious activity patterns
 */
async function detectAnomalies(userId: string, activities: ActivityContext[]): Promise<void> {
    const last5Minutes = activities.filter(
        (a) => Date.now() - a.timestamp.getTime() < 5 * 60 * 1000
    )

    // Check for rapid requests (potential automated attack)
    if (last5Minutes.length > 50) {
        await auditLog.securityEvent(
            "security_suspicious",
            {
                reason: "Rapid request rate",
                requestCount: last5Minutes.length,
                timeWindow: "5 minutes",
            },
            userId
        )
    }

    // Check for multiple failed attempts
    const failedAttempts = last5Minutes.filter((a) => a.action.includes("failed"))
    if (failedAttempts.length > 5) {
        await auditLog.securityEvent(
            "security_suspicious",
            {
                reason: "Multiple failed attempts",
                failedCount: failedAttempts.length,
                timeWindow: "5 minutes",
            },
            userId
        )
    }
}
