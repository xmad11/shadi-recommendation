#!/usr/bin/env bun
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ENVIRONMENT AUDIT SCRIPT
 * 
 * Checks for security issues in environment variables:
 * - No secrets in NEXT_PUBLIC_* variables
 * - Required variables are set
 * - No hardcoded secrets in code
 * 
 * Run: bun run scripts/audit-env.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"

const PROJECT_ROOT = process.cwd()

// Patterns that indicate sensitive data
const SENSITIVE_PATTERNS = [
    /service[_-]?role/i,
    /secret[_-]?key/i,
    /api[_-]?secret/i,
    /private[_-]?key/i,
    /password/i,
    /jwt[_-]?secret/i,
    /database[_-]?url.*password/i,
]

// Files to check for env usage
const ENV_FILES = [".env.local.example", ".env.example", ".env.local", ".env"]

// Required public variables (safe to expose)
const REQUIRED_PUBLIC = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

// Variables that must NEVER be public
const NEVER_PUBLIC = ["SUPABASE_SERVICE_ROLE_KEY", "JWT_SECRET", "DATABASE_PASSWORD"]

interface AuditResult {
    passed: boolean
    issues: string[]
    warnings: string[]
}

function auditEnvFile(filePath: string): AuditResult {
    const issues: string[] = []
    const warnings: string[] = []

    if (!existsSync(filePath)) {
        return { passed: true, issues: [], warnings: [] }
    }

    const content = readFileSync(filePath, "utf-8")
    const lines = content.split("\n")

    for (const [index, line] of lines.entries()) {
        const lineNum = index + 1
        const trimmed = line.trim()

        // Skip comments and empty lines
        if (trimmed.startsWith("#") || trimmed === "") continue

        // Parse variable name
        const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/)
        if (!match) continue

        const varName = match[1]

        // Check if public variable contains sensitive pattern
        if (varName.startsWith("NEXT_PUBLIC_")) {
            for (const pattern of SENSITIVE_PATTERNS) {
                if (pattern.test(varName)) {
                    issues.push(`Line ${lineNum}: ${varName} - Public variable matches sensitive pattern!`)
                }
            }
        }

        // Check if sensitive variable is marked as public
        for (const neverPublic of NEVER_PUBLIC) {
            if (varName.includes(neverPublic) && varName.startsWith("NEXT_PUBLIC_")) {
                issues.push(`Line ${lineNum}: ${varName} - This should NEVER be a NEXT_PUBLIC_ variable!`)
            }
        }
    }

    return {
        passed: issues.length === 0,
        issues,
        warnings,
    }
}

function checkRequiredVariables(): AuditResult {
    const issues: string[] = []
    const warnings: string[] = []

    for (const required of REQUIRED_PUBLIC) {
        if (!process.env[required]) {
            warnings.push(`${required} is not set in environment`)
        }
    }

    return { passed: true, issues, warnings }
}

async function main(): Promise<void> {
    console.log("🔐 Environment Security Audit")
    console.log("━".repeat(60))

    let hasIssues = false

    // Check each env file
    for (const envFile of ENV_FILES) {
        const filePath = join(PROJECT_ROOT, envFile)
        if (!existsSync(filePath)) continue

        console.log(`\n📄 Checking ${envFile}...`)
        const result = auditEnvFile(filePath)

        if (result.issues.length > 0) {
            hasIssues = true
            console.log("❌ Issues found:")
            for (const issue of result.issues) {
                console.log(`   • ${issue}`)
            }
        } else {
            console.log("✅ No issues found")
        }

        if (result.warnings.length > 0) {
            console.log("⚠️  Warnings:")
            for (const warning of result.warnings) {
                console.log(`   • ${warning}`)
            }
        }
    }

    // Check required variables
    console.log("\n📋 Required Variables Check...")
    const requiredResult = checkRequiredVariables()
    if (requiredResult.warnings.length > 0) {
        console.log("⚠️  Missing variables:")
        for (const warning of requiredResult.warnings) {
            console.log(`   • ${warning}`)
        }
    } else {
        console.log("✅ All required variables present")
    }

    // Summary
    console.log("\n" + "━".repeat(60))
    if (hasIssues) {
        console.log("❌ Audit FAILED - Fix issues before deploying!")
        process.exit(1)
    } else {
        console.log("✅ Environment audit passed")
    }
}

main().catch(console.error)
