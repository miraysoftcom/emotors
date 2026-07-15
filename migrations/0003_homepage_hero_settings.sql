CREATE TABLE IF NOT EXISTS homepage_hero_settings (
  id SERIAL PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'published',
  settings JSONB NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  published_at TIMESTAMP
);
