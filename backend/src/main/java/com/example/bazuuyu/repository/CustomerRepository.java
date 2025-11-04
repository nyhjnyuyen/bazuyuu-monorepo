package com.example.bazuuyu.repository;

import com.example.bazuuyu.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * thao tac voi customer table trong database
 */
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    // tim customer by username
    Optional<Customer> findByUsername(String username);

    // tim customer by email
    Optional<Customer> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

}
