import fs from "fs"
import path from "path"
import { execSync } from "child_process"

const ROOT = process.cwd()

// ✅ List of core files to keep
const KEEP_FILES = [
  "components/search/FilterSystem.tsx",
  "components/search/SearchContainer.tsx",
  "components/cards/CardGrid.tsx",
  "components/card/RestaurantCard.tsx",
  "components/card/variants/detailed.tsx",
  "components/card/variants/list.tsx",
  "app/restaurants/ResultsClient.tsx",
  "app/admin/AdminClient.tsx",
  "components/search/SortSystem.tsx",
]

// Recursively get all files
function getAllFiles(dir: string, files: string[] = []): string[] {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, files)
    } else {
      files.push(path.relative(ROOT, fullPath))
    }
  })
  return files
}

// Delete unwanted files
function cleanProject() {
  const allFiles = getAllFiles(ROOT)
  const extraFiles = allFiles.filter((f) => !KEEP_FILES.includes(f))
  console.log(`Found ${extraFiles.length} extra files to delete.`)

  extraFiles.forEach((f) => {
    try {
      fs.unlinkSync(path.join(ROOT, f))
      console.log("Deleted:", f)
    } catch (e) {
      console.warn("Failed to delete:", f, e)
    }
  })
}

// Run audit checks
function runAudit() {
  console.log("\n🔍 Running project audit...\n")

  // 1. TypeScript type check
  try {
    execSync("tsc --noEmit", { stdio: "inherit" })
  } catch {
    console.warn("TypeScript errors detected.")
  }

  // 2. Check for unused imports / code
  try {
    execSync("npx eslint . --ext .ts,.tsx --max-warnings 0", { stdio: "inherit" })
  } catch {
    console.warn("ESLint warnings/errors detected.")
  }

  // 3. Optional: build test
  try {
    execSync("bun run build", { stdio: "inherit" })
  } catch {
    console.warn("Build test failed.")
  }

  console.log("\n✅ Audit completed. Only core files remain.")
}

// Run cleanup + audit
function main() {
  console.log("Starting cleanup and audit...")
  cleanProject()
  runAudit()
}

main()
