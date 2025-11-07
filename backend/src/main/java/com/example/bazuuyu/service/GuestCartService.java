// src/main/java/com/example/bazuuyu/service/GuestCartService.java
package com.example.bazuuyu.service;

import com.example.bazuuyu.entity.GuestCartItem;
import com.example.bazuuyu.entity.Product;
import com.example.bazuuyu.repository.GuestCartItemRepository;
import com.example.bazuuyu.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GuestCartService {
    private final GuestCartItemRepository repo;
    private final ProductRepository products;

    public List<GuestCartItem> list(String guestId) {
        return repo.findByGuestId(guestId);
    }

    @Transactional
    public void add(String guestId, Long productId, int qty) {
        int q = Math.max(1, qty);
        var existing = repo.findByGuestIdAndProductId(guestId, productId);
        if (existing.isPresent()) {
            var it = existing.get();
            it.setQuantity(it.getQuantity() + q);
            repo.save(it);
            return;
        }
        Product p = products.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));
        repo.save(GuestCartItem.builder()
                .guestId(guestId).product(p).quantity(q).addedAt(LocalDateTime.now()).build());
    }

    @Transactional
    public void setQuantity(String guestId, Long productId, int qty) {
        var it = repo.findByGuestIdAndProductId(guestId, productId)
                .orElseThrow(() -> new RuntimeException("Guest cart item not found"));
        it.setQuantity(Math.max(1, qty));
        repo.save(it);
    }

    public void remove(String guestId, Long productId) { repo.deleteByGuestIdAndProductId(guestId, productId); }

    public void clear(String guestId) { repo.deleteByGuestId(guestId); }
}
