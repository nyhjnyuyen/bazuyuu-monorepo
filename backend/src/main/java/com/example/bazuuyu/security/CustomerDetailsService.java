package com.example.bazuuyu.security;

import com.example.bazuuyu.entity.Customer;
import com.example.bazuuyu.repository.CustomerRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 *  cung cap thong tin nguoi dung (customer) cho qua trinh xac thuc trong Spring Security
 */
@Service
public class CustomerDetailsService implements UserDetailsService {
    private final CustomerRepository customerRepository;

    public CustomerDetailsService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // tai thong tin nguoi dung dua tren username
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Customer customer = customerRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Customer not found"));
        return new CustomerDetails(customer);
    }

}
