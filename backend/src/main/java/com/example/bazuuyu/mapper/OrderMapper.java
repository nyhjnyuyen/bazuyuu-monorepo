package com.example.bazuuyu.mapper;

import com.example.bazuuyu.dto.response.OrderItemResponse;
import com.example.bazuuyu.dto.response.OrderResponse;
import com.example.bazuuyu.entity.Order;
import com.example.bazuuyu.entity.OrderItem;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

public class OrderMapper {

    public static OrderItemResponse toItemResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setProductName(item.getProduct().getName());
        response.setQuantity(item.getQuantity());
        response.setPrice(item.getPrice());
        response.setTotalPrice(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        return response;
    }

    public static OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setCustomerName(order.getCustomer().getUsername());
        response.setOrderDate(order.getOrderDate());
        response.setTotalAmount(order.getTotalAmount());

        List<OrderItemResponse> items = order.getItems().stream()
                .map(OrderMapper::toItemResponse)
                .toList();

        response.setItems(items);
        return response;
    }
}
