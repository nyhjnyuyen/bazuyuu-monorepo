package com.example.bazuuyu.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * entity dai dien 1 san pham trong gio hang
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // tu sinh

    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id")
    private Product product; // san pham dc them vao gio

    // 🔹 OPTIONAL: null = simple product, not null = variant product
    @ManyToOne
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cart_id")
    private Cart cart; // gio hang ma san pham thuoc ve

    private Integer quantity; // so luong san pham

    /* Helpers */

    public boolean isVariantItem() {
        return variant != null;
    }
}
