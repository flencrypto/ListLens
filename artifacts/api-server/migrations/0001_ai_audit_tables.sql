-- Migration: AI job audit tables
-- Applied: 2026-05-01
-- Task #79: Store AI job audit data (model, prompt version, token usage, cost)

CREATE TABLE IF NOT EXISTS ai_job_logs (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR,
  job_type VARCHAR NOT NULL,
  item_id VARCHAR,
  check_id VARCHAR,
  lens VARCHAR,
  model VARCHAR NOT NULL,
  prompt_version VARCHAR NOT NULL,
  schema_version VARCHAR NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost_pence INTEGER NOT NULL DEFAULT 0,
  confidence_pct INTEGER NOT NULL DEFAULT 0,
  warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  full_output JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_events (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR,
  event_type VARCHAR NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- full_output column added after initial creation
ALTER TABLE ai_job_logs ADD COLUMN IF NOT EXISTS full_output JSONB;
