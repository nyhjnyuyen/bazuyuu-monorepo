// CartMergeItem.java
package com.example.bazuuyu.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartMergeItem {
    @NotNull
    private Long productId;

    private Long variantId;

    @Min(1)
    private Integer quantity = 1;
}
