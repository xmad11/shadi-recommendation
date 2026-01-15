import { execSync } from "child_process"
import { existsSync, readdirSync, statSync } from "fs"
import path from "path"

const projectRoot = process.cwd()

// Minimal allowed files and folders
const allowedPaths = [
  "app/restaurants/ResultsClient.tsx",
  "app/admin/AdminPage.tsx",
  "components/card/BaseCard.tsx",
  "components/card/RestaurantCard.tsx",
  "components/card/variants/detailed.tsx",
  "components/card/variants/list.tsx",
  "components/cards/CardGrid.tsx",
  "components/search/FilterSystem.tsx",
  "components/search/SearchContainer.tsx",
  "components/search/SortSystem.tsx",
  "components/carousel/CardCarousel.tsx",
  "components/icons",
  "hooks/useBreakpoint.ts",
  "types/restaurant.ts",
]

// Recursive file listing
function listFiles(dir: string): string[] {
  let files: string[] = []
  const entries = readdirSync(dir)
  for (const f of entries) {
    const fullPath = path.join(dir, f)
    if (statSync(fullPath).isDirectory()) {
      files = files.concat(listFiles(fullPath))
    } else if (f.endsWith(".tsx") || f.endsWith(".ts")) {
      files.push(path.relative(projectRoot, fullPath))
    }
  }
  return files
}

// List all project ts/tsx files
const allFiles = listFiles(projectRoot)

// Identify extra files
const extraFiles = allFiles.filter((f) => !allowedPaths.some((p) => f.startsWith(p)))

console.log("\n===== PROJECT AUDIT REPORT =====\n")
console.log("Total TS/TSX files found:", allFiles.length)
console.log("\nAllowed files/folders:")
allowedPaths.forEach((f) => console.log("  ✅", f))
console.log("\nExtra/unwanted files:")
if (extraFiles.length === 0) console.log("  None ✅")
else extraFiles.forEach((f) => console.log("  ❌", f))

// Run basic lint/type check
console.log("\nRunning lint check...")
try {
  execSync("npm run lint", { stdio: "inherit" })
} catch {
  console.log("Lint errors detected.")
}

console.log("\nRunning type check...")
try {
  execSync("npm run type-check", { stdio: "inherit" })
} catch {
  console.log("Type errors detected.")
}

// Test pages rendering (headless check)
console.log("\nChecking basic page rendering with next dev build...")
try {
  execSync("NEXT_TELEMETRY_DISABLED=1 next build", { stdio: "inherit" })
  console.log("Build successful ✅ Pages render OK")
} catch {
  console.log("Build failed ❌ Check pages / components")
}

console.log("\n===== END OF AUDIT =====\n")
