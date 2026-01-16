#!/usr/bin/env bun
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SBOM GENERATOR - Software Bill of Materials
 *
 * Generates a CycloneDX-compatible SBOM for compliance and security tracking.
 * Run: bun run scripts/generate-sbom.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { createHash } from "node:crypto"

const PROJECT_ROOT = process.cwd()
const OUTPUT_FILE = join(PROJECT_ROOT, "sbom.json")

interface PackageJson {
    name: string
    version: string
    description?: string
    license?: string
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
}

interface SBOMComponent {
    type: "library"
    name: string
    version: string
    purl: string
    scope?: "required" | "optional" | "excluded"
    licenses?: Array<{ license: { id: string } }>
    hashes?: Array<{ alg: string; content: string }>
}

interface SBOM {
    bomFormat: "CycloneDX"
    specVersion: "1.4"
    serialNumber: string
    version: number
    metadata: {
        timestamp: string
        tools: Array<{ vendor: string; name: string; version: string }>
        component: {
            type: "application"
            name: string
            version: string
        }
    }
    components: SBOMComponent[]
}

function generateSerialNumber(): string {
    return `urn:uuid:${crypto.randomUUID()}`
}

function getPackageInfo(name: string): { version: string; license?: string } | null {
    try {
        const packagePath = join(PROJECT_ROOT, "node_modules", name, "package.json")
        if (!existsSync(packagePath)) return null

        const pkg = JSON.parse(readFileSync(packagePath, "utf-8"))
        return {
            version: pkg.version,
            license: typeof pkg.license === "string" ? pkg.license : pkg.license?.type,
        }
    } catch {
        return null
    }
}

function createPurl(name: string, version: string): string {
    // Package URL format: pkg:npm/name@version
    const encodedName = name.startsWith("@") ? name.replace("/", "%2F") : name
    return `pkg:npm/${encodedName}@${version}`
}

function generateSBOM(): SBOM {
    console.log("📦 Generating Software Bill of Materials...")

    // Read project package.json
    const projectPkg: PackageJson = JSON.parse(
        readFileSync(join(PROJECT_ROOT, "package.json"), "utf-8")
    )

    const components: SBOMComponent[] = []

    // Process production dependencies
    const deps = projectPkg.dependencies || {}
    console.log(`   Processing ${Object.keys(deps).length} production dependencies...`)

    for (const [name, _versionSpec] of Object.entries(deps)) {
        const info = getPackageInfo(name)
        if (!info) continue

        const component: SBOMComponent = {
            type: "library",
            name,
            version: info.version,
            purl: createPurl(name, info.version),
            scope: "required",
        }

        if (info.license) {
            component.licenses = [{ license: { id: info.license } }]
        }

        components.push(component)
    }

    // Process dev dependencies
    const devDeps = projectPkg.devDependencies || {}
    console.log(`   Processing ${Object.keys(devDeps).length} dev dependencies...`)

    for (const [name, _versionSpec] of Object.entries(devDeps)) {
        const info = getPackageInfo(name)
        if (!info) continue

        const component: SBOMComponent = {
            type: "library",
            name,
            version: info.version,
            purl: createPurl(name, info.version),
            scope: "excluded", // Dev dependencies excluded from production
        }

        if (info.license) {
            component.licenses = [{ license: { id: info.license } }]
        }

        components.push(component)
    }

    const sbom: SBOM = {
        bomFormat: "CycloneDX",
        specVersion: "1.4",
        serialNumber: generateSerialNumber(),
        version: 1,
        metadata: {
            timestamp: new Date().toISOString(),
            tools: [
                {
                    vendor: "Shadi Recommendations",
                    name: "sbom-generator",
                    version: "1.0.0",
                },
            ],
            component: {
                type: "application",
                name: projectPkg.name,
                version: projectPkg.version,
            },
        },
        components,
    }

    return sbom
}

function generateStats(sbom: SBOM): void {
    console.log("\n📊 SBOM Statistics:")
    console.log("━".repeat(50))

    const required = sbom.components.filter((c) => c.scope === "required").length
    const excluded = sbom.components.filter((c) => c.scope === "excluded").length
    const total = sbom.components.length

    console.log(`   Total components: ${total}`)
    console.log(`   Production: ${required}`)
    console.log(`   Development: ${excluded}`)

    // License breakdown
    const licenses = new Map<string, number>()
    for (const component of sbom.components) {
        const license = component.licenses?.[0]?.license?.id || "Unknown"
        licenses.set(license, (licenses.get(license) || 0) + 1)
    }

    console.log("\n   License Distribution:")
    const sortedLicenses = [...licenses.entries()].sort((a, b) => b[1] - a[1])
    for (const [license, count] of sortedLicenses.slice(0, 10)) {
        console.log(`     ${license}: ${count}`)
    }

    // Check for problematic licenses
    const problematicLicenses = ["GPL", "AGPL", "LGPL", "SSPL"]
    const problems = sbom.components.filter((c) =>
        problematicLicenses.some((p) => c.licenses?.[0]?.license?.id?.includes(p))
    )

    if (problems.length > 0) {
        console.log("\n   ⚠️  Potentially Problematic Licenses:")
        for (const comp of problems) {
            console.log(`     ${comp.name}@${comp.version}: ${comp.licenses?.[0]?.license?.id}`)
        }
    } else {
        console.log("\n   ✅ No problematic licenses detected")
    }
}

async function main(): Promise<void> {
    try {
        const sbom = generateSBOM()

        // Write SBOM to file
        writeFileSync(OUTPUT_FILE, JSON.stringify(sbom, null, 2))
        console.log(`\n✅ SBOM generated: ${OUTPUT_FILE}`)

        // Generate hash for integrity
        const content = readFileSync(OUTPUT_FILE)
        const hash = createHash("sha256").update(content).digest("hex")
        console.log(`   SHA-256: ${hash}`)

        generateStats(sbom)
    } catch (error) {
        console.error("❌ Failed to generate SBOM:", error)
        process.exit(1)
    }
}

main()
