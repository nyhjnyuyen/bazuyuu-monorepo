package com.example.bazuuyu.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CartResponse {
    private Long id;
    private Long customerId;
    private String status;
    private LocalDateTime createdAt;
    private int itemCount;
    private List<CartItemResponse> items;
    private BigDecimal totalPrice;
}
