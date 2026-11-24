CREATE TABLE subscription_deliveries (
 order_id INTEGER PRIMARY KEY REFERENCES orders(id),
 encrypted TEXT NOT NULL,
 version INTEGER NOT NULL DEFAULT 1,
 updated_by TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 emailed_at TEXT
);
