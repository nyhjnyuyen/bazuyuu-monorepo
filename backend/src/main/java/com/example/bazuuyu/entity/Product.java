package com.example.bazuuyu.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // basic info
    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private Category category;   // maps to "category" text column

    // optional size column in DB
    private String size;

    @Column(name = "product_code")
    private String productCode;

    // price & quantity
    @Column(precision = 18, scale = 2, nullable = false)
    private BigDecimal price;

    private int quantity;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Column(name = "is_best_seller")
    private boolean isBestSeller;

    @Column(name = "is_new_arrival")
    private boolean isNewArrival;

    // main + extra images stored directly on products table
    @Column(name = "main_image_url")
    private String mainImageUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "image_urls")
    private List<String> imageUrls;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "story_image_urls")
    private List<String> storyImageUrls;

    // ---------- OLD ProductImage relation (still used in code) ----------

    @JsonIgnore
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> productImages = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();

    public void addImage(ProductImage img) {
        if (img == null) return;
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
        if (variant == null) return;
        variant.setProduct(this);
        this.variants.add(variant);
    }

    public void clearVariants() {
        for (ProductVariant v : new ArrayList<>(variants)) {
            v.setProduct(null);
        }
        variants.clear();
    }

    /** true => treat as product with variants (user must choose one) */
    public boolean hasVariants() {
        return variants != null && !variants.isEmpty();
    }

    /** price to display on listing card */
    public BigDecimal getDisplayPrice() {
        if (!hasVariants()) return price;
        return variants.stream()
                .map(ProductVariant::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(price);
    }
}
