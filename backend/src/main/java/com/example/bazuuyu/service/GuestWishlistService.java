// src/main/java/com/example/bazuuyu/service/GuestWishlistService.java
package com.example.bazuuyu.service;

import com.example.bazuuyu.entity.GuestWishlistItem;
import com.example.bazuuyu.entity.Product;
import com.example.bazuuyu.repository.GuestWishlistItemRepository;
import com.example.bazuuyu.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GuestWishlistService {
    private final GuestWishlistItemRepository repo;
    private final ProductRepository products;

    public List<GuestWishlistItem> list(String guestId) {
        return repo.findByGuestId(guestId);
    }

    @Transactional
    public void toggle(String guestId, Long productId) {
        var existing = repo.findByGuestIdAndProductId(guestId, productId);
        if (existing.isPresent()) {
            repo.delete(existing.get());
            return;
        }
        Product p = products.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));
        repo.save(GuestWishlistItem.builder()
                .guestId(guestId).product(p).addedAt(LocalDateTime.now()).build());
    }

    public void remove(String guestId, Long productId) { repo.deleteByGuestIdAndProductId(guestId, productId); }

    public void clear(String guestId) { repo.deleteByGuestId(guestId); }
}
