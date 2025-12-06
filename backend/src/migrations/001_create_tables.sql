-- customers
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  phone VARCHAR UNIQUE,
  name TEXT,
  tags TEXT[],
  last_contacted TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- messages
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(id),
  direction VARCHAR, -- 'in' or 'out'
  whatsapp_id VARCHAR,
  text TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(id),
  amount NUMERIC,
  status VARCHAR, -- 'completed' | 'abandoned'
  created_at TIMESTAMP DEFAULT now()
);

-- automation_events
CREATE TABLE IF NOT EXISTS automation_events (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(id),
  event_type VARCHAR,
  triggered_at TIMESTAMP DEFAULT now(),
  metadata JSONB
);