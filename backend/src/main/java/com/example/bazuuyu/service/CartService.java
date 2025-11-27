package com.example.bazuuyu.service;

import com.example.bazuuyu.dto.request.CartMergeItem;
import com.example.bazuuyu.dto.request.CreateCartItemRequest;
import com.example.bazuuyu.dto.response.CartResponse;
import com.example.bazuuyu.entity.*;
import com.example.bazuuyu.mapper.CartMapper;
import com.example.bazuuyu.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository; // 🔹 NEW
    private final CustomerRepository customerRepository;

    // ----------------- CRUD CART ITEM -----------------

    public void addCartItem(CreateCartItemRequest request) {
        Cart cart = cartRepository.findById(request.getCartId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Long variantId = request.getVariantId();
        Integer qty = request.getQuantity() == null || request.getQuantity() < 1
                ? 1
                : request.getQuantity();

        ProductVariant variant = null;
        if (variantId != null) {
            variant = productVariantRepository.findById(variantId)
                    .orElseThrow(() -> new RuntimeException("Variant not found"));
            // safety: variant must belong to product
            if (!variant.getProduct().getId().equals(product.getId())) {
                throw new RuntimeException("Variant does not belong to product");
            }
        }

        // 🔹 if variant == null → simple product
        Optional<CartItem> existing;
        if (variant == null) {
            existing = cartItemRepository
                    .findByCartIdAndProductId(cart.getId(), product.getId());
        } else {
            existing = cartItemRepository
                    .findByCartIdAndProductIdAndVariantId(cart.getId(), product.getId(), variant.getId());
        }

        CartItem item;
        if (existing.isPresent()) {
            item = existing.get();
            item.setQuantity(item.getQuantity() + qty);
        } else {
            item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .variant(variant) // null for simple product
                    .quantity(qty)
                    .build();
        }

        cartItemRepository.save(item);
    }

    public List<CartItem> getCartItems(Long cartId) {
        return cartItemRepository.findByCartId(cartId);
    }

    public void updateCartItemQuantity(Long itemId, int quantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        item.setQuantity(quantity);
        cartItemRepository.save(item);
    }

    public void removeCartItem(Long itemId) {
        cartItemRepository.deleteById(itemId);
    }

    // ----------------- ACTIVE CART: CUSTOMER -----------------

    public CartResponse getActiveCart(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Cart cart = getOrCreateActiveCartForCustomer(customer);
        return CartMapper.toResponse(cart);
    }

    public Optional<Cart> getActiveCart(Customer customer) {
        return cartRepository.findByCustomerAndStatus(customer, "ACTIVE");
    }

    private Cart getOrCreateActiveCartEntity(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        return getOrCreateActiveCartForCustomer(customer);
    }

    public Cart getOrCreateActiveCartForCustomer(Customer customer) {
        return cartRepository.findByCustomerAndStatus(customer, "ACTIVE")
                .orElseGet(() -> cartRepository.save(
                        Cart.builder()
                                .customer(customer)
                                .status("ACTIVE")
                                .createdAt(LocalDateTime.now())
                                .build()
                ));
    }

    // ----------------- ACTIVE CART: GUEST -----------------

    public Cart getOrCreateActiveCartForGuest(String guestId) {
        if (guestId == null || guestId.isBlank()) {
            throw new IllegalArgumentException("guestId is required");
        }

        return cartRepository.findByGuestIdAndStatus(guestId, "ACTIVE")
                .orElseGet(() -> cartRepository.save(
                        Cart.builder()
                                .guestId(guestId)
                                .status("ACTIVE")
                                .createdAt(LocalDateTime.now())
                                .build()
                ));
    }

    // ----------------- STATUS + MERGE -----------------

    public void updateCartStatus(Long cartId, String status) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        cart.setStatus(status);
        cartRepository.save(cart);
    }

    @Transactional
    public void merge(Long customerId, List<CartMergeItem> items) {
        if (items == null || items.isEmpty()) return;

        Cart cart = getOrCreateActiveCartEntity(customerId);

        for (CartMergeItem it : items) {
            if (it.getProductId() == null) continue;

            int qty = (it.getQuantity() == null || it.getQuantity() < 1)
                    ? 1 : it.getQuantity();

            Product product = productRepository.findById(it.getProductId())
                    .orElseThrow(() ->
                            new RuntimeException("Product not found: " + it.getProductId()));

            Long variantId = it.getVariantId();
            ProductVariant variant = null;
            if (variantId != null) {
                variant = productVariantRepository.findById(variantId)
                        .orElseThrow(() -> new RuntimeException("Variant not found: " + variantId));
                if (!variant.getProduct().getId().equals(product.getId())) {
                    throw new RuntimeException("Variant does not belong to product");
                }
            }

            Optional<CartItem> existing;
            if (variant == null) {
                existing = cartItemRepository
                        .findByCartIdAndProductId(cart.getId(), product.getId());
            } else {
                existing = cartItemRepository
                        .findByCartIdAndProductIdAndVariantId(cart.getId(), product.getId(), variant.getId());
            }

            if (existing.isPresent()) {
                CartItem ci = existing.get();
                ci.setQuantity(ci.getQuantity() + qty);
                cartItemRepository.save(ci);
            } else {
                cartItemRepository.save(
                        CartItem.builder()
                                .cart(cart)
                                .product(product)
                                .variant(variant)
                                .quantity(qty)
                                .build()
                );
            }
        }
    }
}
