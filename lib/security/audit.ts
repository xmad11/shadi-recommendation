/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUDIT LOGGING SYSTEM
 *
 * Centralized audit logging for security-sensitive operations.
 * Tracks all data modifications, authentication events, and admin actions.
 *
 * Usage:
 *   import { auditLog } from '@/lib/security/audit'
 *   await auditLog.userAction('profile_update', userId, { field: 'email' })
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuditAction =
    // Authentication events
    | "auth_login"
    | "auth_logout"
    | "auth_signup"
    | "auth_password_reset"
    | "auth_password_change"
    | "auth_failed_login"
    // User actions
    | "profile_view"
    | "profile_update"
    | "profile_delete"
    // Data modifications
    | "data_create"
    | "data_update"
    | "data_delete"
    | "data_export"
    // Admin actions
    | "admin_role_change"
    | "admin_user_delete"
    | "admin_settings_update"
    | "admin_impersonation"
    // Security events
    | "security_rate_limit"
    | "security_csrf_blocked"
    | "security_unauthorized"
    | "security_suspicious"

export type AuditSeverity = "info" | "warning" | "error" | "critical"

export interface AuditLogEntry {
    id?: string
    timestamp: string
    action: AuditAction
    severity: AuditSeverity
    user_id: string | null
    target_id?: string | null
    target_type?: string | null
    ip_address: string | null
    user_agent: string | null
    metadata: Record<string, unknown>
    success: boolean
    error_message?: string | null
}

// ─── Severity Mapping ────────────────────────────────────────────────────────

const ACTION_SEVERITY: Record<AuditAction, AuditSeverity> = {
    // Authentication
    auth_login: "info",
    auth_logout: "info",
    auth_signup: "info",
    auth_password_reset: "warning",
    auth_password_change: "warning",
    auth_failed_login: "warning",
    // User actions
    profile_view: "info",
    profile_update: "info",
    profile_delete: "warning",
    // Data modifications
    data_create: "info",
    data_update: "info",
    data_delete: "warning",
    data_export: "warning",
    // Admin actions
    admin_role_change: "critical",
    admin_user_delete: "critical",
    admin_settings_update: "warning",
    admin_impersonation: "critical",
    // Security events
    security_rate_limit: "warning",
    security_csrf_blocked: "error",
    security_unauthorized: "error",
    security_suspicious: "critical",
}

// ─── Helper Functions ────────────────────────────────────────────────────────

async function getRequestContext(): Promise<{
    ip: string | null
    userAgent: string | null
}> {
    try {
        const headersList = await headers()
        return {
            ip: headersList.get("x-forwarded-for")?.split(",")[0] ?? headersList.get("x-real-ip"),
            userAgent: headersList.get("user-agent"),
        }
    } catch {
        // Headers not available (e.g., not in request context)
        return { ip: null, userAgent: null }
    }
}

// ─── Audit Logger Class ──────────────────────────────────────────────────────

class AuditLogger {
    private buffer: AuditLogEntry[] = []
    private flushTimeout: NodeJS.Timeout | null = null
    private readonly BUFFER_SIZE = 10
    private readonly FLUSH_INTERVAL = 5000 // 5 seconds

    /**
     * Log a user action
     */
    async userAction(
        action: AuditAction,
        userId: string | null,
        metadata: Record<string, unknown> = {},
        success = true,
        errorMessage?: string
    ): Promise<void> {
        const context = await getRequestContext()

        const entry: AuditLogEntry = {
            timestamp: new Date().toISOString(),
            action,
            severity: ACTION_SEVERITY[action],
            user_id: userId,
            ip_address: context.ip,
            user_agent: context.userAgent,
            metadata,
            success,
            error_message: errorMessage,
        }

        await this.log(entry)
    }

    /**
     * Log a data modification
     */
    async dataModification(
        action: "data_create" | "data_update" | "data_delete",
        userId: string | null,
        targetType: string,
        targetId: string,
        changes: Record<string, unknown> = {},
        success = true
    ): Promise<void> {
        const context = await getRequestContext()

        const entry: AuditLogEntry = {
            timestamp: new Date().toISOString(),
            action,
            severity: ACTION_SEVERITY[action],
            user_id: userId,
            target_type: targetType,
            target_id: targetId,
            ip_address: context.ip,
            user_agent: context.userAgent,
            metadata: { changes },
            success,
        }

        await this.log(entry)
    }

    /**
     * Log an admin action
     */
    async adminAction(
        action: AuditAction,
        adminUserId: string,
        targetUserId: string | null,
        metadata: Record<string, unknown> = {}
    ): Promise<void> {
        const context = await getRequestContext()

        const entry: AuditLogEntry = {
            timestamp: new Date().toISOString(),
            action,
            severity: ACTION_SEVERITY[action],
            user_id: adminUserId,
            target_id: targetUserId,
            target_type: "user",
            ip_address: context.ip,
            user_agent: context.userAgent,
            metadata: {
                ...metadata,
                admin_action: true,
            },
            success: true,
        }

        await this.log(entry)
    }

