package com.example.bazuuyu.service;

import com.example.bazuuyu.entity.CartItem;
import com.example.bazuuyu.entity.Order;
import com.example.bazuuyu.entity.OrderItem;
import com.example.bazuuyu.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;

    public List<OrderItem> getItemsByOrderId(Long orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    public Optional<OrderItem> getOrderItemById(Long id) {
        return orderItemRepository.findById(id);
    }
    public OrderItem save(OrderItem orderItem) {
        return orderItemRepository.save(orderItem);
    }
    public OrderItem createFromCartItem(CartItem cartItem, Order order) {
        if (cartItem.getVariant() == null) {
            return OrderItem.fromSimpleProduct(
                    cartItem.getProduct(),
                    order,
                    cartItem.getQuantity()
            );
        } else {
            return OrderItem.fromVariant(
                    cartItem.getVariant(),
                    order,
                    cartItem.getQuantity()
            );
        }
    }
}
