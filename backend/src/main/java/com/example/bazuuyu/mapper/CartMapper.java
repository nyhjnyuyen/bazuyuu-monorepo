package com.example.bazuuyu.mapper;

import com.example.bazuuyu.dto.response.CartResponse;
import com.example.bazuuyu.dto.response.CartItemResponse;
import com.example.bazuuyu.entity.Cart;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

public class CartMapper {
    public static CartResponse toResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(CartItemMapper::toResponse)
                .collect(Collectors.toList());

        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .customerId(cart.getCustomer().getId())
                .status(cart.getStatus())
                .createdAt(cart.getCreatedAt())
                .items(itemResponses)
                .itemCount(itemResponses.size())
                .totalPrice(total)
                .build();
    }
}
