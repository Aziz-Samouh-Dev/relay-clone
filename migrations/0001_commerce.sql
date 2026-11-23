PRAGMA foreign_keys=ON;
CREATE TABLE customers(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE orders(id INTEGER PRIMARY KEY AUTOINCREMENT,public_id TEXT NOT NULL UNIQUE,customer_id TEXT NOT NULL REFERENCES customers(id),request_key TEXT NOT NULL UNIQUE,request_hash TEXT NOT NULL,access_hash TEXT NOT NULL,plan_id TEXT NOT NULL,plan_name TEXT NOT NULL,months INTEGER NOT NULL,screens INTEGER NOT NULL,subtotal_cents INTEGER NOT NULL CHECK(subtotal_cents>=0),tax_cents INTEGER NOT NULL DEFAULT 0,tax_label TEXT NOT NULL,total_cents INTEGER NOT NULL CHECK(total_cents=subtotal_cents+tax_cents),currency TEXT NOT NULL CHECK(currency='CAD'),locale TEXT NOT NULL,device TEXT NOT NULL,mode TEXT NOT NULL DEFAULT 'test' CHECK(mode IN('test','live')),payment_status TEXT NOT NULL DEFAULT 'pending_payment' CHECK(payment_status IN('pending_payment','awaiting_verification','paid','refunded')),order_status TEXT NOT NULL DEFAULT 'pending_payment' CHECK(order_status IN('pending_payment','processing','fulfilled','cancelled','refunded')),notes TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL);
CREATE TABLE settings(id INTEGER PRIMARY KEY CHECK(id=1),encrypted TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE quotes(id TEXT PRIMARY KEY,order_id INTEGER NOT NULL REFERENCES orders(id),method TEXT NOT NULL,token TEXT,network TEXT,address TEXT,amount TEXT NOT NULL,rate TEXT,mode TEXT NOT NULL,expires_at TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE claims(id TEXT PRIMARY KEY,order_id INTEGER NOT NULL REFERENCES orders(id),quote_id TEXT NOT NULL REFERENCES quotes(id),request_key TEXT NOT NULL,request_hash TEXT NOT NULL,method TEXT NOT NULL,confirmation TEXT NOT NULL,network TEXT,tx_hash TEXT,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN('pending','verified','rejected')),checks TEXT,verification_reference TEXT,review_notes TEXT,reviewed_by TEXT,reviewed_at TEXT,created_at TEXT NOT NULL,UNIQUE(order_id,request_key));
CREATE UNIQUE INDEX verified_chain_tx ON claims(network,tx_hash) WHERE status='verified' AND tx_hash IS NOT NULL;
CREATE UNIQUE INDEX one_verified_payment ON claims(order_id) WHERE status='verified';
CREATE UNIQUE INDEX one_pending_claim ON claims(order_id) WHERE status='pending';
CREATE TABLE invoices(id INTEGER PRIMARY KEY AUTOINCREMENT,order_id INTEGER NOT NULL REFERENCES orders(id),kind TEXT NOT NULL CHECK(kind IN('proforma','final','credit')),status TEXT NOT NULL,amount_cents INTEGER NOT NULL,snapshot TEXT NOT NULL,reason TEXT NOT NULL DEFAULT '',request_key TEXT UNIQUE,created_at TEXT NOT NULL);
CREATE UNIQUE INDEX one_order_invoice_kind ON invoices(order_id,kind) WHERE kind IN('proforma','final');
CREATE UNIQUE INDEX one_full_credit ON invoices(order_id) WHERE kind='credit';
CREATE TABLE subscriptions(id TEXT PRIMARY KEY,order_id INTEGER NOT NULL UNIQUE REFERENCES orders(id),customer_id TEXT NOT NULL REFERENCES customers(id),activated_at TEXT NOT NULL,expires_at TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'active' CHECK(status IN('active','cancelled')),activated_by TEXT NOT NULL,fulfillment_reference TEXT NOT NULL);
CREATE TABLE sessions(token_hash TEXT PRIMARY KEY,actor TEXT NOT NULL,csrf TEXT NOT NULL,expires_at TEXT NOT NULL);
CREATE TABLE rate_limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,reset_at INTEGER NOT NULL);
CREATE TABLE audit(id INTEGER PRIMARY KEY AUTOINCREMENT,actor TEXT NOT NULL,action TEXT NOT NULL,order_id INTEGER,details TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE email_deliveries(id TEXT PRIMARY KEY,invoice_id INTEGER NOT NULL UNIQUE REFERENCES invoices(id),status TEXT NOT NULL,provider_id TEXT,created_at TEXT NOT NULL);
CREATE INDEX orders_customer ON orders(customer_id);
CREATE INDEX orders_date ON orders(created_at);
CREATE INDEX claims_status ON claims(status);
CREATE TRIGGER protect_paid_order BEFORE UPDATE OF payment_status ON orders WHEN NEW.payment_status='paid' AND NOT EXISTS(SELECT 1 FROM claims WHERE order_id=NEW.id AND status='verified') BEGIN SELECT RAISE(ABORT,'verified payment required'); END;
CREATE TRIGGER verify_claim BEFORE UPDATE OF status ON claims WHEN NEW.status='verified' BEGIN
 SELECT CASE WHEN OLD.status!='pending' THEN RAISE(ABORT,'claim already reviewed') END;
 SELECT CASE WHEN length(COALESCE(NEW.verification_reference,''))<3 OR NEW.reviewed_by IS NULL THEN RAISE(ABORT,'independent evidence required') END;
 SELECT CASE WHEN json_extract(NEW.checks,'$.received') IS NOT 1 OR json_extract(NEW.checks,'$.amount') IS NOT 1 OR json_extract(NEW.checks,'$.recipient') IS NOT 1 THEN RAISE(ABORT,'verification incomplete') END;
 SELECT CASE WHEN NEW.method='crypto' AND (json_extract(NEW.checks,'$.token') IS NOT 1 OR json_extract(NEW.checks,'$.network') IS NOT 1 OR json_extract(NEW.checks,'$.success') IS NOT 1 OR json_extract(NEW.checks,'$.finality') IS NOT 1) THEN RAISE(ABORT,'blockchain verification incomplete') END;
END;
CREATE TRIGGER claim_verified AFTER UPDATE OF status ON claims WHEN NEW.status='verified' BEGIN
 UPDATE orders SET payment_status='paid',order_status='processing' WHERE id=NEW.order_id;
 INSERT INTO audit(actor,action,order_id,details,created_at) VALUES(NEW.reviewed_by,'payment_verified',NEW.order_id,json_object('claim',NEW.id,'evidence',NEW.verification_reference,'checks',json(NEW.checks)),NEW.reviewed_at);
END;
CREATE TRIGGER claim_reviewed AFTER UPDATE OF status ON claims WHEN NEW.status='rejected' BEGIN
 UPDATE orders SET payment_status='pending_payment' WHERE id=NEW.order_id AND payment_status!='paid';
 INSERT INTO audit(actor,action,order_id,details,created_at) VALUES(NEW.reviewed_by,'payment_rejected',NEW.order_id,json_object('claim',NEW.id,'notes',NEW.review_notes),NEW.reviewed_at);
END;
CREATE TRIGGER protect_activation BEFORE INSERT ON subscriptions BEGIN SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM orders WHERE id=NEW.order_id AND payment_status='paid' AND order_status!='cancelled') THEN RAISE(ABORT,'paid order required') END; END;
