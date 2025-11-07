// src/main/java/com/example/bazuuyu/repository/GuestCartItemRepository.java
package com.example.bazuuyu.repository;

import com.example.bazuuyu.entity.GuestCartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuestCartItemRepository extends JpaRepository<GuestCartItem, Long> {
    List<GuestCartItem> findByGuestId(String guestId);
    Optional<GuestCartItem> findByGuestIdAndProductId(String guestId, Long productId);
    void deleteByGuestIdAndProductId(String guestId, Long productId);
    void deleteByGuestId(String guestId);
}
