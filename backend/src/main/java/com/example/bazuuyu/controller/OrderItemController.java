package com.example.bazuuyu.controller;

import com.example.bazuuyu.dto.response.OrderItemResponse;
import com.example.bazuuyu.entity.OrderItem;
import com.example.bazuuyu.mapper.OrderItemMapper;
import com.example.bazuuyu.service.OrderItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/order-items")
@RequiredArgsConstructor
public class OrderItemController {

    private final OrderItemService orderItemService;

    // ✅ Get all order items (DTO response)
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderItemResponse>> getOrderItems(@PathVariable Long orderId) {
        List<OrderItem> items = orderItemService.getItemsByOrderId(orderId);
        List<OrderItemResponse> response = items.stream()
                .map(OrderItemMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Optional: Get single order item by ID (for admin use)
    @GetMapping("/{id}")
    public ResponseEntity<OrderItem> getItemById(@PathVariable Long id) {
        return orderItemService.getOrderItemById(id)
                .map(ResponseEntity::ok)
                .orElseGet(ResponseEntity.notFound()::build);
    }
}
