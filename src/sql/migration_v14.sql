-- migration_v14: add OUT_FOR_DELIVERY and REQUEST_FOR_CANCEL order statuses

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'PENDING',
    'CONFIRMED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'REQUEST_FOR_CANCEL',
    'CANCELLED'
  ));
