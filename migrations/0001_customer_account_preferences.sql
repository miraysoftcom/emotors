CREATE TABLE IF NOT EXISTS customer_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'de',
  theme TEXT NOT NULL DEFAULT 'dunkel',
  notifications JSONB NOT NULL DEFAULT '{
    "orderUpdates": true,
    "paymentUpdates": true,
    "shippingUpdates": true,
    "invoiceUpdates": true,
    "marketing": false,
    "productNews": false,
    "security": true
  }'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customer_preferences_email_idx ON customer_preferences (LOWER(email));
