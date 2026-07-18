-- ============================================================
-- SportHub Connect - PostgreSQL Schema Initialization
-- ============================================================
-- This script creates all schemas for the bounded contexts.
-- Each module has its own schema for logical isolation.
-- ============================================================

-- ============================================================
-- Schemas
-- ============================================================
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS community;
CREATE SCHEMA IF NOT EXISTS events;
CREATE SCHEMA IF NOT EXISTS gamification;
CREATE SCHEMA IF NOT EXISTS economy;
CREATE SCHEMA IF NOT EXISTS payments;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS integrations;
CREATE SCHEMA IF NOT EXISTS audit;

-- ============================================================
-- Audit Schema Tables (cross-cutting)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit.outbox_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    occurred_on TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_on TIMESTAMPTZ,
    error TEXT,
    retry_count INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_outbox_processed
    ON audit.outbox_messages (processed_on)
    WHERE processed_on IS NULL;

CREATE TABLE IF NOT EXISTS audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created
    ON audit.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
    ON audit.audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user
    ON audit.audit_logs (user_id);

-- ============================================================
-- Identity Schema
-- ============================================================
CREATE TABLE IF NOT EXISTS identity.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth0_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(320) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    date_of_birth DATE,
    bio TEXT,
    phone VARCHAR(30),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON identity.users (email);
CREATE INDEX IF NOT EXISTS idx_users_auth0 ON identity.users (auth0_id);

CREATE TABLE IF NOT EXISTS identity.sport_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    sport VARCHAR(50) NOT NULL,
    skill_level VARCHAR(20) NOT NULL DEFAULT 'beginner',
    position VARCHAR(50),
    years_experience INT DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, sport)
);

CREATE INDEX IF NOT EXISTS idx_sport_profiles_user ON identity.sport_profiles (user_id);

CREATE TABLE IF NOT EXISTS identity.personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    sport VARCHAR(50) NOT NULL,
    record_type VARCHAR(50) NOT NULL,
    record_value DECIMAL NOT NULL,
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_personal_records_user ON identity.personal_records (user_id, sport);

-- ============================================================
-- Community Schema
-- ============================================================
CREATE TABLE IF NOT EXISTS community.communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_url TEXT,
    sport_type VARCHAR(50) NOT NULL,
    location_city VARCHAR(100),
    location_state VARCHAR(100),
    location_country VARCHAR(100) DEFAULT 'ES',
    is_public BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    max_members INT DEFAULT 500,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_communities_slug ON community.communities (slug);
CREATE INDEX IF NOT EXISTS idx_communities_sport ON community.communities (sport_type);

