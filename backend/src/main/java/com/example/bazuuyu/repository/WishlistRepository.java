package com.example.bazuuyu.repository;

import com.example.bazuuyu.entity.Customer;
import com.example.bazuuyu.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    Optional<Wishlist> findByCustomerId(Long customerId);
}
