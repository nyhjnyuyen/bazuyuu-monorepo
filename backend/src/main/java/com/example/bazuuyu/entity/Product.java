package com.example.bazuuyu.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products") // matches your table
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // columns: name, description, category, size, product_code
    private String name;

    private String description;

    // DB column "category" is text -> map enum as STRING
    @Enumerated(EnumType.STRING)
    private Category category;  // column name "category"

    // optional size column (e.g. "S/M/L" or "6cm")
    private String size;

    // SKU / product code
    @Column(name = "product_code")
    private String productCode;

    // price, quantity
    @Column(precision = 18, scale = 2, nullable = false)
    private BigDecimal price;

    private int quantity;

    // created_at timestamptz
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // flags
    @Column(name = "is_best_seller")
    private boolean isBestSeller;

    @Column(name = "is_new_arrival")
    private boolean isNewArrival;

    // main_image_url, image_urls[], story_image_urls[]
    @Column(name = "main_image_url")
    private String mainImageUrl;

    /**
     * These map to Postgres text[] columns.
     * Hibernate 6+ understands arrays if the dialect supports it.
     * If not, you can switch these to JSON or a separate Image entity.
     */
    @Column(name = "image_urls", columnDefinition = "text[]")
    private String[] imageUrls;

    @Column(name = "story_image_urls", columnDefinition = "text[]")
    private String[] storyImageUrls;

    // ---------- VARIANTS (Shopee-style choices) ----------

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();


    // ---------- Helpers ----------

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

    /** true => treat like Shopee product (must choose variant) */
    public boolean hasVariants() {
        return variants != null && !variants.isEmpty();
    }

    /** price shown on listing card */
    public BigDecimal getDisplayPrice() {
        if (!hasVariants()) return price;
        return variants.stream()
                .map(ProductVariant::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(price);
    }
}