CREATE TABLE IF NOT EXISTS community.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES community.communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    left_at TIMESTAMPTZ,
    invited_by UUID,
    UNIQUE (community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON community.memberships (user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_community ON community.memberships (community_id);

CREATE TABLE IF NOT EXISTS community.sub_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES community.communities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_groups_community ON community.sub_groups (community_id);

CREATE TABLE IF NOT EXISTS community.sub_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_group_id UUID NOT NULL REFERENCES community.sub_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (sub_group_id, user_id)
);

-- ============================================================
-- Events Schema
-- ============================================================
CREATE TABLE IF NOT EXISTS events.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL DEFAULT 'match',
    location_name VARCHAR(300),
    location_address TEXT,
    location_lat DECIMAL(10,7),
    location_lng DECIMAL(10,7),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    registration_deadline TIMESTAMPTZ,
    max_participants INT,
    min_participants INT DEFAULT 2,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    visibility VARCHAR(20) NOT NULL DEFAULT 'community',
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_community ON events.events (community_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON events.events (start_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON events.events (status);

CREATE TABLE IF NOT EXISTS events.rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'going',
    responded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_rsvps_event ON events.rsvps (event_id);

CREATE TABLE IF NOT EXISTS events.check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    method VARCHAR(20) NOT NULL DEFAULT 'qr',
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    verified BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_check_ins_event ON events.check_ins (event_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user ON events.check_ins (user_id);

-- ============================================================
-- Gamification Schema
-- ============================================================
CREATE TABLE IF NOT EXISTS gamification.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    category VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) NOT NULL DEFAULT 'common',
    xp_reward INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gamification.badge_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_id UUID NOT NULL REFERENCES gamification.badges(id) ON DELETE CASCADE,
    rule_type VARCHAR(50) NOT NULL,
    rule_config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gamification.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    badge_id UUID NOT NULL REFERENCES gamification.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    context JSONB,
    UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON gamification.user_badges (user_id);

CREATE TABLE IF NOT EXISTS gamification.xp_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    community_id UUID NOT NULL,
    amount INT NOT NULL,
    source VARCHAR(100) NOT NULL,
    source_id UUID,
    description TEXT,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_records_user ON gamification.xp_records (user_id, community_id);
CREATE INDEX IF NOT EXISTS idx_xp_records_earned ON gamification.xp_records (earned_at);

CREATE TABLE IF NOT EXISTS gamification.levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    level_number INT UNIQUE NOT NULL,
    xp_required INT NOT NULL,
    icon_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gamification.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(50) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    rules JSONB NOT NULL DEFAULT '{}',
    reward_xp INT DEFAULT 0,
    reward_badge_id UUID REFERENCES gamification.badges(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenges_community ON gamification.challenges (community_id);

CREATE TABLE IF NOT EXISTS gamification.challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES gamification.challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    progress DECIMAL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    UNIQUE (challenge_id, user_id)
);

-- ============================================================
-- Economy Schema (Leaderboards & SportCoins)
-- ============================================================
CREATE TABLE IF NOT EXISTS economy.leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    leaderboard_type VARCHAR(50) NOT NULL DEFAULT 'xp',
    period VARCHAR(20) NOT NULL DEFAULT 'all_time',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_community ON economy.leaderboards (community_id);

CREATE TABLE IF NOT EXISTS economy.sport_coin_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    balance DECIMAL NOT NULL DEFAULT 0 CHECK (balance >= 0),
    lifetime_earned DECIMAL NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS economy.coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount DECIMAL NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    source VARCHAR(100) NOT NULL,
    source_id UUID,
    description TEXT,
    balance_after DECIMAL NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON economy.coin_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_date ON economy.coin_transactions (created_at);

-- ============================================================
-- Payments Schema
-- ============================================================
CREATE TABLE IF NOT EXISTS payments.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    community_id UUID NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'free',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON payments.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON payments.subscriptions (stripe_subscription_id);

CREATE TABLE IF NOT EXISTS payments.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES payments.subscriptions(id) ON DELETE CASCADE,
    stripe_invoice_id VARCHAR(255) UNIQUE,
    amount DECIMAL NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    invoice_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at TIMESTAMPTZ,
    pdf_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_invoices_subscription ON payments.invoices (subscription_id);

CREATE TABLE IF NOT EXISTS payments.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
    card_brand VARCHAR(20),
    card_last4 VARCHAR(4),
    card_exp_month INT,
    card_exp_year INT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payments.payment_methods (user_id);

-- ============================================================
-- Notifications Schema
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    data JSONB,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications.notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_date ON notifications.notifications (created_at);

CREATE TABLE IF NOT EXISTS notifications.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    push_enabled BOOLEAN NOT NULL DEFAULT true,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications.feed_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL,
    user_id UUID NOT NULL,
    feed_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    data JSONB,
    visibility VARCHAR(20) NOT NULL DEFAULT 'community',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feed_community ON notifications.feed_items (community_id, created_at DESC);

-- ============================================================
-- Integrations Schema
-- ============================================================
CREATE TABLE IF NOT EXISTS integrations.wearable_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    provider_user_id VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, provider)
);

CREATE TABLE IF NOT EXISTS integrations.wearable_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    connection_id UUID NOT NULL REFERENCES integrations.wearable_connections(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_activity_id VARCHAR(255) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    duration_seconds INT,
    distance_meters DECIMAL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    calories INT,
    raw_data JSONB,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider, provider_activity_id)
);

CREATE INDEX IF NOT EXISTS idx_wearable_activities_user ON integrations.wearable_activities (user_id, start_time);

CREATE TABLE IF NOT EXISTS integrations.benefit_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integrations.benefit_catalogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES integrations.benefit_partners(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    coin_cost INT NOT NULL,
    discount_percentage DECIMAL,
    discount_code VARCHAR(100),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ,
    max_redemptions INT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_benefit_catalogs_partner ON integrations.benefit_catalogs (partner_id);

CREATE TABLE IF NOT EXISTS integrations.benefit_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_id UUID NOT NULL REFERENCES integrations.benefit_catalogs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    coins_spent INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_benefit_redemptions_user ON integrations.benefit_redemptions (user_id);

-- ============================================================
-- Grant permissions
-- ============================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA identity TO sporthub;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA community TO sporthub;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA events TO sporthub;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA gamification TO sporthub;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA economy TO sporthub;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA payments TO sporthub;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA notifications TO sporthub;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA integrations TO sporthub;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO sporthub;

GRANT USAGE ON SCHEMA identity TO sporthub;
GRANT USAGE ON SCHEMA community TO sporthub;
GRANT USAGE ON SCHEMA events TO sporthub;
GRANT USAGE ON SCHEMA gamification TO sporthub;
GRANT USAGE ON SCHEMA economy TO sporthub;
GRANT USAGE ON SCHEMA payments TO sporthub;
GRANT USAGE ON SCHEMA notifications TO sporthub;
GRANT USAGE ON SCHEMA integrations TO sporthub;
GRANT USAGE ON SCHEMA audit TO sporthub;
