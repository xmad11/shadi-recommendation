/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DATA ACCESS LAYER (DAL) - Centralized Secure Database Access
 *
 * This module provides a single, secure interface for all database operations.
 * All database queries MUST go through the DAL to ensure:
 * - Consistent authorization checks
 * - Input validation
 * - Audit logging
 * - Type safety
 *
 * NEVER call supabase.from() directly in components or pages!
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { validateInput, uuid, paginationSchema } from "@/lib/security"
import type { PaginationParams } from "@/lib/security"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DALResult<T> {
    data: T | null
    error: string | null
    count?: number
}

export interface Restaurant {
    id: string
    name: string
    description: string | null
    cuisine_type: string | null
    location: string | null
    rating: number | null
    price_range: number | null
    image_url: string | null
    created_at: string
    updated_at: string
}

export interface UserProfile {
    id: string
    email: string
    display_name: string | null
    avatar_url: string | null
    role: "user" | "admin" | "moderator"
    created_at: string
}

// ─── Authorization Helpers ───────────────────────────────────────────────────

/**
 * Get the current authenticated user (cached per request)
 * Uses React's cache() to dedupe across Server Components
 */
export const getCurrentUser = cache(async (): Promise<UserProfile | null> => {
    const supabase = await createClient()

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return null
    }

    // Fetch user profile with role
    const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, display_name, avatar_url, role, created_at")
        .eq("id", user.id)
        .single()

    if (!profile) {
        // Return basic user info if no profile exists
        return {
            id: user.id,
            email: user.email ?? "",
            display_name: null,
            avatar_url: null,
            role: "user",
            created_at: user.created_at,
        }
    }

    return profile as UserProfile
})

/**
 * Verify user has required role
 */
async function requireRole(
    allowedRoles: Array<"user" | "admin" | "moderator">
): Promise<UserProfile> {
    const user = await getCurrentUser()

    if (!user) {
        throw new Error("Authentication required")
    }

    if (!allowedRoles.includes(user.role)) {
        throw new Error("Insufficient permissions")
    }

    return user
}

/**
 * Verify user is authenticated
 */
async function requireAuth(): Promise<UserProfile> {
    return requireRole(["user", "admin", "moderator"])
}

/**
 * Verify user is admin
 */
async function requireAdmin(): Promise<UserProfile> {
    return requireRole(["admin"])
}

// ─── Restaurant Operations ───────────────────────────────────────────────────

/**
 * Get all restaurants with optional filtering
 */
export async function getRestaurants(
    params: PaginationParams & {
        cuisine?: string
        location?: string
        minRating?: number
    } = { page: 1, limit: 20 }
): Promise<DALResult<Restaurant[]>> {
    try {
        const { page, limit } = validateInput(paginationSchema, params)
        const offset = (page - 1) * limit

        const supabase = await createClient()

        let query = supabase
            .from("restaurants")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1)

        // Apply filters safely
        if (params.cuisine) {
            query = query.ilike("cuisine_type", `%${params.cuisine}%`)
        }
        if (params.location) {
            query = query.ilike("location", `%${params.location}%`)
        }
        if (params.minRating !== undefined) {
            query = query.gte("rating", params.minRating)
        }

        const { data, error, count } = await query

        if (error) {
            console.error("[DAL] getRestaurants error:", error.message)
            return { data: null, error: "Failed to fetch restaurants" }
        }

        return { data: data as Restaurant[], error: null, count: count ?? 0 }
    } catch (err) {
        console.error("[DAL] getRestaurants exception:", err)
        return { data: null, error: "An error occurred" }
    }
}

/**
 * Get a single restaurant by ID
 */
