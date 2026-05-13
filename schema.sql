-- Fashion Intelligence OS: Core Schema

-- 1. Users & Auth
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- user, admin, worker
    subscription TEXT DEFAULT 'free',
    credits INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Fashion Generations (Core Generation Log)
CREATE TABLE IF NOT EXISTS fashion_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    model TEXT NOT NULL, -- qwen, sdxl, flux
    lora JSONB, -- Array of lora names/weights
    status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    output_path TEXT,
    thumbnail_path TEXT,
    generation_time INTEGER, -- in milliseconds
    gpu_worker TEXT,
    seed BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Fashion Memory (User Taste & History)
CREATE TABLE IF NOT EXISTS fashion_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    memory_type TEXT NOT NULL, -- aesthetic, style_pref, outfit_history
    content TEXT NOT NULL,
    embedding_id UUID, -- Reference to Qdrant vector
    score FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Fashion Trends (Analytics & Intelligence)
CREATE TABLE IF NOT EXISTS fashion_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trend_name TEXT NOT NULL,
    trend_score INTEGER DEFAULT 0,
    velocity FLOAT DEFAULT 0.0,
    momentum FLOAT DEFAULT 0.0,
    season TEXT,
    region TEXT, -- Global, Paris, Seoul, etc.
    silhouette_map JSONB, -- Hot silhouettes distribution
    color_palette JSONB, -- Dominant hex codes
    metadata JSONB, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Fashion Assets (Product & Image Library)
CREATE TABLE IF NOT EXISTS fashion_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_path TEXT NOT NULL,
    brand TEXT,
    style TEXT,
    category TEXT,
    silhouette TEXT,
    garment_type TEXT,
    fabric TEXT[],
    tailoring TEXT,
    palette JSONB, -- Dominant colors
    lighting TEXT, -- cinematic, editorial, studio
    composition TEXT, -- framing, pacing
    season TEXT,
    colors TEXT[],
    color_palette JSONB,
    embedding_id UUID,
    
    -- Intelligence Scoring
    trend_score FLOAT DEFAULT 0,
    luxury_score FLOAT DEFAULT 0.0,
    editorial_score FLOAT DEFAULT 0.0,
    runway_score FLOAT DEFAULT 0.0,
    composition_score FLOAT DEFAULT 0.0,
    silhouette_score FLOAT DEFAULT 0.0,
    aesthetic_score FLOAT DEFAULT 0.0,
    fashion_density FLOAT DEFAULT 0.0,
    training_value FLOAT DEFAULT 0.0,
    
    dataset_tier INTEGER DEFAULT 1, -- 1: Runway, 2: Campaign, 3: Editorial, 4: Street
    dataset_source TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Runway & Editorial Structural Metadata
