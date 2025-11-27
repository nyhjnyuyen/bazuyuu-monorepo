package com.example.bazuuyu.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "product")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    @Column(precision = 18, scale = 2, nullable = false)
    private BigDecimal price;

    private int quantity;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    @Column(name = "is_best_seller")
    private boolean isBestSeller;

    @Column(name = "is_new_arrival")
    private boolean isNewArrival;

    @Enumerated(EnumType.STRING)
    private Category category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> productImages = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();

    public void addImage(ProductImage img) {
        img.setProduct(this);
        this.productImages.add(img);
    }
    public void clearImages() {
        for (ProductImage img : new ArrayList<>(productImages)) {
            img.setProduct(null);
        }
        productImages.clear();
    }
    public void addVariant(ProductVariant variant) {
        variant.setProduct(this);
        this.variants.add(variant);
    }

    public void clearVariants() {
        for (ProductVariant v : new ArrayList<>(variants)) {
            v.setProduct(null);
        }
        variants.clear();
    }

    /** true => treat as Shopee-style product (must choose variant) */
    public boolean hasVariants() {
        return variants != null && !variants.isEmpty();
    }

    /** convenient for UI: price to show on listing (card) */
    public BigDecimal getDisplayPrice() {
        if (!hasVariants()) return price;
        // if variants exist: show min price or default variant price
        return variants.stream()
                .map(ProductVariant::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(price);
    }

}