    /**
     * Log a security event
     */
    async securityEvent(
        action: AuditAction,
        metadata: Record<string, unknown> = {},
        userId?: string | null
    ): Promise<void> {
        const context = await getRequestContext()

        const entry: AuditLogEntry = {
            timestamp: new Date().toISOString(),
            action,
            severity: ACTION_SEVERITY[action],
            user_id: userId ?? null,
            ip_address: context.ip,
            user_agent: context.userAgent,
            metadata,
            success: false,
        }

        await this.log(entry)
    }

    /**
     * Internal log method with buffering
     */
    private async log(entry: AuditLogEntry): Promise<void> {
        // For critical events, log immediately
        if (entry.severity === "critical") {
            await this.writeToDatabase([entry])
            return
        }

        // Buffer non-critical events
        this.buffer.push(entry)

        // Flush if buffer is full
        if (this.buffer.length >= this.BUFFER_SIZE) {
            await this.flush()
            return
        }

        // Set up delayed flush
        if (!this.flushTimeout) {
            this.flushTimeout = setTimeout(() => this.flush(), this.FLUSH_INTERVAL)
        }
    }

    /**
     * Flush buffered logs to database
     */
    async flush(): Promise<void> {
        if (this.flushTimeout) {
            clearTimeout(this.flushTimeout)
            this.flushTimeout = null
        }

        if (this.buffer.length === 0) return

        const entries = [...this.buffer]
        this.buffer = []

        await this.writeToDatabase(entries)
    }

    /**
     * Write entries to database
     */
    private async writeToDatabase(entries: AuditLogEntry[]): Promise<void> {
        try {
            const supabase = await createClient()

            const { error } = await supabase.from("audit_logs").insert(
                entries.map((entry) => ({
                    ...entry,
                    metadata: JSON.stringify(entry.metadata),
                }))
            )

            if (error) {
                // Fallback: log to console in development
                if (process.env.NODE_ENV === "development") {
                    console.error("[Audit] Failed to write to database:", error.message)
                    for (const entry of entries) {
                        console.log("[Audit]", JSON.stringify(entry))
                    }
                }
            }
        } catch (err) {
            // Ensure audit logging never breaks the application
            if (process.env.NODE_ENV === "development") {
                console.error("[Audit] Exception:", err)
            }
        }
    }
}

// ─── Export Singleton ────────────────────────────────────────────────────────

export const auditLog = new AuditLogger()

// ─── SQL Migration for audit_logs table ──────────────────────────────────────

/**
 * Run this SQL in Supabase SQL Editor to create the audit_logs table:
 *
 * ```sql
 * CREATE TABLE IF NOT EXISTS audit_logs (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *   action TEXT NOT NULL,
 *   severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
 *   user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
 *   target_id TEXT,
 *   target_type TEXT,
 *   ip_address INET,
 *   user_agent TEXT,
 *   metadata JSONB DEFAULT '{}',
 *   success BOOLEAN NOT NULL DEFAULT TRUE,
 *   error_message TEXT,
 *   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
 * );
 *
 * -- Index for efficient querying
 * CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
 * CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
 * CREATE INDEX idx_audit_logs_action ON audit_logs(action);
 * CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
 *
 * -- Enable RLS
 * ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
 *
 * -- Only admins can read audit logs
 * CREATE POLICY "Admins can read audit logs"
 *   ON audit_logs FOR SELECT
 *   TO authenticated
 *   USING (
 *     EXISTS (
 *       SELECT 1 FROM profiles
 *       WHERE profiles.id = auth.uid()
 *       AND profiles.role = 'admin'
 *     )
 *   );
 *
 * -- Service role can insert (from server-side only)
 * CREATE POLICY "Service can insert audit logs"
 *   ON audit_logs FOR INSERT
 *   TO authenticated
 *   WITH CHECK (TRUE);
 *
 * -- Prevent updates and deletes (audit logs are immutable)
 * -- No UPDATE or DELETE policies = no modifications allowed
 *
 * -- Retention: Auto-delete logs older than 90 days (optional)
 * CREATE OR REPLACE FUNCTION delete_old_audit_logs()
 * RETURNS void AS $$
 * BEGIN
 *   DELETE FROM audit_logs WHERE timestamp < NOW() - INTERVAL '90 days';
 * END;
 * $$ LANGUAGE plpgsql;
 *
 * -- Schedule cleanup (requires pg_cron extension)
 * -- SELECT cron.schedule('cleanup-audit-logs', '0 0 * * *', 'SELECT delete_old_audit_logs()');
 * ```
 */
