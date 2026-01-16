#!/usr/bin/env bun
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECURITY MONITORING SCRIPT
 *
 * Daily security health check for the application.
 * Run: bun run scripts/security-monitor.ts
 *
 * Checks:
 * - Security headers
 * - Dependency vulnerabilities
 * - Environment configuration
 * - Code patterns
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { execSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const PROJECT_ROOT = process.cwd()
const APP_URL = process.env.APP_URL || "http://localhost:3000"
const REPORT_DIR = join(PROJECT_ROOT, ".security")

interface SecurityCheck {
    name: string
    status: "pass" | "warn" | "fail"
    message: string
    details?: string
}

interface SecurityReport {
    timestamp: string
    overallStatus: "healthy" | "warnings" | "critical"
    checks: SecurityCheck[]
    summary: {
        passed: number
        warnings: number
        failed: number
    }
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function ensureReportDir(): void {
    if (!existsSync(REPORT_DIR)) {
        execSync(`mkdir -p ${REPORT_DIR}`)
    }
}

function runCommand(command: string): { success: boolean; output: string } {
    try {
        const output = execSync(command, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] })
        return { success: true, output }
    } catch (error) {
        const err = error as { stdout?: string; stderr?: string; message?: string }
        return {
            success: false,
            output: err.stdout || err.stderr || err.message || "Command failed",
        }
    }
}

// ─── Security Checks ─────────────────────────────────────────────────────────

async function checkDependencies(): Promise<SecurityCheck> {
    console.log("🔍 Checking dependencies...")

    const result = runCommand("bun audit 2>&1")

    if (result.output.includes("No vulnerabilities found")) {
        return {
            name: "Dependency Vulnerabilities",
            status: "pass",
            message: "No known vulnerabilities",
        }
    }

    const hasHigh =
        result.output.includes("high") ||
        result.output.includes("critical") ||
        result.output.includes("High") ||
        result.output.includes("Critical")

    return {
        name: "Dependency Vulnerabilities",
        status: hasHigh ? "fail" : "warn",
        message: hasHigh ? "High/critical vulnerabilities found" : "Low/moderate vulnerabilities found",
        details: result.output.substring(0, 500),
    }
}

function checkMiddleware(): SecurityCheck {
    console.log("🔍 Checking proxy...")

    const middlewarePath = join(PROJECT_ROOT, "proxy.ts")

    if (!existsSync(middlewarePath)) {
        return {
            name: "Security Proxy",
            status: "fail",
            message: "proxy.ts not found",
        }
    }

    const content = readFileSync(middlewarePath, "utf-8")

    const checks = [
        { pattern: "Content-Security-Policy", name: "CSP" },
        { pattern: "X-Frame-Options", name: "X-Frame-Options" },
        { pattern: "X-Content-Type-Options", name: "X-Content-Type-Options" },
        { pattern: "Referrer-Policy", name: "Referrer-Policy" },
    ]

    const missing = checks.filter((c) => !content.includes(c.pattern)).map((c) => c.name)

    if (missing.length === 0) {
        return {
            name: "Security Proxy",
            status: "pass",
            message: "All security headers configured",
        }
    }

    return {
        name: "Security Proxy",
        status: missing.length > 2 ? "fail" : "warn",
        message: `Missing headers: ${missing.join(", ")}`,
    }
}

function checkEnvVariables(): SecurityCheck {
    console.log("🔍 Checking environment variables...")

    const envFiles = [".env.local", ".env"]
    const issues: string[] = []

    for (const envFile of envFiles) {
        const envPath = join(PROJECT_ROOT, envFile)
        if (!existsSync(envPath)) continue

        const content = readFileSync(envPath, "utf-8")
        const lines = content.split("\n")

        for (const line of lines) {
            // Check for service role key in NEXT_PUBLIC
            if (line.includes("NEXT_PUBLIC_") && line.toLowerCase().includes("service")) {
                issues.push(`${envFile}: Service key exposed in NEXT_PUBLIC variable`)
            }
            // Check for hardcoded secrets
            if (line.includes("NEXT_PUBLIC_") && /password|secret|private/i.test(line)) {
                issues.push(`${envFile}: Sensitive value in NEXT_PUBLIC variable`)
            }
        }
    }

    if (issues.length === 0) {
        return {
            name: "Environment Variables",
            status: "pass",
            message: "No sensitive data exposed",
        }
    }

    return {
        name: "Environment Variables",
        status: "fail",
        message: `${issues.length} security issue(s) found`,
        details: issues.join("\n"),
    }
}

