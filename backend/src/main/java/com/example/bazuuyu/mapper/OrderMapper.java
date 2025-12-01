package com.example.bazuuyu.mapper;

import com.example.bazuuyu.dto.response.OrderItemResponse;
import com.example.bazuuyu.dto.response.OrderResponse;
import com.example.bazuuyu.entity.Order;
import com.example.bazuuyu.entity.OrderItem;

import java.math.BigDecimal;
import java.util.List;

public class OrderMapper {

    public static OrderItemResponse toItemResponse(OrderItem item) {
        if (item == null) return null;

        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());

        // productName is safer than assuming product is always present
        String productName = item.getProduct() != null
                ? item.getProduct().getName()
                : "Item";
        response.setProductName(productName);

        Integer quantity = item.getQuantity() != null ? item.getQuantity() : 0;
        response.setQuantity(quantity);

        BigDecimal unitPrice = item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO;
        response.setPrice(unitPrice);

        response.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(quantity)));

        return response;
    }

    public static OrderResponse toResponse(Order order) {
        if (order == null) return null;

        OrderResponse response = new OrderResponse();
        response.setId(order.getId());

        String customerName = order.getCustomer() != null
                ? order.getCustomer().getUsername()
                : null;
        response.setCustomerName(customerName);

        response.setOrderCode(order.getOrderCode());
        response.setStatus(order.getStatus() != null ? order.getStatus().name() : null);

        response.setOrderDate(order.getOrderDate());
        response.setTotalAmount(order.getTotalAmount());

        List<OrderItemResponse> items = (order.getItems() == null)
                ? List.of()
                : order.getItems().stream()
                .map(OrderMapper::toItemResponse)
                .toList();
        response.setItems(items);

        return response;
    }


}
