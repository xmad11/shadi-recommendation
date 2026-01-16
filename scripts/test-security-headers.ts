#!/usr/bin/env bun
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECURITY HEADERS TEST SCRIPT
 * 
 * Validates that all required security headers are present in the application.
 * Run: bun run scripts/test-security-headers.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const APP_URL = process.env.APP_URL || "http://localhost:3000"

interface HeaderCheck {
    name: string
    header: string
    description: string
    required: boolean
}

const REQUIRED_HEADERS: HeaderCheck[] = [
    {
        name: "Content-Security-Policy",
        header: "content-security-policy",
        description: "CSP - Prevents XSS attacks",
        required: true,
    },
    {
        name: "X-Content-Type-Options",
        header: "x-content-type-options",
        description: "Prevents MIME sniffing",
        required: true,
    },
    {
        name: "X-Frame-Options",
        header: "x-frame-options",
        description: "Clickjacking protection",
        required: true,
    },
    {
        name: "Referrer-Policy",
        header: "referrer-policy",
        description: "Controls referrer information",
        required: true,
    },
    {
        name: "Permissions-Policy",
        header: "permissions-policy",
        description: "Restricts browser features",
        required: true,
    },
    {
        name: "X-Nonce",
        header: "x-nonce",
        description: "CSP nonce for inline scripts",
        required: true,
    },
    {
        name: "Strict-Transport-Security",
        header: "strict-transport-security",
        description: "HSTS - Forces HTTPS",
        required: false, // Only in production
    },
]

const DANGEROUS_HEADERS = ["server", "x-powered-by"]

async function testSecurityHeaders(): Promise<void> {
    console.log("🔐 Security Headers Test")
    console.log("━".repeat(60))
    console.log(`📍 Testing: ${APP_URL}\n`)

    let score = 0
    let total = 0
    const issues: string[] = []

    try {
        const response = await fetch(APP_URL, { method: "HEAD" })
        const headers = response.headers

        console.log("Security Headers Status:")
        console.log("─".repeat(60))

        // Check required headers
        for (const check of REQUIRED_HEADERS) {
            const value = headers.get(check.header)
            if (check.required) total++

            if (value) {
                if (check.required) score++
                console.log(`✅ ${check.name}`)
                console.log(`   ${check.description}`)
                console.log(`   Value: ${value.substring(0, 80)}${value.length > 80 ? "..." : ""}`)
            } else if (check.required) {
                console.log(`❌ ${check.name} - MISSING`)
                console.log(`   ${check.description}`)
                issues.push(`Missing: ${check.name}`)
            } else {
                console.log(`⚪ ${check.name} - Optional (not set)`)
            }
            console.log()
        }

        // Check for dangerous headers
        console.log("Dangerous Headers Check:")
        console.log("─".repeat(60))
        for (const header of DANGEROUS_HEADERS) {
            const value = headers.get(header)
            if (value) {
                console.log(`⚠️  ${header}: ${value} - Should be hidden!`)
                issues.push(`Exposed: ${header}`)
            } else {
                console.log(`✅ ${header}: Not exposed`)
            }
        }

        // Summary
        console.log("\n" + "━".repeat(60))
        console.log(`📊 Security Score: ${score}/${total} (${Math.round((score / total) * 100)}%)`)

        if (issues.length === 0) {
            console.log("🎉 All security headers are properly configured!")
        } else {
            console.log("\n⚠️  Issues found:")
            for (const issue of issues) {
                console.log(`   • ${issue}`)
            }
            process.exit(1)
        }
    } catch (error) {
        console.error(`❌ Failed to connect to ${APP_URL}`)
        console.error(`   Make sure the development server is running: bun run dev`)
        console.error(`   Error: ${error instanceof Error ? error.message : "Unknown error"}`)
        process.exit(1)
    }
}

// Run the test
testSecurityHeaders()
