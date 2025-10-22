ALTER TABLE product_image
    ADD COLUMN IF NOT EXISTS is_primary boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;
