package com.example.bazuuyu.repository;

import com.example.bazuuyu.entity.Order;
import com.example.bazuuyu.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * need for saving orders during checkout.
 * retrieving order history.
 */
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomer(Customer customer);
    List<Order> findByCustomerIdOrderByOrderDateDesc(Long customerId);
    Optional<Order> findByOrderCode(String orderCode);
    List<Order> findAllByOrderByOrderDateDesc();

}
