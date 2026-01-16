/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECURITY HEADERS UTILITY
 * 
 * Helper functions for accessing security headers in Server Components
 * and API routes. Compatible with Next.js 16.1.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { headers } from "next/headers"

/**
 * Get the CSP nonce from request headers
 * Use this in Server Components for inline scripts
 */
export async function getNonce(): Promise<string> {
    const headersList = await headers()
    return headersList.get("x-nonce") ?? ""
}

/**
 * Get all security-related headers for debugging
 */
export async function getSecurityHeaders(): Promise<Record<string, string | null>> {
    const headersList = await headers()

    return {
        csp: headersList.get("content-security-policy"),
        xFrameOptions: headersList.get("x-frame-options"),
        xContentTypeOptions: headersList.get("x-content-type-options"),
        referrerPolicy: headersList.get("referrer-policy"),
        permissionsPolicy: headersList.get("permissions-policy"),
        hsts: headersList.get("strict-transport-security"),
        nonce: headersList.get("x-nonce"),
    }
}

/**
 * Verify that all required security headers are present
 * Useful for health checks and monitoring
 */
export async function verifySecurityHeaders(): Promise<{
    isSecure: boolean
    missing: string[]
    present: string[]
}> {
    const securityHeaders = await getSecurityHeaders()

    const requiredHeaders = [
        "csp",
        "xFrameOptions",
        "xContentTypeOptions",
        "referrerPolicy",
        "permissionsPolicy",
    ]

    const missing: string[] = []
    const present: string[] = []

    for (const header of requiredHeaders) {
        if (securityHeaders[header]) {
            present.push(header)
        } else {
            missing.push(header)
        }
    }

    return {
        isSecure: missing.length === 0,
        missing,
        present,
    }
}
