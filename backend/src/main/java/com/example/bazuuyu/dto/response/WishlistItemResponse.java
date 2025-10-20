package com.example.bazuuyu.dto.response;

import com.example.bazuuyu.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WishlistItemResponse {
    private Long id;            // WishlistItem ID
    private Product product;    // Embedded product
}
