package com.example.bazuuyu.mapper;

import com.example.bazuuyu.dto.response.CartItemResponse;
import com.example.bazuuyu.entity.CartItem;

import java.math.BigDecimal;

public class CartItemMapper {
    public static CartItemResponse toResponse(CartItem item) {
        CartItemResponse response = new CartItemResponse();
        response.setId(item.getId());
        response.setProductName(item.getProduct().getName());
        response.setQuantity(item.getQuantity());

        BigDecimal price = (item.getProduct().getPrice()!= null)
                ? item.getProduct().getPrice()
                : BigDecimal.ZERO;; // fetch from Product
        response.setPrice(price);
        response.setTotalPrice(price.multiply(BigDecimal.valueOf(item.getQuantity())));
        // calculate total

        return response;
    }
}
