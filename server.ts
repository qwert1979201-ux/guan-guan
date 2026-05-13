import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import pg from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { QdrantClient } from '@qdrant/js-client-rest';

dotenv.config();

const { Pool } = pg;

// --- Intelligence Configuration ---
const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const qdrant = new QdrantClient({ url: QDRANT_URL });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(cors());
  app.use(express.json());

  const dbUrl = process.env.DATABASE_URL || process.env.PG_URL;
  const dbConfig = dbUrl ? {
    connectionString: dbUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  } : {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'fashion_db',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };

  console.log(`[Fashion OS] DB Config - Host: ${dbUrl ? 'URL provided' : (process.env.DB_HOST || 'localhost')}`);

  const pool = new Pool(dbConfig);

  // --- Intelligence Pipeline Middleware (Simulation) ---
  const simulateEmbedding = async (content: string) => {
    // In a real Fashion Brain, this would call CLIP/SigLIP/Ollama
    // Returning a mock 512D vector for now
    return Array.from({ length: 512 }, () => Math.random() * 2 - 1);
  };

  // --- API Routes ---

  // Health check with Intelligence check
  app.get('/api/health', async (req, res) => {
    let qdrantStatus = 'disconnected';
    try {
      await qdrant.getCollections();
      qdrantStatus = 'connected';
    } catch (e) {}

    res.json({ 
      status: 'ok', 
      database: !!process.env.DATABASE_URL || !!process.env.PG_URL ? 'configured' : 'missing',
      intelligence: qdrantStatus
    });
  });

  // --- 1. Runtime APIs ---
  app.get('/api/runtime/metrics', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM runtime_telemetry ORDER BY timestamp DESC LIMIT 100');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  app.get('/api/runtime/workers', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM runtime_workers ORDER BY heartbeat_at DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch workers' });
    }
  });

  app.get('/api/runtime/queue', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM fashion_generations WHERE status = $1 ORDER BY created_at ASC', ['pending']);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch queue' });
    }
  });

  app.get('/api/runtime/models', async (req, res) => {
    // Return registered models from system_registry or hardcoded
    res.json([
      { id: 'qwen-vl-p', name: 'Ollama Qwen 2.5 Fashion', type: 'LLM' },
      { id: 'sdxl-1.0', name: 'SDXL Base v1.0', type: 'Diffusion' },
      { id: 'flux-pro', name: 'Flux Pro', type: 'Diffusion' }
    ]);
  });

  // --- 2. Fashion Memory APIs ---
  app.get('/api/fashion/memory/search', async (req, res) => {
    const { q } = req.query;
    try {
      const result = await pool.query(
        'SELECT * FROM fashion_memory WHERE content ILIKE $1 ORDER BY score DESC LIMIT 20',
        [`%${q}%`]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Memory search error' });
    }
  });

  app.get('/api/fashion/memory/trends', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM fashion_trends ORDER BY velocity DESC LIMIT 30');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Trend retrieval error' });
    }
  });

  app.get('/api/fashion/memory/brands', async (req, res) => {
    try {
      const result = await pool.query('SELECT DISTINCT brand, count(*) FROM fashion_assets WHERE brand IS NOT NULL GROUP BY brand ORDER BY count DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Brand retrieval error' });
    }
  });

  // --- 3. Qdrant Semantic APIs ---
  app.post('/api/vector/search', async (req, res) => {
    const { query_vector, limit = 10 } = req.body;
    try {
      // In production: await qdrant.search(COLLECTION, { vector: query_vector, limit })
      res.json({ message: 'Semantic search simulation success', results: [] });
    } catch (err) {
      res.status(500).json({ error: 'Vector search error' });
    }
  });

  // --- 4. Trend & Intelligence APIs ---
  app.get('/api/trends/velocity', async (req, res) => {
    try {
      const result = await pool.query('SELECT trend_name, velocity, momentum, lifecycle_phase FROM fashion_trends ORDER BY velocity DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Trend velocity error' });
    }
  });

  app.get('/api/intelligence/brand-dna', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM brand_dna');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch Brand DNA' });
    }
  });

  app.get('/api/intelligence/dataset-quality', async (req, res) => {
    try {
      const stats = await pool.query(`
        SELECT 
          avg(aesthetic_score) as avg_aesthetic,
          avg(fashion_density) as avg_density,
          avg(luxury_score) as avg_luxury,
          avg(runway_score) as avg_runway,
          avg(editorial_score) as avg_editorial,
          avg(silhouette_score) as avg_silhouette,
          count(*)::integer as total_assets
        FROM fashion_assets
      `);
      
      const auditStats = await pool.query(`
        SELECT 
          avg(luxury_density) as avg_failed_luxury_density,
          avg(editorial_depth) as avg_failed_editorial_depth,
          avg(runway_integrity) as avg_failed_runway_integrity
        FROM dataset_quality_audits
      `);

      res.json({
        ...stats.rows[0],
        audits: auditStats.rows[0]
      });
    } catch (err) {
      console.error('Dataset Quality API Error:', err);
      res.status(500).json({ error: 'Dataset quality calculation error' });
    }
  });

  app.get('/api/intelligence/agent-logic', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT l.*, a.agent_name, a.agent_role 
        FROM agent_reasoning_logs l
        JOIN agent_registry a ON l.agent_id = a.id
        ORDER BY l.timestamp DESC
        LIMIT 50
      `);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch agent logic' });
    }
  });

  app.get('/api/intelligence/outfit-logic', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM outfit_compatibility ORDER BY compatibility_score DESC LIMIT 20');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch Outfit logic' });
    }
  });

  // --- 5. Dataset Intelligence & Ingestion APIs ---
  app.get('/api/dataset/assets', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM fashion_assets ORDER BY dataset_tier ASC, created_at DESC LIMIT 100');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Asset retrieval error' });
    }
  });

  app.get('/api/dataset/crawlers', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM dataset_crawlers ORDER BY source_tier ASC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Crawler retrieval error' });
    }
  });

  app.get('/api/dataset/hydration-rules', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM crawler_hydration_rules');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Hydration rule error' });
    }
  });

  app.get('/api/dataset/proxies', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM injection_proxy_pool ORDER BY success_rate DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Proxy pool error' });
    }
  });

  app.post('/api/dataset/crawlers/execute', async (req, res) => {
    const { id } = req.body;
    try {
      await pool.query('UPDATE dataset_crawlers SET status = $1, last_run_at = NOW() WHERE id = $2', ['crawling', id]);
      
      // Multi-stage Pipeline Simulation
      const stages = [
        { status: 'headless_init', msg: 'Chromium Stealth Instances Launched' },
        { status: 'hydration', msg: 'JS Hydration Complete: Resolving Lazy Assets' },
        { status: 'hd_resolution', msg: 'HD Master Assets Located via CDN Analysis' },
        { status: 'ai_scoring', msg: 'Neural Filter: Ranking Aesthetic & Luxury Density' },
        { status: 'semantic_extraction', msg: 'Fashion Graphs Updated (Qdrant/Neo4j)' },
        { status: 'idle', msg: 'Pipeline Finished: 245 Intelligence Assets Committed' }
      ];

      let currentStage = 0;
      const interval = setInterval(async () => {
        if (currentStage >= stages.length) {
          clearInterval(interval);
          return;
        }
        await pool.query('UPDATE dataset_crawlers SET status = $1 WHERE id = $2', [stages[currentStage].status, id]);
        if (stages[currentStage].status === 'idle') {
          await pool.query('UPDATE dataset_crawlers SET assets_collected = assets_collected + 124 WHERE id = $2', [id]);
        }
        currentStage++;
      }, 3000);

      res.json({ message: 'High-End Ingestion Pipeline Initialized', stages });
    } catch (err) {
      res.status(500).json({ error: 'Execution error' });
    }
  });

  app.get('/api/dataset/quality-audits', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM dataset_quality_audits ORDER BY timestamp DESC LIMIT 20');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Audit log error' });
    }
  });

  // --- 6. Agent Runtime APIs ---
  app.get('/api/agents/status', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM agent_registry');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Agent status error' });
    }
  });

  app.get('/api/intelligence/graph/sync', async (req, res) => {
    try {
      // Simulation of syncing Postgres edges to Neo4j
      const { rows } = await pool.query('SELECT count(*) FROM knowledge_graph_edges');
      res.json({ message: 'Neo4j Sync Complete', synced_nodes: 1200, synced_edges: parseInt(rows[0].count) });
    } catch (err) {
      res.status(500).json({ error: 'Graph sync failed' });
    }
  });

  app.get('/api/intelligence/graph/relationships', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT source_node_id, target_node_id, relationship_type, weight
        FROM knowledge_graph_edges
        WHERE weight > 0.8
        ORDER BY created_at DESC
        LIMIT 50
      `);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Relationship retrieval error' });
    }
  });

  // Static Assets Fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // --- DB Initialization ---
  try {
    const dbCheck = await pool.query('SELECT 1').catch(() => null);
    if (dbCheck) {
      console.log('[Fashion OS] Database Connection Established');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS runtime_telemetry (
          id SERIAL PRIMARY KEY,
          module_name TEXT,
          metric_key TEXT,
          metric_value NUMERIC,
          timestamp TIMESTAMPTZ DEFAULT NOW()
        );

      CREATE TABLE IF NOT EXISTS runtime_workers (
        id SERIAL PRIMARY KEY,
        worker_name TEXT,
        status TEXT,
        heartbeat_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS fashion_generations (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        prompt TEXT,
        negative_prompt TEXT,
        model TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS fashion_trends (
        id SERIAL PRIMARY KEY,
        trend_name TEXT,
        trend_score INTEGER,
        velocity NUMERIC,
        momentum NUMERIC,
        velocity_score NUMERIC DEFAULT 0,
        mutation_score NUMERIC DEFAULT 0,
        saturation_score NUMERIC DEFAULT 0,
        decay_rate NUMERIC DEFAULT 0,
        region TEXT,
        season TEXT,
        lifecycle_phase TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS brand_dna (
        id SERIAL PRIMARY KEY,
        brand_name TEXT,
        archetype TEXT,
        region TEXT,
        dna_metrics JSONB,
        visual_signature JSONB,
        associated_trends TEXT[],
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS fashion_assets (
        id SERIAL PRIMARY KEY,
        image_path TEXT,
        brand TEXT,
        style TEXT,
        garment_type TEXT,
        dataset_tier INTEGER,
        aesthetic_score NUMERIC,
        fashion_density NUMERIC,
        luxury_score NUMERIC,
        runway_score NUMERIC,
        editorial_score NUMERIC,
        silhouette_score NUMERIC,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS runway_metadata (
        id SERIAL PRIMARY KEY,
        asset_id INTEGER REFERENCES fashion_assets(id) ON DELETE CASCADE,
        designer TEXT,
        look_number INTEGER,
        collection_name TEXT,
        city TEXT,
        runway_pacing NUMERIC,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agent_registry (
        id SERIAL PRIMARY KEY,
        agent_name TEXT,
        agent_role TEXT,
        status TEXT,
        capabilities TEXT[]
      );

      CREATE TABLE IF NOT EXISTS dataset_crawlers (
        id SERIAL PRIMARY KEY,
        source_name TEXT,
        source_tier INTEGER,
        status TEXT,
        quality_threshold NUMERIC,
        assets_collected INTEGER DEFAULT 0,
        last_run_at TIMESTAMPTZ,
        stealth_mode BOOLEAN DEFAULT true,
        config JSONB
      );

      CREATE TABLE IF NOT EXISTS crawler_hydration_rules (
        id SERIAL PRIMARY KEY,
        domain TEXT,
        pattern_type TEXT,
        rule_config JSONB
      );

      CREATE TABLE IF NOT EXISTS injection_proxy_pool (
        id SERIAL PRIMARY KEY,
        proxy_url TEXT,
        region TEXT,
        success_rate NUMERIC,
        latency_ms INTEGER
      );

      CREATE TABLE IF NOT EXISTS dataset_quality_audits (
        id SERIAL PRIMARY KEY,
        source_url TEXT,
        rejection_reason TEXT,
        luxury_score_failed NUMERIC,
        aesthetic_score_failed NUMERIC,
        luxury_density NUMERIC DEFAULT 0,
        editorial_depth NUMERIC DEFAULT 0,
        runway_integrity NUMERIC DEFAULT 0,
        composition_score NUMERIC DEFAULT 0,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agent_reasoning_logs (
        id SERIAL PRIMARY KEY,
        agent_id INTEGER REFERENCES agent_registry(id) ON DELETE CASCADE,
        task_id TEXT,
        thought_process TEXT,
        style_logic JSONB,
        decision_confidence NUMERIC,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agent_tasks (
        id SERIAL PRIMARY KEY,
        agent_id INTEGER REFERENCES agent_registry(id) ON DELETE CASCADE,
        task_type TEXT,
        status TEXT,
        input_data JSONB,
        output_data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS outfit_compatibility (
        id SERIAL PRIMARY KEY,
        item_a_style TEXT,
        item_b_style TEXT,
        compatibility_score NUMERIC,
        reasoning TEXT,
        seasonal_alignment TEXT
      );

      CREATE TABLE IF NOT EXISTS knowledge_graph_edges (
        id SERIAL PRIMARY KEY,
        source_node_id TEXT,
        target_node_id TEXT,
        relationship_type TEXT,
        weight NUMERIC,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('[Fashion OS] Database Schema Verified');

    // --- Seed Logic ---
    const { rows: telemetryCount } = await pool.query('SELECT count(*) FROM runtime_telemetry');
    if (parseInt(telemetryCount[0].count) === 0) {
      console.log('[Fashion OS] Seeding Intelligence Layer...');
      await pool.query(`
        INSERT INTO runtime_telemetry (module_name, metric_key, metric_value) VALUES 
        ('Ollama-Qwen', 'tokens_per_sec', 42.5),
        ('SDXL-V1.0', 'latency_ms', 840),
        ('Qdrant Core', 'vram_mb', 1240),
        ('PostgreSQL', 'connections', 12);

        INSERT INTO fashion_trends (trend_name, trend_score, velocity, momentum, velocity_score, mutation_score, saturation_score, decay_rate, region, season, lifecycle_phase) VALUES 
        ('Luxury Minimal', 92, 1.2, 0.8, 0.95, 0.12, 0.45, 0.02, 'Paris', 'FW2026', 'peak'),
        ('Tech Street', 88, 2.4, 1.5, 0.88, 0.65, 0.32, 0.05, 'Seoul', 'SS2026', 'emerging'),
        ('Neo-Classic', 75, 0.5, 0.3, 0.42, 0.05, 0.78, 0.01, 'New York', 'FW2025', 'maturing'),
        ('Cyber Pop', 82, 3.1, 2.2, 0.98, 0.82, 0.15, 0.12, 'Tokyo', 'SS2026', 'emerging');

        INSERT INTO brand_dna (brand_name, archetype, region, dna_metrics, visual_signature, associated_trends) VALUES 
        ('Dior', 'Couture Structure', 'France', 
          '{"tailoring": 0.98, "volume": 0.4, "contrast": 0.85, "silhouette": "New Look Evolution", "material_density": 0.9}', 
          '{"cinematography": "high_key_fashion", "lighting": "direct_studio", "palette": ["#000000", "#FFFFFF", "#D4AF37"]}', 
          ARRAY['Luxury Minimal', 'Couture Classic']),
        ('Rick Owens', 'Brutalist Avant-Garde', 'USA/France', 
          '{"tailoring": 0.65, "volume": 1.0, "contrast": 0.95, "silhouette": "Asymmetric Brutalist", "material_density": 0.85}', 
          '{"cinematography": "low_key_industrial", "lighting": "shadow_heavy", "palette": ["#111111", "#444444", "#222222"]}', 
          ARRAY['Cyber Brutalism', 'Dark Avant-Garde']),
        ('Prada', 'Intellectual Stealth', 'Italy', 
          '{"tailoring": 0.92, "volume": 0.5, "contrast": 0.4, "silhouette": "Boxy Precision", "material_density": 0.98}', 
          '{"cinematography": "stark_minimal", "lighting": "natural_pacing", "palette": ["#000000", "#5D6D7E", "#F4F6F7"]}', 
          ARRAY['Minimalist Luxury', 'Neo-Nylon']),
        ('Balenciaga', 'Metabolic Deconstruction', 'France', 
          '{"tailoring": 0.85, "volume": 1.2, "contrast": 0.9, "silhouette": "Oversized Architectural", "material_density": 0.8}', 
          '{"cinematography": "security_cam_raw", "lighting": "industrial_strobe", "palette": ["#000000", "#E5E5E5", "#FF0000"]}', 
          ARRAY['Cyber Street', 'Metabolic Volume']);

        INSERT INTO dataset_crawlers (source_name, source_tier, status, quality_threshold, stealth_mode, config) VALUES 
        ('Vogue Runway Intelligence', 1, 'active', 0.98, true, '{"restore_hd": true, "extract_season": true, "headless": "stealth"}'),
        ('Paris Haute Couture Feed', 1, 'active', 0.99, true, '{"restore_hd": true, "extract_details": true}'),
        ('Dazed Editorial HQ', 3, 'idle', 0.95, true, '{"editorial_pacing": true, "composition_analysis": true}'),
        ('Pinterest Trend Scraper', 4, 'active', 0.85, true, '{"infinite_scroll": true, "engagement_tracking": true}');

        INSERT INTO crawler_hydration_rules (domain, pattern_type, rule_config) VALUES 
        ('vogue.com', 'srcset', '{"selector": "img.runway-image", "transform": "original_res"}'),
        ('dazeddigital.com', 'json_payload', '{"path": "window.__HYDRATED_DATA__", "key": "mediaURL"}'),
        ('pinterest.com', 'data_attribute', '{"attr": "data-zoom-src", "quality_boost": "4k"}');

        INSERT INTO injection_proxy_pool (proxy_url, region, success_rate, latency_ms) VALUES 
        ('http://proxy-fr-01:8080', 'France', 0.99, 120),
        ('http://proxy-it-01:8080', 'Italy', 0.97, 150),
        ('http://proxy-kr-01:8080', 'South Korea', 0.95, 210),
        ('http://proxy-jp-01:8081', 'Japan', 0.98, 180);

        INSERT INTO dataset_quality_audits (source_url, rejection_reason, luxury_score_failed, aesthetic_score_failed, luxury_density, editorial_depth, runway_integrity, composition_score) VALUES 
        ('https://scrapper-node-04/img_023.jpg', 'Low Resolution / Watermark Detected', 0.32, 0.45, 0.12, 0.05, 0.45, 0.22),
        ('https://scrapper-node-04/img_024.jpg', 'Insufficient Luxury Density', 0.12, 0.65, 0.05, 0.32, 0.12, 0.55),
        ('https://scrapper-node-04/img_025.jpg', 'Commercial / TaoBao Aesthetic Class', 0.05, 0.22, 0.02, 0.01, 0.05, 0.12);

        INSERT INTO fashion_assets (image_path, brand, style, garment_type, dataset_tier, aesthetic_score, fashion_density, luxury_score, runway_score, editorial_score, silhouette_score) VALUES 
        ('https://images.unsplash.com/photo-1539109136881-3be0616acf4b', 'Dior', 'Couture', 'Blazer', 1, 0.97, 0.95, 0.99, 0.98, 0.92, 0.96),
        ('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f', 'Rick Owens', 'Brutalist', 'Outerwear', 1, 0.92, 0.96, 0.94, 0.95, 0.98, 0.99);

        INSERT INTO outfit_compatibility (item_a_style, item_b_style, compatibility_score, reasoning) VALUES 
        ('Minimalist Blazer', 'Silk Trousers', 0.98, 'High texture harmony and volume balance'),
        ('Cyber Boots', 'Brutalist Cape', 0.92, 'Aligned aesthetic density and industrial DNA');

        INSERT INTO agent_registry (agent_name, agent_role, status, capabilities) VALUES 
        ('Fashion Architect', 'Style Generation', 'active', ARRAY['sdxl', 'flux', 'lora_fine_tuning']),
        ('Trend Analyst', 'Market Intelligence', 'active', ARRAY['scraping', 'embedding_clustering', 'prediction']),
        ('Calibration Agent', 'Embedding Optimization', 'active', ARRAY['CLIP', 'FashionCLIP', 'SigLIP']);

        WITH agents AS (SELECT id, agent_name FROM agent_registry)
        INSERT INTO agent_reasoning_logs (agent_id, task_id, thought_process, style_logic, decision_confidence) VALUES 
        ((SELECT id FROM agents WHERE agent_name = 'Trend Analyst'), '942-A', 'Detected recursive minimalism spike in Milan. Cross-referencing with 1994 Jil Sander archives.', '{"style": "minimalism", "era": "90s", "vibe": "intellectual"}', 0.98),
        ((SELECT id FROM agents WHERE agent_name = 'Fashion Architect'), '942-B', 'Synthesizing Rick Owens Brutalism with Dior Couture structure. Material density set to high.', '{"tailoring": "couture", "texture": "raw", "color": "monochrome"}', 0.92),
        ((SELECT id FROM agents WHERE agent_name = 'Calibration Agent'), '942-C', 'SigLIP embedding drift detected in "Cyber" cluster. Re-centering centroids for increased silhouette precision.', '{"module": "embedding_v2", "precision": "float16"}', 0.95);
      `);
      }
    }
  } catch (e) {
    console.warn('[Fashion OS] DB Setup failed:', e);
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`[Fashion OS] Core Brain Running on Port ${PORT}`);
    console.log(`[Fashion OS] Intelligence: Qdrant ready at ${QDRANT_URL}`);
  });
}

startServer().catch(err => {
  console.error('Core Brain Boot Failure:', err);
});

