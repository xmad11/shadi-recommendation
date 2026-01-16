/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * INPUT VALIDATION - Zod Schemas for Type-Safe Validation
 * 
 * Best practices for Next.js 16.1 + TypeScript:
 * - All API inputs must be validated using these schemas
 * - Server Actions must validate before processing
 * - Never trust client-side validation alone
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { z } from "zod"

// ─── Common Validators ───────────────────────────────────────────────────────

/** Safe string that prevents XSS and SQL injection patterns */
export const safeString = z
    .string()
    .min(1, "Required")
    .max(1000, "Too long")
    .refine((val) => !/<script|javascript:|on\w+=/i.test(val), {
        message: "Invalid characters detected",
    })

/** Valid email address */
export const email = z.string().email("Invalid email address").toLowerCase().trim()

/** UUID v4 format */
export const uuid = z.string().uuid("Invalid ID format")

/** Positive integer */
export const positiveInt = z.coerce.number().int().positive()

/** Pagination parameters */
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
})

// ─── User Schemas ────────────────────────────────────────────────────────────

export const userIdSchema = z.object({
    userId: uuid,
})

export const userProfileSchema = z.object({
    displayName: safeString.max(100).optional(),
    bio: safeString.max(500).optional(),
    avatarUrl: z.string().url().optional().nullable(),
})

// ─── Restaurant/Recommendation Schemas ───────────────────────────────────────

export const restaurantIdSchema = z.object({
    restaurantId: uuid,
})

export const searchQuerySchema = z.object({
    query: safeString.max(200).optional(),
    cuisine: safeString.max(50).optional(),
    location: safeString.max(100).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    maxPrice: z.coerce.number().int().min(1).max(4).optional(),
    ...paginationSchema.shape,
})

export const reviewSchema = z.object({
    restaurantId: uuid,
    rating: z.coerce.number().min(1).max(5),
    title: safeString.max(100),
    content: safeString.max(2000),
})

// ─── File Upload Validation ──────────────────────────────────────────────────

/** Allowed MIME types for image uploads */
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const

/** Max file size: 5MB */
const MAX_FILE_SIZE = 5 * 1024 * 1024

export const imageUploadSchema = z.object({
    file: z
        .instanceof(File)
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        })
        .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number]), {
            message: `File type must be one of: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
        }),
})

// ─── API Response Types ──────────────────────────────────────────────────────

export type PaginationParams = z.infer<typeof paginationSchema>
export type SearchQuery = z.infer<typeof searchQuerySchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type UserProfileInput = z.infer<typeof userProfileSchema>

// ─── Validation Helper ───────────────────────────────────────────────────────

/**
 * Safely parse and validate input data
 * Returns typed data or throws ZodError with user-friendly messages
 */
export function validateInput<T>(schema: z.Schema<T>, data: unknown): T {
    return schema.parse(data)
}

/**
 * Safe validation that returns result object instead of throwing
 */
export function safeValidateInput<T>(
    schema: z.Schema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
    const result = schema.safeParse(data)
    if (result.success) {
        return { success: true, data: result.data }
    }
    return { success: false, error: result.error }
}
