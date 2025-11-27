package com.example.bazuuyu.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * one item within an order.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id")
    private Product product; // item belongs to product

    // 🔹 OPTIONAL: null = simple product, not null = variant product
    @ManyToOne
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id")
    private Order order; // don hang item thuoc ve

    private Integer quantity;

    // unit price at time of order (NOT auto-update if product price changes)
    @Column(precision = 18, scale = 2, nullable = false)
    private BigDecimal price;

    /* Convenience factories */

    public static OrderItem fromSimpleProduct(Product product, Order order, int qty) {
        return OrderItem.builder()
                .product(product)
                .order(order)
                .quantity(qty)
                .price(product.getPrice())
                .build();
    }

    public static OrderItem fromVariant(ProductVariant variant, Order order, int qty) {
        return OrderItem.builder()
                .product(variant.getProduct())
                .variant(variant)
                .order(order)
                .quantity(qty)
                .price(variant.getPrice())
                .build();
    }

    public boolean isVariantItem() {
        return variant != null;
    }
}
