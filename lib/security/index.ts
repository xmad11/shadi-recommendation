/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECURITY MODULE - Central Export
 * 
 * Import security utilities from this file:
 * import { validateInput, getNonce } from '@/lib/security'
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Validation schemas and helpers
export {
    // Common validators
    safeString,
    email,
    uuid,
    positiveInt,
    paginationSchema,
    // User schemas
    userIdSchema,
    userProfileSchema,
    // Restaurant schemas
    restaurantIdSchema,
    searchQuerySchema,
    reviewSchema,
    // File upload
    imageUploadSchema,
    // Helper functions
    validateInput,
    safeValidateInput,
    // Types
    type PaginationParams,
    type SearchQuery,
    type ReviewInput,
    type UserProfileInput,
} from "./validation"

// Header utilities
export { getNonce, getSecurityHeaders, verifySecurityHeaders } from "./headers"

// Session configuration
export {
    SECURE_COOKIE_OPTIONS,
    STRICT_COOKIE_OPTIONS,
    SESSION_CONFIG,
    COOKIE_NAMES,
    isSessionExpiringSoon,
    getSecureCookieOptions,
} from "./session"

// Audit logging
export { auditLog, type AuditAction, type AuditSeverity, type AuditLogEntry } from "./audit"

// Zero-trust utilities
export {
    verifySession,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    requireAuth,
    requirePermission,
    checkAccess,
    canAccessResource,
    trackActivity,
    PERMISSIONS,
    type VerifiedUser,
    type AccessCheck,
    type Permission,
} from "./zero-trust"
