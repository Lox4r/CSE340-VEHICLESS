-- Additional Enhancement: Saved Vehicles / Favorites
-- Run this after your core tables exist.

CREATE TABLE IF NOT EXISTS favorites (
  favorite_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES account(account_id) ON DELETE CASCADE,
  inv_id INT NOT NULL REFERENCES inventory(inv_id) ON DELETE CASCADE,
  favorite_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT favorites_account_inv_unique UNIQUE (account_id, inv_id)
);
