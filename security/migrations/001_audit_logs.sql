-- ═══════════════════════════════════════════════════════════════════════════════
-- AUDIT LOGS TABLE MIGRATION
-- 
-- Run this SQL in Supabase SQL Editor to create the audit logging system.
-- This is required for the audit logging feature to work.
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Create the audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_id TEXT,
    target_type TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);

-- 3. Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
    ON audit_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 5. Authenticated users can insert audit logs (from server-side)
CREATE POLICY "Authenticated users can insert audit logs"
    ON audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (TRUE);

-- 6. Prevent updates (audit logs are immutable)
-- No UPDATE policy = no modifications allowed

-- 7. Prevent deletes (except by retention policy)
-- No DELETE policy = no deletions by users

-- 8. Function to delete old audit logs (retention policy)
CREATE OR REPLACE FUNCTION delete_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Optional: Schedule cleanup with pg_cron (if available)
-- Uncomment if pg_cron extension is enabled:
-- SELECT cron.schedule(
--     'cleanup-audit-logs',
--     '0 0 * * *',  -- Daily at midnight
--     'SELECT delete_old_audit_logs();'
-- );

-- 10. Grant service role full access for server-side operations
GRANT ALL ON audit_logs TO service_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- Run these to verify the setup is correct
-- ═══════════════════════════════════════════════════════════════════════════════

-- Check table exists
-- SELECT * FROM information_schema.tables WHERE table_name = 'audit_logs';

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'audit_logs';

-- Check policies
-- SELECT * FROM pg_policies WHERE tablename = 'audit_logs';

-- Check indexes
-- SELECT indexname FROM pg_indexes WHERE tablename = 'audit_logs';
