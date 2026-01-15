/* ═══════════════════════════════════════════════════════════════════════════════
   NEXT.JS CONFIG - Phase 1 Performance Optimizations
   - PPR (Partial Prerendering) enabled
   - AVIF/WebP image formats
   - Production-only optimization
   ═══════════════════════════════════════════════════════════════════════════════ */

import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig = {
  // Turbopack root - prevents ambiguity from multiple lockfiles
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Disable features that cause issues on mobile Safari
  experimental: {
    viewTransition: false, // Prevents AbortError on mobile Safari
  },

  // PPR - Disabled cacheComponents due to refresh loops in development
  // cacheComponents: true,

  // Image optimization: AVIF/WebP = 40-70% smaller images
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [60, 70, 75], // Support quality 60, 70, 75 for OptimizedImage
    minimumCacheTTL: 31536000, // 1 year cache for static images

    // Remote patterns for Supabase/CDN images
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],

    // Unoptimized in development for faster builds
    unoptimized: process.env.NODE_ENV !== "production",
  },

  // DEV ONLY: Allow all origins to prevent mobile refresh loop
  // WARNING: NEVER deploy this to production
  // REMOVED: allowedDevOrigins with ["*"] doesn't work as wildcard
  // Leaving undefined makes it warn instead of block
}

export default nextConfig
