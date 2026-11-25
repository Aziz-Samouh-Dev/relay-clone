CREATE TABLE payment_accounts(
 id TEXT PRIMARY KEY,method TEXT NOT NULL CHECK(method IN('interac','USDT','USDC')),network TEXT NOT NULL DEFAULT '',
 nickname TEXT NOT NULL,enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN(0,1)),verified INTEGER NOT NULL DEFAULT 0 CHECK(verified IN(0,1)),
 legal_approved INTEGER NOT NULL DEFAULT 0 CHECK(legal_approved IN(0,1)),operations_approved INTEGER NOT NULL DEFAULT 0 CHECK(operations_approved IN(0,1)),
 token_verified INTEGER NOT NULL DEFAULT 0 CHECK(token_verified IN(0,1)),is_default INTEGER NOT NULL DEFAULT 0 CHECK(is_default IN(0,1)),
 priority INTEGER NOT NULL DEFAULT 0,archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN(0,1)),encrypted TEXT NOT NULL,
 version INTEGER NOT NULL DEFAULT 1,creation_key TEXT NOT NULL UNIQUE,creation_hash TEXT NOT NULL,updated_by TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,
 CHECK((method='interac' AND network='') OR (method IN('USDT','USDC') AND network IN('ethereum','polygon','tron') AND NOT(method='USDC' AND network='tron')))
);
CREATE UNIQUE INDEX one_default_payment_account ON payment_accounts(method,network) WHERE is_default=1 AND archived=0;
CREATE TABLE payment_account_history(id INTEGER PRIMARY KEY AUTOINCREMENT,account_id TEXT NOT NULL REFERENCES payment_accounts(id),version INTEGER NOT NULL,action TEXT NOT NULL,actor TEXT NOT NULL,snapshot TEXT NOT NULL,created_at TEXT NOT NULL,UNIQUE(account_id,version));
ALTER TABLE quotes ADD COLUMN account_id TEXT REFERENCES payment_accounts(id);
ALTER TABLE quotes ADD COLUMN account_version INTEGER;
ALTER TABLE quotes ADD COLUMN account_snapshot TEXT;
-- Keep non-fiscal drafts while allowing one later fiscal final invoice.
DROP INDEX one_order_invoice_kind;
CREATE UNIQUE INDEX one_order_proforma ON invoices(order_id) WHERE kind='proforma';
CREATE UNIQUE INDEX one_order_fiscal_final ON invoices(order_id) WHERE kind='final' AND status!='draft';
CREATE INDEX quote_account ON quotes(account_id);
CREATE TRIGGER require_eligible_quote_account BEFORE INSERT ON quotes
WHEN NEW.account_id IS NOT NULL AND NOT EXISTS(
 SELECT 1 FROM payment_accounts a WHERE a.id=NEW.account_id AND a.version=NEW.account_version
 AND a.enabled=1 AND a.archived=0 AND a.verified=1
 AND ((NEW.method='interac' AND a.method='interac') OR
 (NEW.method='crypto' AND a.method=NEW.token AND a.network=NEW.network AND a.legal_approved=1 AND a.operations_approved=1 AND a.token_verified=1))
) BEGIN SELECT RAISE(ABORT,'payment account unavailable or changed'); END;
CREATE TRIGGER protect_quote_instructions BEFORE UPDATE OF account_id,account_version,account_snapshot,address,amount,token,network,method,mode,order_id ON quotes BEGIN
 SELECT RAISE(ABORT,'payment request instructions are immutable');
END;
