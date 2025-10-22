create table if not exists product (
                                       id bigserial primary key,
                                       name text not null,
                                       description text,
                                       price numeric(18,2) not null,
    quantity int not null default 0,
    created_at timestamp not null default now(),
    is_best_seller boolean not null default false,
    is_new_arrival boolean not null default false,
    category text
    );

create table if not exists product_image (
                                             id bigserial primary key,
                                             product_id bigint not null references product(id) on delete cascade,
    image_url varchar(2048) not null,
    is_primary boolean not null default false,
    sort_order int not null default 0
    );

create index if not exists idx_product_image_product on product_image(product_id);
