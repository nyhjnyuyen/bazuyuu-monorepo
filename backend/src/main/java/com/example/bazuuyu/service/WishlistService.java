package com.example.bazuuyu.service;

import com.example.bazuuyu.dto.response.WishlistItemResponse;
import com.example.bazuuyu.entity.*;
import com.example.bazuuyu.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public Wishlist getOrCreateWishlist(Long customerId) {
        return wishlistRepository.findByCustomerId(customerId).orElseGet(() -> {
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            Wishlist wishlist = Wishlist.builder()
                    .customer(customer)
                    .createdAt(LocalDateTime.now())
                    .build();
            return wishlistRepository.save(wishlist);
        });
    }

    @Transactional
    public void addProductToWishlist(Long customerId, Long productId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Wishlist wishlist = getOrCreateWishlist(customerId);
        if (wishlist.getItems() == null) {
            wishlist.setItems(new ArrayList<>());
        }
        boolean alreadyExists = wishlist.getItems().stream()
                .anyMatch(item -> item.getProduct().getId().equals(productId));
        if (!alreadyExists) {
            WishlistItem item = WishlistItem.builder()
                    .wishlist(wishlist) // Make sure this is set
                    .product(product)
                    .addedAt(LocalDateTime.now())
                    .build();

            // Ensure bidirectional consistency
            item.setWishlist(wishlist);
            wishlist.getItems().add(item);

            wishlistRepository.save(wishlist);
        }
    }


    @Transactional
    public void removeProductFromWishlist(Long customerId, Long productId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Wishlist wishlist = wishlistRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Wishlist not found"));

        wishlist.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        wishlistRepository.save(wishlist);
    }

    public List<WishlistItemResponse> getWishlistItems(Long customerId) {
        Wishlist wishlist = wishlistRepository.findByCustomerId(customerId)
                .orElse(null);        if (wishlist == null) return Collections.emptyList();

        return wishlist.getItems().stream()
                .map(item -> new WishlistItemResponse(item.getId(), item.getProduct()))
                .collect(Collectors.toList());
    }

}