function checkDangerousPatterns(): SecurityCheck {
    console.log("🔍 Checking dangerous code patterns...")

    const issues: string[] = []

    // Check for eval usage
    const evalResult = runCommand(
        `grep -rn "eval(" app/ components/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null || true`
    )
    if (evalResult.output.trim()) {
        issues.push(`eval() usage found:\n${evalResult.output.trim()}`)
    }

    // Check for innerHTML without sanitization
    const innerHTMLResult = runCommand(
        `grep -rn "innerHTML" app/ components/ --include="*.tsx" 2>/dev/null | grep -v "dangerouslySetInnerHTML" || true`
    )
    if (innerHTMLResult.output.trim()) {
        issues.push(`Direct innerHTML manipulation found`)
    }

    // Check for any types
    const anyResult = runCommand(
        `grep -rn ": any" app/ components/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l`
    )
    const anyCount = Number.parseInt(anyResult.output.trim()) || 0
    if (anyCount > 10) {
        issues.push(`${anyCount} uses of 'any' type (target: 0)`)
    }

    if (issues.length === 0) {
        return {
            name: "Dangerous Code Patterns",
            status: "pass",
            message: "No dangerous patterns detected",
        }
    }

    return {
        name: "Dangerous Code Patterns",
        status: issues.some((i) => i.includes("eval")) ? "fail" : "warn",
        message: `${issues.length} potential issue(s) found`,
        details: issues.join("\n\n"),
    }
}

function checkGitIgnore(): SecurityCheck {
    console.log("🔍 Checking .gitignore...")

    const gitignorePath = join(PROJECT_ROOT, ".gitignore")

    if (!existsSync(gitignorePath)) {
        return {
            name: "Git Security",
            status: "fail",
            message: ".gitignore not found",
        }
    }

    const content = readFileSync(gitignorePath, "utf-8")

    const requiredPatterns = [".env.local", ".env*.local", "node_modules"]

    const missing = requiredPatterns.filter(
        (p) => !content.includes(p) && !content.includes(p.replace("*", ""))
    )

    if (missing.length === 0) {
        return {
            name: "Git Security",
            status: "pass",
            message: "Sensitive files properly ignored",
        }
    }

    return {
        name: "Git Security",
        status: "warn",
        message: `Missing ignore patterns: ${missing.join(", ")}`,
    }
}

function checkTypeScript(): SecurityCheck {
    console.log("🔍 Checking TypeScript configuration...")

    const tsconfigPath = join(PROJECT_ROOT, "tsconfig.json")

    if (!existsSync(tsconfigPath)) {
        return {
            name: "TypeScript Strict Mode",
            status: "warn",
            message: "tsconfig.json not found",
        }
    }

    const content = readFileSync(tsconfigPath, "utf-8")

    const hasStrict = content.includes('"strict": true') || content.includes('"strict":true')

    if (hasStrict) {
        return {
            name: "TypeScript Strict Mode",
            status: "pass",
            message: "Strict mode enabled",
        }
    }

    return {
        name: "TypeScript Strict Mode",
        status: "warn",
        message: "Strict mode not enabled",
    }
}

// ─── Report Generation ───────────────────────────────────────────────────────

function generateReport(checks: SecurityCheck[]): SecurityReport {
    const summary = {
        passed: checks.filter((c) => c.status === "pass").length,
        warnings: checks.filter((c) => c.status === "warn").length,
        failed: checks.filter((c) => c.status === "fail").length,
    }

    let overallStatus: "healthy" | "warnings" | "critical" = "healthy"
    if (summary.failed > 0) overallStatus = "critical"
    else if (summary.warnings > 0) overallStatus = "warnings"

    return {
        timestamp: new Date().toISOString(),
        overallStatus,
        checks,
        summary,
    }
}

function printReport(report: SecurityReport): void {
    console.log("\n" + "═".repeat(60))
    console.log("🔐 SECURITY MONITORING REPORT")
    console.log("═".repeat(60))
    console.log(`📅 Generated: ${report.timestamp}`)
    console.log("")

    for (const check of report.checks) {
        const icon = check.status === "pass" ? "✅" : check.status === "warn" ? "⚠️" : "❌"
        console.log(`${icon} ${check.name}: ${check.message}`)
        if (check.details && check.status !== "pass") {
            console.log(`   Details: ${check.details.substring(0, 200)}...`)
        }
    }

    console.log("")
    console.log("─".repeat(60))
    console.log("📊 Summary:")
    console.log(`   ✅ Passed: ${report.summary.passed}`)
    console.log(`   ⚠️  Warnings: ${report.summary.warnings}`)
    console.log(`   ❌ Failed: ${report.summary.failed}`)
    console.log("")

    const statusEmoji =
        report.overallStatus === "healthy"
            ? "🟢"
            : report.overallStatus === "warnings"
                ? "🟡"
                : "🔴"
    console.log(`${statusEmoji} Overall Status: ${report.overallStatus.toUpperCase()}`)
    console.log("═".repeat(60))
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    console.log("🔐 Starting Security Monitoring...\n")

    ensureReportDir()

    const checks: SecurityCheck[] = []

    // Run all checks
    checks.push(await checkDependencies())
    checks.push(checkMiddleware())
    checks.push(checkEnvVariables())
    checks.push(checkDangerousPatterns())
    checks.push(checkGitIgnore())
    checks.push(checkTypeScript())

    // Generate report
    const report = generateReport(checks)
    printReport(report)

    // Save report
    const reportPath = join(REPORT_DIR, `report-${new Date().toISOString().split("T")[0]}.json`)
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Report saved: ${reportPath}`)

    // Exit with appropriate code
    if (report.overallStatus === "critical") {
        process.exit(1)
    }
}

main().catch((error) => {
    console.error("❌ Security monitoring failed:", error)
    process.exit(1)
})
