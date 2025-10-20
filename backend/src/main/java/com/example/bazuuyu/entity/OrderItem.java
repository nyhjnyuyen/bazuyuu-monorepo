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

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product; // item belongs to productid

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order; // don han item thuoc ve

    private Integer quantity;

    @Column(precision = 18, scale = 2, nullable = false)
    private BigDecimal price;
}