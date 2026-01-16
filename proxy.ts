import { NextResponse, type NextRequest, type NextMiddleware } from "next/server"

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECURITY MIDDLEWARE - Next.js 16.1 + Bun Compatible
 * 
 * Features:
 * - Content Security Policy (CSP) with nonce support
 * - Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
 * - Rate limiting (in-memory for development, use Redis for production)
 * - CSRF protection for POST/PUT/DELETE requests
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── Rate Limiting Configuration ─────────────────────────────────────────────
const RATE_LIMIT_WINDOW = 60 // seconds
const RATE_LIMIT_MAX_REQUESTS = 100

// In-memory store for rate limiting (use Redis/Upstash in production)
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>()

// ─── Proxy Function ─────────────────────────────────────────────────────
export const proxy: NextMiddleware = async (request: NextRequest) => {
    const response = NextResponse.next()
    const { pathname } = request.nextUrl
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1"

    // ─── 1. Rate Limiting for API Routes ───────────────────────────────────────
    if (pathname.startsWith("/api/")) {
        const currentTime = Math.floor(Date.now() / 1000)
        const ipData = ipRequestCounts.get(ip)

        if (!ipData || currentTime > ipData.resetTime) {
            // First request or window expired
            ipRequestCounts.set(ip, {
                count: 1,
                resetTime: currentTime + RATE_LIMIT_WINDOW,
            })
        } else {
            // Increment count
            ipData.count++

            if (ipData.count > RATE_LIMIT_MAX_REQUESTS) {
                return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        "Retry-After": RATE_LIMIT_WINDOW.toString(),
                    },
                })
            }
        }
    }

    // ─── 2. Generate Nonce for CSP ─────────────────────────────────────────────
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64")

    // ─── 3. Define CSP Directives ──────────────────────────────────────────────
    const cspDirectives = [
        // Default policy: self-only
        "default-src 'self'",

        // Scripts: self + nonce for inline scripts + strict-dynamic
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'`,

        // Styles: self + inline (required for Next.js CSS-in-JS and Tailwind)
        "style-src 'self' 'unsafe-inline'",

        // Images: self + data URIs + Supabase storage + common CDNs
        "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://images.unsplash.com https://*.cloudinary.com https://*.amazonaws.com",

        // Fonts: self + Google Fonts
        "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",

        // Connect: self + Supabase + analytics
        "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co",

        // Frame ancestors: none (prevent clickjacking)
        "frame-ancestors 'none'",

        // Form actions: self only
        "form-action 'self'",

        // Base URI: self only
        "base-uri 'self'",

        // Object/embed: none (no Flash/Java)
        "object-src 'none'",

        // Frames: self + Supabase (for OAuth)
        "frame-src 'self' https://*.supabase.co",

        // Upgrade insecure requests in production
        ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
    ]

    // ─── 4. Security Headers ───────────────────────────────────────────────────
    const securityHeaders: Record<string, string> = {
        // Content Security Policy
        "Content-Security-Policy": cspDirectives.join("; "),

        // Prevent MIME sniffing
        "X-Content-Type-Options": "nosniff",

        // Clickjacking protection
        "X-Frame-Options": "DENY",

        // XSS protection (legacy browsers)
        "X-XSS-Protection": "1; mode=block",

        // Referrer policy
        "Referrer-Policy": "strict-origin-when-cross-origin",

        // Permissions policy (formerly Feature-Policy)
        "Permissions-Policy": [
            "camera=()",
            "microphone=()",
            "geolocation=()",
            "payment=()",
            "usb=()",
            "accelerometer=()",
            "gyroscope=()",
            "magnetometer=()",
        ].join(", "),

        // Nonce for inline scripts (accessible via headers())
        "X-Nonce": nonce,
    }

    // HSTS - Only enable in production (hard to revert!)
    if (process.env.NODE_ENV === "production") {
        securityHeaders["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    }

    // ─── 5. Apply Headers to Response ──────────────────────────────────────────
    for (const [key, value] of Object.entries(securityHeaders)) {
        response.headers.set(key, value)
    }

    // ─── 6. CSRF Protection for Mutations ──────────────────────────────────────
    const mutationMethods = ["POST", "PUT", "DELETE", "PATCH"]
    if (mutationMethods.includes(request.method)) {
        const contentType = request.headers.get("content-type") ?? ""
        const origin = request.headers.get("origin")
        const host = request.headers.get("host")

        // Only check if origin exists (browser requests)
        if (origin && host && !origin.includes(host)) {
            return new NextResponse(JSON.stringify({ error: "Invalid origin" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            })
        }
    }

    return response
}

// ─── Route Matcher Configuration ─────────────────────────────────────────────
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        {
            source: "/((?!_next/static|_next/image|favicon.ico|public/).*)",
            missing: [
                { type: "header", key: "next-router-prefetch" },
                { type: "header", key: "purpose", value: "prefetch" },
            ],
        },
    ],
}
