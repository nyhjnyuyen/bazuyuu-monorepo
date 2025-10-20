package com.example.bazuuyu.mapper;

import com.example.bazuuyu.dto.response.OrderItemResponse;
import com.example.bazuuyu.entity.OrderItem;
import java.math.BigDecimal;

public class OrderItemMapper {
    public static OrderItemResponse toResponse(OrderItem item) {
        OrderItemResponse res = new OrderItemResponse();
        res.setId(item.getId());
        res.setProductName(
                item.getProduct() != null ? item.getProduct().getName() : "Item"
        );

        Integer qty = item.getQuantity() == null ? 0 : item.getQuantity();
        BigDecimal unit = (item.getPrice() != null) ? item.getPrice() : BigDecimal.ZERO;

        res.setQuantity(qty);
        res.setPrice(unit);
        res.setTotalPrice(unit.multiply(BigDecimal.valueOf(qty)));

        return res;
    }
}
