package com.example.bazuuyu.service;

import com.example.bazuuyu.dto.request.RegisterCustomerRequest;
import com.example.bazuuyu.entity.Customer;
import com.example.bazuuyu.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * xu ly cac nghiep vu lien quan toi khach hang
 */
@Service
@RequiredArgsConstructor
public class CustomerService {
    private final PasswordEncoder passwordEncoder;
    private final CustomerRepository customerRepository;

    public Customer registerCustomer(RegisterCustomerRequest req) {
        final String email = req.getEmail().trim();
        final String username = req.getUsername().trim();

        if (customerRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already registered");
        }
        if (customerRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("Username already taken");
        }
        Customer customer = Customer.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .phone(req.getPhone())
                .address(req.getAddress())
                .paymentInfo(req.getPaymentInfo())
                .createdAt(LocalDateTime.now())
                .build();

        return customerRepository.save(customer);
    }


    // Get customer by ID
    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }

    // find customer by username
    public Optional<Customer> findByUsername(String username) {
        return customerRepository.findByUsername(username);
    }


    // Get all customers (admin usage)
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // find customer by email
    public Optional<Customer> findByEmail(String email) {
        return customerRepository.findByEmail(email); // add method in repo if missing
    }

    // luu thong tin khach hang
    public Customer save(Customer customer) {
        return customerRepository.save(customer);
    }

}
