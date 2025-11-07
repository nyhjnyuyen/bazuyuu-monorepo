// src/main/java/com/example/bazuuyu/repository/GuestWishlistItemRepository.java
package com.example.bazuuyu.repository;

import com.example.bazuuyu.entity.GuestWishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuestWishlistItemRepository extends JpaRepository<GuestWishlistItem, Long> {
    List<GuestWishlistItem> findByGuestId(String guestId);
    Optional<GuestWishlistItem> findByGuestIdAndProductId(String guestId, Long productId);
    void deleteByGuestIdAndProductId(String guestId, Long productId);
    void deleteByGuestId(String guestId);
}
