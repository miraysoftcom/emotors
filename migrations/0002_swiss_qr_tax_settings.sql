CREATE TABLE IF NOT EXISTS swiss_qr_settings (
  id SERIAL PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'nicht_konfiguriert',
  missing_fields TEXT[] NOT NULL DEFAULT '{}',
  last_error TEXT,
  updated_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_settings (
  id SERIAL PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  price_display TEXT NOT NULL DEFAULT 'inclusive',
  uid_number TEXT,
  exemption_text TEXT,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_snapshots (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  order_number TEXT NOT NULL,
  tax_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  swiss_qr_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  pdf_payload TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id SERIAL PRIMARY KEY,
  actor TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  before_value JSONB,
  after_value JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_rate_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_percentage NUMERIC(5,2);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS default_tax_rate_id TEXT;
