package com.example.bazuuyu.service;

import com.example.bazuuyu.dto.request.CartMergeItem;
import com.example.bazuuyu.dto.request.CreateCartItemRequest;
import com.example.bazuuyu.dto.response.CartResponse;
import com.example.bazuuyu.entity.*;
import com.example.bazuuyu.mapper.CartMapper;
import com.example.bazuuyu.repository.CartItemRepository;
import com.example.bazuuyu.repository.CartRepository;
import com.example.bazuuyu.repository.CustomerRepository;
import com.example.bazuuyu.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * xu ly logic cho cart, bao gom them/xoa san pham, cap nhat so luong
 */
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    // them 1 san pham vao gio hang
    public void addCartItem(CreateCartItemRequest request) {
        Cart cart = cartRepository.findById(request.getCartId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem item = CartItem.builder()
                .cart(cart)
                .product(product)
                .quantity(request.getQuantity())
                .build();

        cartItemRepository.save(item);
    }

    // lay danh sach san pham trong gio hang theo ID cua gio hang
    public List<CartItem> getCartItems(Long cartId) {
        return cartItemRepository.findByCartId(cartId);
    }

    // update item quantity
    public void updateCartItemQuantity(Long itemId, int quantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        item.setQuantity(quantity);
        cartItemRepository.save(item);
    }

    // xoa 1 san pham khoi gio hang
    public void removeCartItem(Long itemId) {
        cartItemRepository.deleteById(itemId);
    }

    //  GET ACTIVE CART FOR CUSTOMER
    public CartResponse getActiveCart(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Cart cart = cartRepository.findByCustomerAndStatus(customer, "ACTIVE")
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .customer(customer)
                            .status("ACTIVE")
                            .createdAt(LocalDateTime.now())
                            .build();
                    return cartRepository.save(newCart);
                });

        return CartMapper.toResponse(cart);

    }
    public Optional<Cart> getActiveCart(Customer customer) {
        return cartRepository.findByCustomerAndStatus(customer, "ACTIVE");
    }


    // CAP NHAT status cua cart
    public void updateCartStatus(Long cartId, String status) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        cart.setStatus(status);
        cartRepository.save(cart);
    }

    private Cart getOrCreateActiveCartEntity(Long customerId) {
        var customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        return cartRepository.findByCustomerAndStatus(customer, "ACTIVE")
                .orElseGet(() -> cartRepository.save(
                        Cart.builder()
                                .customer(customer)
                                .status("ACTIVE")
                                .createdAt(LocalDateTime.now())
                                .build()
                ));
    }

    @Transactional
    public void merge(Long customerId, List<CartMergeItem> items) {
        if (items == null || items.isEmpty()) return;

        Cart cart = getOrCreateActiveCartEntity(customerId);

        for (CartMergeItem it : items) {
            if (it.getProductId() == null) continue;
            int qty = (it.getQuantity() == null || it.getQuantity() < 1) ? 1 : it.getQuantity();

            Product product = productRepository.findById(it.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + it.getProductId()));

            // if already in cart => sum quantities; else create
            var existing = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
            if (existing.isPresent()) {
                CartItem ci = existing.get();
                ci.setQuantity(ci.getQuantity() + qty);
                cartItemRepository.save(ci);
            } else {
                cartItemRepository.save(
                        CartItem.builder()
                                .cart(cart)
                                .product(product)
                                .quantity(qty)
                                .build()
                );
            }
        }
    }

}
