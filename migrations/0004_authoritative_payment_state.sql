-- Read historical stale summaries accurately without rewriting any order records.
CREATE VIEW order_payment_records AS
SELECT o.id,
 o.public_id,
 o.customer_id,
 o.request_key,
 o.request_hash,
 o.access_hash,
 o.plan_id,
 o.plan_name,
 o.months,
 o.screens,
 o.subtotal_cents,
 o.tax_cents,
 o.tax_label,
 o.total_cents,
 o.currency,
 o.locale,
 o.device,
 o.mode,
 CASE WHEN o.payment_status='refunded' THEN 'refunded' WHEN o.payment_status='paid' OR EXISTS(SELECT 1 FROM claims c WHERE c.order_id=o.id AND c.status='verified') THEN 'paid' WHEN EXISTS(SELECT 1 FROM claims c WHERE c.order_id=o.id AND c.status='pending') THEN 'awaiting_verification' WHEN EXISTS(SELECT 1 FROM claims c WHERE c.order_id=o.id AND c.status='rejected') THEN 'rejected' ELSE 'pending_payment' END AS payment_status,
 o.order_status,
 o.notes,
 o.created_at,
 o.payment_status AS stored_payment_status
FROM orders o;

-- Synchronize the storage summary for future rejection events, independently of fulfillment.
DROP TRIGGER claim_reviewed;
CREATE TRIGGER claim_reviewed AFTER UPDATE OF status ON claims
WHEN NEW.status='rejected' AND OLD.status='pending' BEGIN
 UPDATE orders SET payment_status=CASE
 WHEN EXISTS(SELECT 1 FROM claims c WHERE c.order_id=NEW.order_id AND c.status='pending') THEN 'awaiting_verification'
 ELSE 'pending_payment' END
 WHERE id=NEW.order_id AND payment_status NOT IN ('paid','refunded')
 AND NOT EXISTS(SELECT 1 FROM claims c WHERE c.order_id=NEW.order_id AND c.status='verified');
 INSERT INTO audit(actor,action,order_id,details,created_at)
 VALUES(NEW.reviewed_by,'payment_rejected',NEW.order_id,json_object('claim',NEW.id,'notes',NEW.review_notes),NEW.reviewed_at);
END;