export async function getRestaurantById(id: string): Promise<DALResult<Restaurant>> {
    try {
        // Validate ID format
        validateInput(uuid, id)

        const supabase = await createClient()

        const { data, error } = await supabase.from("restaurants").select("*").eq("id", id).single()

        if (error) {
            if (error.code === "PGRST116") {
                return { data: null, error: "Restaurant not found" }
            }
            console.error("[DAL] getRestaurantById error:", error.message)
            return { data: null, error: "Failed to fetch restaurant" }
        }

        return { data: data as Restaurant, error: null }
    } catch (err) {
        console.error("[DAL] getRestaurantById exception:", err)
        return { data: null, error: "Invalid restaurant ID" }
    }
}

// ─── User Profile Operations ─────────────────────────────────────────────────

/**
 * Get user profile by ID (requires authentication)
 */
export async function getUserProfile(userId: string): Promise<DALResult<UserProfile>> {
    try {
        await requireAuth()
        validateInput(uuid, userId)

        const supabase = await createClient()

        const { data, error } = await supabase
            .from("profiles")
            .select("id, email, display_name, avatar_url, role, created_at")
            .eq("id", userId)
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                return { data: null, error: "User not found" }
            }
            return { data: null, error: "Failed to fetch user" }
        }

        return { data: data as UserProfile, error: null }
    } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred"
        return { data: null, error: message }
    }
}

/**
 * Update user profile (users can only update their own profile)
 */
export async function updateUserProfile(
    userId: string,
    updates: { display_name?: string; avatar_url?: string }
): Promise<DALResult<UserProfile>> {
    try {
        const currentUser = await requireAuth()
        validateInput(uuid, userId)

        // Users can only update their own profile
        if (currentUser.id !== userId && currentUser.role !== "admin") {
            return { data: null, error: "Cannot update another user's profile" }
        }

        const supabase = await createClient()

        // Sanitize updates - only allow specific fields
        const safeUpdates: Record<string, string | null> = {}
        if (updates.display_name !== undefined) {
            safeUpdates.display_name = updates.display_name
        }
        if (updates.avatar_url !== undefined) {
            safeUpdates.avatar_url = updates.avatar_url
        }

        const { data, error } = await supabase
            .from("profiles")
            .update(safeUpdates)
            .eq("id", userId)
            .select("id, email, display_name, avatar_url, role, created_at")
            .single()

        if (error) {
            console.error("[DAL] updateUserProfile error:", error.message)
            return { data: null, error: "Failed to update profile" }
        }

        return { data: data as UserProfile, error: null }
    } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred"
        return { data: null, error: message }
    }
}

// ─── Admin Operations ────────────────────────────────────────────────────────

/**
 * Get all users (admin only)
 */
export async function getAllUsers(
    params: PaginationParams = { page: 1, limit: 20 }
): Promise<DALResult<UserProfile[]>> {
    try {
        await requireAdmin()
        const { page, limit } = validateInput(paginationSchema, params)
        const offset = (page - 1) * limit

        const supabase = await createClient()

        const { data, error, count } = await supabase
            .from("profiles")
            .select("id, email, display_name, avatar_url, role, created_at", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            console.error("[DAL] getAllUsers error:", error.message)
            return { data: null, error: "Failed to fetch users" }
        }

        return { data: data as UserProfile[], error: null, count: count ?? 0 }
    } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred"
        return { data: null, error: message }
    }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
    userId: string,
    newRole: "user" | "admin" | "moderator"
): Promise<DALResult<UserProfile>> {
    try {
        const admin = await requireAdmin()
        validateInput(uuid, userId)

        // Prevent admin from demoting themselves
        if (admin.id === userId && newRole !== "admin") {
            return { data: null, error: "Cannot change your own admin role" }
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from("profiles")
            .update({ role: newRole })
            .eq("id", userId)
            .select("id, email, display_name, avatar_url, role, created_at")
            .single()

        if (error) {
            console.error("[DAL] updateUserRole error:", error.message)
            return { data: null, error: "Failed to update user role" }
        }

        // TODO: Log this action to audit_logs table

        return { data: data as UserProfile, error: null }
    } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred"
        return { data: null, error: message }
    }
}
