package com.example.bazuuyu.dto.request;

import com.example.bazuuyu.entity.Category;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

// dto nhan du lieu dau vao khi tao hoac cap nhat san pham
@Getter
@Setter
@Builder
public class ProductRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private Category category;
    private List<String> imageUrls;
    private int quantity;
    private boolean isBestSeller;
    private boolean isNewArrival;

    // dam bao danh sach anh k null
    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = (imageUrls == null) ? new ArrayList<>() : new ArrayList<>(imageUrls);
    }

    // builder xu ly imageURLs
    public static class ProductRequestBuilder {
        public ProductRequestBuilder imageUrls(List<String> imageUrls) {
            this.imageUrls = (imageUrls == null) ? new ArrayList<>() : new ArrayList<>(imageUrls);
            return this;
        }
    }
}

