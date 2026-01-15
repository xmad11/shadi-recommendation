/* ═══════════════════════════════════════════════════════════════════════════════
   BLURHASH GENERATION - Server-side image placeholder generation
   Generates 20-character BlurHash from image URLs (20 chars vs 50KB images)

   Runtime: Node.js (required for sharp library)
   Edge Runtime: NOT SUPPORTED - sharp cannot run in Edge Runtime
   ═══════════════════════════════════════════════════════════════════════════════ */

import { encode } from "blurhash"
import sharp from "sharp"

// REQUIRED: Explicit Node.js runtime declaration for Sharp library
// See: https://nextjs.org/docs/app/api-reference/edge
export const runtime = "nodejs"

export interface BlurHashResult {
  hash: string
  width: number
  height: number
}

/**
 * Generate BlurHash from image URL
 * @param imageUrl - Remote image URL
 * @param componentX - Horizontal components (1-9, default 4)
 * @param componentY - Vertical components (1-9, default 4)
 * @returns BlurHash string (20 characters) or null on failure
 *
 * IMPORTANT: This function requires Node.js runtime (sharp is not Edge-compatible)
 */
export async function generateBlurHash(
  imageUrl: string,
  componentX = 4,
  componentY = 4
): Promise<string | null> {
  try {
    // Fetch image
    const response = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) })
    if (!response.ok) return null

    const buffer = Buffer.from(await response.arrayBuffer())

    // Use sharp to process image
    const { data, info } = await sharp(buffer)
      .resize(32, 32, { fit: "cover" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    // Generate BlurHash from RGB data
    const hash = encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      componentX,
      componentY
    )
    return hash
  } catch (error) {
    console.warn(`Failed to generate BlurHash for ${imageUrl}:`, error)
    return null
  }
}

/**
 * Batch generate BlurHash for multiple images
 * Processes in parallel with concurrency limit
 */
export async function batchGenerateBlurHash(
  imageUrls: string[],
  concurrency = 3
): Promise<Map<string, string>> {
  const results = new Map<string, string>()

  // Process in batches to avoid overwhelming the network
  for (let i = 0; i < imageUrls.length; i += concurrency) {
    const batch = imageUrls.slice(i, i + concurrency)
    const hashes = await Promise.allSettled(
      batch.map(async (url) => {
        const hash = await generateBlurHash(url)
        return { url, hash }
      })
    )

    for (const result of hashes) {
      if (result.status === "fulfilled" && result.value.hash) {
        results.set(result.value.url, result.value.hash)
      }
    }
  }

  return results
}

/**
 * Get a fallback BlurHash for failed generations
 * This produces a neutral gray placeholder
 */
export function getFallbackBlurHash(): string {
  return "L6HZ8k8g%g%g%g%g%g%g%g%g" // Neutral gray
}

/* ═══════════════════════════════════════════════════════════════════════════════
   BLURHASH CACHING - In-memory cache for generated BlurHash strings
   Prevents re-generating the same BlurHash multiple times
   ═══════════════════════════════════════════════════════════════════════════════ */

const blurHashCache = new Map<string, string>()

/**
 * Get cached BlurHash for an image URL
 */
export function getCachedBlurHash(imageUrl: string): string | null {
  return blurHashCache.get(imageUrl) || null
}

/**
 * Set cached BlurHash for an image URL
 */
export function setCachedBlurHash(imageUrl: string, hash: string): void {
  blurHashCache.set(imageUrl, hash)
}

/**
 * Clear all cached BlurHash strings
 * Useful for testing or memory management
 */
export function clearBlurHashCache(): void {
  blurHashCache.clear()
}

/**
 * Get cache statistics
 */
export function getBlurHashCacheStats(): { size: number; keys: string[] } {
  return {
    size: blurHashCache.size,
    keys: Array.from(blurHashCache.keys()),
  }
}

/**
 * Generate BlurHash with caching
 * Checks cache first before generating new hash
 */
export async function generateBlurHashCached(
  imageUrl: string,
  componentX = 4,
  componentY = 4
): Promise<string | null> {
  // Check cache first
  const cached = getCachedBlurHash(imageUrl)
  if (cached) {
    return cached
  }

  // Generate new
  const hash = await generateBlurHash(imageUrl, componentX, componentY)
  if (hash) {
    setCachedBlurHash(imageUrl, hash)
  }
  return hash
}
