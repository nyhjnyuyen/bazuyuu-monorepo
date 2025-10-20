package com.example.bazuuyu.dto.request;

import lombok.Data;

@Data
public class CreateCartItemRequest {
    private Long cartId;
    private Long productId;
    private Integer quantity;
}