-- Post-Audit Protocol Database Schema
-- Supports A/B testing, bug tracking, task management, and infrastructure monitoring

-- A/B Test Configuration
CREATE TABLE IF NOT EXISTS ab_test_config (
    id TEXT PRIMARY KEY,
    active_variant TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A/B Test Results
CREATE TABLE IF NOT EXISTS invites_ab_test (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant TEXT NOT NULL,
    conversion_rate DECIMAL(5, 4) NOT NULL,
    total_sent INTEGER NOT NULL,
    total_converted INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Infrastructure Configuration
CREATE TABLE IF NOT EXISTS infrastructure_config (
    id TEXT PRIMARY KEY,
    sms_per_day INTEGER NOT NULL,
    whatsapp_per_day INTEGER NOT NULL,
    total_invites_per_day INTEGER NOT NULL,
    n8n_batch_size INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invites Sent Log
CREATE TABLE IF NOT EXISTS invites_sent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id TEXT,
    variant TEXT,
    channel TEXT, -- 'sms' or 'whatsapp'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bugs Tracking
CREATE TABLE IF NOT EXISTS bugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
    user_impact TEXT NOT NULL, -- 'all_users', 'paying_users', 'top_100', 'new_users'
    priority_score INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'reported', -- 'reported', 'triaged', 'in_progress', 'fixed', 'verified', 'closed'
    reported_by TEXT,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_to TEXT,
    fix_description TEXT,
    fixed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhancement Tasks
CREATE TABLE IF NOT EXISTS enhancement_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    estimated_hours INTEGER,
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completion_notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invites_ab_test_created_at ON invites_ab_test(created_at);
CREATE INDEX IF NOT EXISTS idx_invites_ab_test_variant ON invites_ab_test(variant);
CREATE INDEX IF NOT EXISTS idx_invites_sent_sent_at ON invites_sent(sent_at);
CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status);
CREATE INDEX IF NOT EXISTS idx_bugs_priority_score ON bugs(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_enhancement_tasks_status ON enhancement_tasks(status);
CREATE INDEX IF NOT EXISTS idx_enhancement_tasks_priority ON enhancement_tasks(priority);

-- Initialize default config
INSERT INTO ab_test_config (id, active_variant) 
VALUES ('invite_message', 'variant_a')
ON CONFLICT (id) DO NOTHING;

INSERT INTO infrastructure_config (id, sms_per_day, whatsapp_per_day, total_invites_per_day, n8n_batch_size)
VALUES ('invite_capacity', 20000, 20000, 40000, 500)
ON CONFLICT (id) DO NOTHING;

-- Real-time subscriptions (for Supabase Realtime)
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhancement_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites_ab_test ENABLE ROW LEVEL SECURITY;

-- Views for admin dashboard
CREATE OR REPLACE VIEW pending_tasks_count AS
SELECT COUNT(*) as count
FROM enhancement_tasks
WHERE status = 'pending';

CREATE OR REPLACE VIEW priority_bugs_view AS
SELECT *
FROM bugs
WHERE status IN ('reported', 'triaged')
ORDER BY priority_score DESC
LIMIT 10;

CREATE OR REPLACE VIEW ab_test_summary AS
SELECT 
    variant,
    SUM(total_sent) as total_sent,
    SUM(total_converted) as total_converted,
    CASE 
        WHEN SUM(total_sent) > 0 THEN SUM(total_converted)::DECIMAL / SUM(total_sent)
        ELSE 0
    END as conversion_rate
FROM invites_ab_test
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY variant;