CREATE TABLE IF NOT EXISTS runway_metadata (
    id SERIAL PRIMARY KEY,
    asset_id UUID REFERENCES fashion_assets(id),
    designer TEXT,
    look_number INTEGER,
    collection_name TEXT, -- e.g., "Ready-to-Wear", "Haute Couture"
    city TEXT, -- Paris, Milan, etc.
    runway_pacing FLOAT, -- 0-1 score
    styling_structure JSONB, -- { "layers": 3, "accessorized": true }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS editorial_metadata (
    id SERIAL PRIMARY KEY,
    asset_id UUID REFERENCES fashion_assets(id),
    publication TEXT, -- Vogue, Dazed, i-D
    cinematic_score FLOAT,
    composition_type TEXT, -- editorial, campaign, lookbook
    framing_language TEXT, -- close-up, wide-angle, birds-eye
    mood_narrative TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Dataset Quality & Rejection Logs
CREATE TABLE IF NOT EXISTS dataset_quality_audits (
    id BIGSERIAL PRIMARY KEY,
    source_url TEXT,
    rejection_reason TEXT,
    luxury_score_failed FLOAT,
    aesthetic_score_failed FLOAT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Brand DNA (Semantic Archetypes)
CREATE TABLE IF NOT EXISTS brand_dna (
    brand_name TEXT PRIMARY KEY,
    archetype TEXT, -- e.g., "Minimalist Luxury", "Dark Avant-Garde"
    region TEXT, -- France, Italy, UK, etc.
    dna_metrics JSONB, -- { "tailoring": 0.9, "volume": 0.4, "contrast": 0.8 }
    visual_signature JSONB, -- { "lighting": "cinematic", "palette": ["#000000"] }
    associated_trends TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Trend Evolution (Graph Support in SQL)
ALTER TABLE fashion_trends ADD COLUMN IF NOT EXISTS parent_trend_id UUID REFERENCES fashion_trends(id);
ALTER TABLE fashion_trends ADD COLUMN IF NOT EXISTS lifecycle_phase TEXT DEFAULT 'emerging'; -- emerging, peak, maturing, declining

-- 12. Outfit Compatibility Logic
CREATE TABLE IF NOT EXISTS outfit_compatibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_a_style TEXT,
    item_b_style TEXT,
    compatibility_score FLOAT,
    reasoning TEXT, -- AI-generated reason for match/conflict
    seasonal_alignment TEXT
);

-- 6. Runtime Telemetry (Neural Stats)
CREATE TABLE IF NOT EXISTS runtime_telemetry (
    id BIGSERIAL PRIMARY KEY,
    module_name TEXT NOT NULL, -- Ollama, SDXL, PostgreSQL, Qdrant
    metric_key TEXT NOT NULL, -- latency, throughput, vram, tokens_per_sec
    metric_value FLOAT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Fashion Knowledge Graph (Relational Storage for Neo4j Sync)
-- This acts as a staging/audit log for the graph database
CREATE TABLE IF NOT EXISTS knowledge_graph_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_node_type TEXT NOT NULL, -- Brand, Style, Material
    source_node_id TEXT NOT NULL,
    target_node_type TEXT NOT NULL,
    target_node_id TEXT NOT NULL,
    relationship_type TEXT NOT NULL, -- BELONGS_TO, EVOLVES_INTO, ASSOCIATED_WITH
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Runtime Workers (Monitoring)
CREATE TABLE IF NOT EXISTS runtime_workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_name TEXT NOT NULL,
    gpu_id TEXT,
    status TEXT NOT NULL DEFAULT 'offline', -- active, busy, offline
    vram_usage INTEGER, -- in MB
    current_job UUID REFERENCES fashion_generations(id),
    heartbeat_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Dataset Crawlers & HD Hydration
CREATE TABLE IF NOT EXISTS dataset_crawlers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name TEXT NOT NULL,
    source_tier INTEGER DEFAULT 1, -- 1: Runway, 2: Campaign, 3: Editorial, 4: Street
    status TEXT DEFAULT 'idle', -- idle, crawling, hydrating, error
    last_run_at TIMESTAMP WITH TIME ZONE,
    assets_collected INTEGER DEFAULT 0,
    quality_threshold FLOAT DEFAULT 0.9,
    stealth_mode BOOLEAN DEFAULT TRUE,
    proxy_required BOOLEAN DEFAULT TRUE,
    config JSONB, -- Selector rules, hydration patterns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crawler_hydration_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL,
    pattern_type TEXT NOT NULL, -- srcset, json_payload, data_attribute
    rule_config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS injection_proxy_pool (
    id SERIAL PRIMARY KEY,
    proxy_url TEXT NOT NULL,
    region TEXT,
    success_rate FLOAT DEFAULT 1.0,
    latency_ms INTEGER,
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active'
);

-- 9. Agent Registry & Tasks (Intelligence Control)
CREATE TABLE IF NOT EXISTS agent_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL, -- Fashion Architect, Trend Analyst
    agent_role TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    capabilities TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agent_registry(id),
    task_type TEXT NOT NULL,
    payload JSONB,
    status TEXT DEFAULT 'pending', -- pending, running, completed, failed
    result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Registry
CREATE TABLE IF NOT EXISTS system_registry (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
