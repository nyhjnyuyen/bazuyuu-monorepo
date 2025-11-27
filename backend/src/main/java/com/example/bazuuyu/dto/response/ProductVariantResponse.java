package com.example.bazuuyu.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Builder
@Getter
@Setter
public class ProductVariantResponse {
    private Long id;
    private String name;
    private String sku;
    private BigDecimal price;
    private Integer stock;
    private Boolean isDefault;
}
