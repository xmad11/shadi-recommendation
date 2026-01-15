/* ═══════════════════════════════════════════════════════════════════════════════
   BLURHASH DECODING - Client-side BlurHash to Canvas rendering
   Decodes 20-character BlurHash strings into canvas images
   ═══════════════════════════════════════════════════════════════════════════════ */

import { decode } from "blurhash"

/**
 * Decode BlurHash to data URL
 * @param hash - BlurHash string (20 characters)
 * @param width - Output width in pixels
 * @param height - Output height in pixels
 * @param punch - Contrast adjustment (default 1)
 * @returns Data URL of decoded image or null on failure
 */
export function decodeBlurHash(hash: string, width = 32, height = 32, punch = 1): string | null {
  try {
    const pixels = decode(hash, width, height, punch)

    // Create canvas
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Failed to get 2D context from canvas")
    }

    // Create ImageData from pixels
    const imageData = ctx.createImageData(width, height)
    imageData.data.set(pixels)
    ctx.putImageData(imageData, 0, 0)

    return canvas.toDataURL()
  } catch (error) {
    console.warn("Failed to decode BlurHash:", error)
    return null
  }
}

/**
 * Pre-decode a BlurHash and return a data URL
 * Useful for preloading multiple blurhashes
 */
export function preDecodeBlurHash(hash: string, width = 32, height = 32): Promise<string | null> {
  return new Promise((resolve) => {
    // Use requestIdleCallback if available for non-blocking decode
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => {
        resolve(decodeBlurHash(hash, width, height))
      })
    } else {
      // Fallback to setTimeout
      setTimeout(() => {
        resolve(decodeBlurHash(hash, width, height))
      }, 0)
    }
  })
}
