/**
 * Image utilities with timeout protection
 * Export for safe image loading throughout the app
 */

export { customImageLoader, SafeImage, isValidUnsplashUrl, getPlaceholderUrl } from "./image-loader"
export {
  generateBlurHash,
  batchGenerateBlurHash,
  getFallbackBlurHash,
  getCachedBlurHash,
  setCachedBlurHash,
  clearBlurHashCache,
  getBlurHashCacheStats,
  generateBlurHashCached,
} from "./generate-blurhash"
export { decodeBlurHash, preDecodeBlurHash } from "./decode-blurhash"
