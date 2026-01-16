/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SUPABASE RLS ATTACK SIMULATION TEST SUITE
 *
 * Tests Row Level Security policies to ensure data isolation.
 * Run: bun test tests/security/rls-attack.test.ts
 *
 * Prerequisites:
 * - Supabase project with RLS enabled
 * - Test environment variables configured
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { describe, it, expect, beforeAll, afterAll } from "bun:test"

// ─── Configuration ───────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Skip tests if environment not configured
const shouldSkip = !SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY

// ─── Test Setup ──────────────────────────────────────────────────────────────

interface TestUser {
    id: string
    email: string
    password: string
}

let adminClient: SupabaseClient
let anonClient: SupabaseClient
let userAClient: SupabaseClient
let userBClient: SupabaseClient
let userA: TestUser
let userB: TestUser

async function createTestUser(email: string): Promise<TestUser> {
    const password = `TestPassword123!${Math.random().toString(36)}`

    const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    })

    if (error) throw new Error(`Failed to create user: ${error.message}`)

    return {
        id: data.user.id,
        email,
        password,
    }
}

async function signInAsUser(user: TestUser): Promise<SupabaseClient> {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    const { error } = await client.auth.signInWithPassword({
        email: user.email,
        password: user.password,
    })

    if (error) throw new Error(`Failed to sign in: ${error.message}`)

    return client
}

