-- parties table
CREATE TABLE IF NOT EXISTS parties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- guests table
CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  party_id INTEGER REFERENCES parties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  response VARCHAR(20), -- 'yes', 'no', 'maybe'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(party_id, email)
); 