// src/main/java/com/example/bazuuyu/entity/GuestCartItem.java
package com.example.bazuuyu.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "guest_cart_items", indexes = {
        @Index(name = "idx_guest_cart_guest", columnList = "guestId"),
        @Index(name = "idx_guest_cart_guest_prod", columnList = "guestId,product_id", unique = true)
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GuestCartItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String guestId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Product product;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private LocalDateTime addedAt;
}
