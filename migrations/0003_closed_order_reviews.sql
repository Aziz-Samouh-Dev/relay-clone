-- Preserve closed financial state while resolving pending claims.
DROP TRIGGER claim_reviewed;
CREATE TRIGGER claim_reviewed AFTER UPDATE OF status ON claims
WHEN NEW.status='rejected' AND OLD.status='pending' BEGIN
 UPDATE orders SET payment_status='pending_payment'
 WHERE id=NEW.order_id AND payment_status='awaiting_verification'
 AND order_status NOT IN ('cancelled','refunded','fulfilled');
 INSERT INTO audit(actor,action,order_id,details,created_at)
 VALUES(NEW.reviewed_by,'payment_rejected',NEW.order_id,
 json_object('claim',NEW.id,'notes',NEW.review_notes),NEW.reviewed_at);
END;

-- Also enforce the closed-order approval guard inside the atomic DB transaction.
CREATE TRIGGER protect_closed_claim_approval BEFORE UPDATE OF status ON claims
WHEN NEW.status='verified' AND EXISTS(
 SELECT 1 FROM orders WHERE id=NEW.order_id
 AND (order_status IN ('cancelled','refunded','fulfilled') OR payment_status='refunded')
) BEGIN
 SELECT RAISE(ABORT,'closed order requires financial reconciliation');
END;
