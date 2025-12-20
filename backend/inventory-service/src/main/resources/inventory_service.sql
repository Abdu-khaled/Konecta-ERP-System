

-- Items stored in inventory
CREATE TABLE IF NOT EXISTS inv_item (
    id             BIGSERIAL PRIMARY KEY,
    sku            VARCHAR(64)  NOT NULL UNIQUE,
    name           VARCHAR(200) NOT NULL,
    description    VARCHAR(1000),
    unit           VARCHAR(32),              
    reorder_level  DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- Physical warehouses/locations
CREATE TABLE IF NOT EXISTS inv_warehouse (
    id        BIGSERIAL PRIMARY KEY,
    name      VARCHAR(150) NOT NULL,
    location  VARCHAR(250)
);


-- Stock movements (IN, OUT, ADJUST)
CREATE TABLE IF NOT EXISTS inv_movement (
    id           BIGSERIAL PRIMARY KEY,
    item_id      BIGINT       NOT NULL,
    warehouse_id BIGINT       NOT NULL,
    type         VARCHAR(16)  NOT NULL,
    quantity     DOUBLE PRECISION NOT NULL,
    reference    VARCHAR(100),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_movement_item
        FOREIGN KEY (item_id)
        REFERENCES inv_item (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_movement_warehouse
        FOREIGN KEY (warehouse_id)
        REFERENCES inv_warehouse (id)
        ON DELETE CASCADE,

    -- Allowed movement types, matching MovementType enum: IN, OUT, ADJUST
    CONSTRAINT chk_movement_type
        CHECK (type IN ('IN', 'OUT', 'ADJUST')),

    -- Enforce non‑negative quantities; business logic prevents going below zero stock
    CONSTRAINT chk_movement_quantity_positive
        CHECK (quantity >= 0)
);


------------------------------------------------------------
-- Indexes
------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_inv_movement_item
    ON inv_movement (item_id);

CREATE INDEX IF NOT EXISTS idx_inv_movement_warehouse
    ON inv_movement (warehouse_id);

CREATE INDEX IF NOT EXISTS idx_inv_movement_item_warehouse
    ON inv_movement (item_id, warehouse_id);


------------------------------------------------------------
-- Helper Views for Stock Levels
------------------------------------------------------------

-- Stock per item + warehouse
CREATE OR REPLACE VIEW inv_stock_per_item_warehouse AS
SELECT
    m.item_id,
    m.warehouse_id,
    COALESCE(
        SUM(
            CASE
                WHEN m.type = 'IN'  THEN m.quantity
                WHEN m.type = 'OUT' THEN -m.quantity
                ELSE m.quantity     -- ADJUST or others
            END
        ),
        0
    ) AS quantity
FROM inv_movement m
GROUP BY m.item_id, m.warehouse_id;


-- Stock per item across all warehouses
CREATE OR REPLACE VIEW inv_stock_per_item AS
SELECT
    s.item_id,
    COALESCE(SUM(s.quantity), 0) AS quantity
FROM inv_stock_per_item_warehouse s
GROUP BY s.item_id;


------------------------------------------------------------
-- Example Queries (matching the current Java/JPA logic)
------------------------------------------------------------

-- 1) Insert a new item
-- Parameters: sku, name, description, unit, reorder_level
-- Returns: generated item id
-- INSERT INTO inv_item (sku, name, description, unit, reorder_level)
-- VALUES ($1, $2, $3, $4, $5)
-- RETURNING id;


-- 2) Insert a new warehouse
-- Parameters: name, location
-- Returns: generated warehouse id
-- INSERT INTO inv_warehouse (name, location)
-- VALUES ($1, $2)
-- RETURNING id;


-- 3) Record a stock movement
-- Business rules (from service layer):
--   - quantity > 0 for IN / OUT
--   - prevent negative stock on OUT (checked in application code)
-- Parameters: item_id, warehouse_id, type ('IN'|'OUT'|'ADJUST'), quantity, reference
-- Returns: generated movement id and timestamp
-- INSERT INTO inv_movement (item_id, warehouse_id, type, quantity, reference)
-- VALUES ($1, $2, $3, $4, $5)
-- RETURNING id, created_at;


-- 4) Get on‑hand stock for an item in a specific warehouse
-- Parameters: item_id, warehouse_id
-- SELECT
--     COALESCE(
--         SUM(
--             CASE
--                 WHEN type = 'IN'  THEN quantity
--                 WHEN type = 'OUT' THEN -quantity
--                 ELSE quantity
--             END
--         ),
--         0
--     ) AS on_hand
-- FROM inv_movement
-- WHERE item_id = $1
--   AND warehouse_id = $2;


-- 5) Get on‑hand stock for an item across all warehouses
-- Parameters: item_id
-- SELECT
--     COALESCE(
--         SUM(
--             CASE
--                 WHEN type = 'IN'  THEN quantity
--                 WHEN type = 'OUT' THEN -quantity
--                 ELSE quantity
--             END
--         ),
--         0
--     ) AS on_hand
-- FROM inv_movement
-- WHERE item_id = $1;


-- 6) Low‑stock items (current quantity <= reorder_level)
-- This matches the /low-stock endpoint logic.
-- SELECT
--     i.id,
--     i.sku,
--     i.name,
--     i.reorder_level,
--     COALESCE(s.quantity, 0) AS quantity
-- FROM inv_item i
-- LEFT JOIN inv_stock_per_item s
--        ON s.item_id = i.id
-- WHERE COALESCE(s.quantity, 0) <= COALESCE(i.reorder_level, 0);


-- 7) List all movements (optionally filter by item/warehouse)
-- Parameters: item_id (nullable), warehouse_id (nullable)
-- SELECT
--     id,
--     item_id,
--     warehouse_id,
--     type,
--     quantity,
--     reference,
--     created_at
-- FROM inv_movement
-- WHERE ($1 IS NULL OR item_id = $1)
--   AND ($2 IS NULL OR warehouse_id = $2)
-- ORDER BY created_at DESC;