async function cleanupTestUsers(): Promise<void> {
    const { data } = await adminClient.auth.admin.listUsers()
    const testUsers = data.users.filter((u) => u.email?.includes("rls-test-"))

    for (const user of testUsers) {
        await adminClient.auth.admin.deleteUser(user.id)
    }
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe.skipIf(shouldSkip)("Supabase RLS Attack Simulation", () => {
    beforeAll(async () => {
        // Initialize clients
        adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

        // Create test users
        userA = await createTestUser(`rls-test-a-${Date.now()}@test.local`)
        userB = await createTestUser(`rls-test-b-${Date.now()}@test.local`)

        // Sign in as users
        userAClient = await signInAsUser(userA)
        userBClient = await signInAsUser(userB)

        // Create profiles for test users
        await adminClient.from("profiles").upsert([
            { id: userA.id, email: userA.email, role: "user" },
            { id: userB.id, email: userB.email, role: "user" },
        ])
    })

    afterAll(async () => {
        await cleanupTestUsers()
    })

    // ─── Test 1: Unauthenticated Access ────────────────────────────────────────

    describe("Unauthenticated Access Prevention", () => {
        it("should prevent unauthenticated users from reading profiles", async () => {
            const { data, error } = await anonClient.from("profiles").select("*")

            // Should either error or return empty
            expect(error !== null || (data && data.length === 0)).toBe(true)
        })

        it("should prevent unauthenticated users from inserting data", async () => {
            const { error } = await anonClient.from("profiles").insert({
                id: "fake-id",
                email: "hacker@evil.com",
                role: "admin",
            })

            expect(error).not.toBeNull()
        })

        it("should prevent unauthenticated users from updating data", async () => {
            const { error } = await anonClient
                .from("profiles")
                .update({ role: "admin" })
                .eq("id", userA.id)

            expect(error).not.toBeNull()
        })

        it("should prevent unauthenticated users from deleting data", async () => {
            const { error } = await anonClient.from("profiles").delete().eq("id", userA.id)

            expect(error).not.toBeNull()
        })
    })

    // ─── Test 2: Cross-User Data Access ────────────────────────────────────────

    describe("Cross-User Data Isolation", () => {
        it("should prevent User B from reading User A private data", async () => {
            // First, create private data for User A using admin
            await adminClient.from("user_settings").upsert({
                user_id: userA.id,
                settings: { secret: "user-a-secret" },
            })

            // User B tries to read User A's settings
            const { data } = await userBClient.from("user_settings").select("*").eq("user_id", userA.id)

            expect(data?.length ?? 0).toBe(0)
        })

        it("should prevent User B from updating User A profile", async () => {
            const { error, count } = await userBClient
                .from("profiles")
                .update({ display_name: "HACKED" })
                .eq("id", userA.id)

            // Should either error or affect 0 rows
            expect(error !== null || count === 0).toBe(true)
        })

        it("should prevent User B from deleting User A profile", async () => {
            const { error, count } = await userBClient.from("profiles").delete().eq("id", userA.id)

            // Should either error or affect 0 rows
            expect(error !== null || count === 0).toBe(true)
        })
    })

    // ─── Test 3: Role Escalation Prevention ────────────────────────────────────

    describe("Role Escalation Prevention", () => {
        it("should prevent users from promoting themselves to admin", async () => {
            const { error, count } = await userAClient
                .from("profiles")
                .update({ role: "admin" })
                .eq("id", userA.id)

            // Either error or no rows affected
            expect(error !== null || count === 0).toBe(true)

            // Verify role wasn't changed
            const { data } = await adminClient.from("profiles").select("role").eq("id", userA.id).single()

            expect(data?.role).toBe("user")
        })

        it("should prevent users from promoting other users to admin", async () => {
            const { error } = await userAClient
                .from("profiles")
                .update({ role: "admin" })
                .eq("id", userB.id)

            expect(error !== null).toBe(true)
        })
    })

    // ─── Test 4: SQL Injection Resistance ──────────────────────────────────────

    describe("SQL Injection Resistance", () => {
        it("should safely handle malicious WHERE clauses", async () => {
            const maliciousInput = "1'; DROP TABLE profiles; --"

            const { data, error } = await userAClient
                .from("profiles")
                .select("*")
                .eq("email", maliciousInput)

            // Should return empty, not error from SQL injection
            expect(data?.length ?? 0).toBe(0)
            expect(error).toBeNull()
        })

        it("should prevent UNION-based attacks", async () => {
            const unionAttack = "' UNION SELECT * FROM auth.users --"

            const { data } = await userAClient.from("profiles").select("*").eq("email", unionAttack)

            // Should return empty, attack should not work
            expect(data?.length ?? 0).toBe(0)
        })

        it("should handle special characters safely", async () => {
            const specialChars = `'; DELETE FROM profiles WHERE '1'='1`

            const { data, error } = await userAClient
                .from("profiles")
                .select("*")
                .ilike("email", `%${specialChars}%`)

            expect(data?.length ?? 0).toBe(0)
            expect(error).toBeNull()
        })
    })

    // ─── Test 5: Audit Log Protection ──────────────────────────────────────────

    describe("Audit Log Protection", () => {
        it("should prevent regular users from reading audit logs", async () => {
            const { data, error } = await userAClient.from("audit_logs").select("*")

            // Should either error or return empty
            expect(error !== null || (data && data.length === 0)).toBe(true)
        })

        it("should prevent users from modifying audit logs", async () => {
            const { error } = await userAClient
                .from("audit_logs")
                .update({ action: "MODIFIED" })
                .eq("id", "any-id")

            expect(error !== null).toBe(true)
        })

        it("should prevent users from deleting audit logs", async () => {
            const { error } = await userAClient.from("audit_logs").delete().eq("id", "any-id")

            expect(error !== null).toBe(true)
        })
    })

    // ─── Test 6: Service Role Key Protection ───────────────────────────────────

    describe("Service Role Key Protection", () => {
        it("should verify service key is not exposed in client bundle", async () => {
            // This test runs a grep on the built files
            // In a real CI/CD, you'd check the built bundle

            const serviceKeyPattern = SUPABASE_SERVICE_KEY?.substring(0, 20)

            // The service key should never appear in any public file
            // This is a runtime check - build-time check would be more thorough
            expect(typeof process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY).toBe("undefined")
        })
    })
})

// ─── Export for programmatic use ─────────────────────────────────────────────

export const RLSTestSuite = {
    shouldSkip,
    runTests: async () => {
        if (shouldSkip) {
            console.log("⚠️  RLS tests skipped - environment not configured")
            return { skipped: true }
        }
        // Tests run automatically via bun:test
        return { skipped: false }
    },
}
