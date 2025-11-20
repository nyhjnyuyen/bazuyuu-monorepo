package com.example.bazuuyu.repository;

import com.example.bazuuyu.entity.Cart;
import com.example.bazuuyu.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * needed to save a new cart.
 * fetch carts by customer.
 * update cart status.
 */
public interface CartRepository extends JpaRepository<Cart, Long> {
    List<Cart> findByCustomer(Customer customer);
    Optional<Cart> findByCustomerAndStatus(Customer customer, String status); // e.g., ACTIVE cart
    Optional<Cart> findByGuestIdAndStatus(String guestId, String status);

}
