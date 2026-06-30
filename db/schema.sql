-- PostgreSQL Database Schema for StreamTest AI

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Role Types
CREATE TYPE user_role AS ENUM ('admin', 'qa_engineer', 'developer', 'viewer');

-- Platform Types
CREATE TYPE channel_platform AS ENUM ('youtube', 'facebook', 'instagram', 'twitch', 'tiktok', 'linkedin');

-- Stream Status
CREATE TYPE stream_status AS ENUM ('scheduled', 'streaming', 'completed', 'failed', 'retrying');

-- Test Status
CREATE TYPE test_status AS ENUM ('passed', 'failed', 'running', 'queued');

-- Subscription Plan Types
CREATE TYPE plan_type AS ENUM ('free_trial', 'standard', 'premium', 'pro');

-- Subscription Status
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'unpaid');

---------------------------------------------------------
-- 1. Users Table
---------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'qa_engineer',
    is_verified BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

---------------------------------------------------------
-- 2. Subscriptions Table
---------------------------------------------------------
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan plan_type NOT NULL DEFAULT 'free_trial',
    status subscription_status NOT NULL DEFAULT 'active',
    channel_limit INTEGER NOT NULL DEFAULT 1,
    storage_limit_gb DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    stream_limit_hours INTEGER NOT NULL DEFAULT 10,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

---------------------------------------------------------
-- 3. Billing History Table
---------------------------------------------------------
CREATE TABLE billing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL, -- 'paid', 'failed', 'refunded'
    invoice_pdf_url VARCHAR(512),
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_gateway VARCHAR(50) DEFAULT 'stripe', -- 'stripe', 'paypal', 'razorpay'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------
-- 4. Channel Integrations Table
---------------------------------------------------------
CREATE TABLE connected_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform channel_platform NOT NULL,
    channel_name VARCHAR(255) NOT NULL,
    external_channel_id VARCHAR(255) NOT NULL,
    oauth_access_token TEXT NOT NULL,
    oauth_refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    permission_scopes TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_platform_channel UNIQUE (user_id, platform, external_channel_id)
);

CREATE INDEX idx_connected_channels_user ON connected_channels(user_id);

---------------------------------------------------------
-- 5. Videos Table (Library Management)
---------------------------------------------------------
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    video_codec VARCHAR(50),
    audio_codec VARCHAR(50),
    resolution VARCHAR(20),
    storage_url VARCHAR(512) NOT NULL,
    status VARCHAR(50) DEFAULT 'ready', -- 'uploading', 'processing', 'ready', 'failed', 'corrupt'
    folder_path VARCHAR(255) DEFAULT '/', -- Supporting folder structure
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_videos_user_folder ON videos(user_id, folder_path);

---------------------------------------------------------
-- 6. Streams Table (Live Stream Engine Scheduling)
---------------------------------------------------------
CREATE TABLE streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    status stream_status DEFAULT 'scheduled',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    stream_bitrate_kbps INTEGER DEFAULT 4500,
    fps INTEGER DEFAULT 30,
    resolution VARCHAR(20) DEFAULT '1080p',
    ffmpeg_pid INTEGER,
    worker_node_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_streams_schedule ON streams(scheduled_start, status);

---------------------------------------------------------
-- 7. Stream Destinations Table (Multicasting mappings)
---------------------------------------------------------
CREATE TABLE stream_destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES connected_channels(id) ON DELETE CASCADE,
    rtmp_url VARCHAR(512) NOT NULL,
    stream_key VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'streaming', 'completed', 'failed'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------
-- 8. Test Cases & Suites Table
---------------------------------------------------------
CREATE TABLE test_suites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    test_type VARCHAR(100) NOT NULL, -- 'auth', 'billing', 'streaming', 'security', 'performance'
    target_module VARCHAR(100) NOT NULL,
    spec_json JSONB NOT NULL, -- Holds generated test case steps
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------
-- 9. Test Results Table
---------------------------------------------------------
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    suite_id UUID REFERENCES test_suites(id) ON DELETE CASCADE,
    triggered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status test_status NOT NULL,
    duration_ms INTEGER NOT NULL,
    success_rate DECIMAL(5,2),
    logs TEXT,
    error_summary TEXT,
    report_url VARCHAR(512),
    screenshot_urls TEXT[],
    metrics_json JSONB, -- Storing specific metrics like response times or CPU
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_test_results_suite ON test_results(suite_id);

---------------------------------------------------------
-- 10. Security Scans Table
---------------------------------------------------------
CREATE TABLE security_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    triggered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status test_status NOT NULL,
    vulnerabilities_found JSONB DEFAULT '[]', -- List of finding items
    risk_score DECIMAL(4,2) DEFAULT 0.00,
    owasp_categories_scanned VARCHAR(50)[],
    target_endpoint VARCHAR(512) NOT NULL,
    logs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------
-- 11. Infrastructure Metrics Table
---------------------------------------------------------
CREATE TABLE infrastructure_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id VARCHAR(100) NOT NULL,
    cpu_usage_percent DECIMAL(5,2) NOT NULL,
    ram_usage_percent DECIMAL(5,2) NOT NULL,
    storage_usage_percent DECIMAL(5,2) NOT NULL,
    redis_connected_clients INTEGER DEFAULT 0,
    redis_queue_length INTEGER DEFAULT 0,
    active_ffmpeg_workers INTEGER DEFAULT 0,
    network_in_mbps DECIMAL(10,2) DEFAULT 0.00,
    network_out_mbps DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_infra_metrics_time ON infrastructure_metrics(created_at DESC);

---------------------------------------------------------
-- 12. Automated Coupons & Campaigns (Admin Workflows)
---------------------------------------------------------
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
    discount_value DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    max_redemptions INTEGER DEFAULT 100,
    times_redeemed INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
