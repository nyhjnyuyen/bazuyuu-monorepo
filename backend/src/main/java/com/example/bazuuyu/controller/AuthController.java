package com.example.bazuuyu.controller;

import com.example.bazuuyu.dto.request.LoginRequest;
import com.example.bazuuyu.dto.request.RegisterCustomerRequest;
import com.example.bazuuyu.dto.request.TokenRequest;
import com.example.bazuuyu.dto.response.LoginResponse;
import com.example.bazuuyu.entity.Admin;
import com.example.bazuuyu.entity.Customer;
import com.example.bazuuyu.security.JwtUtils;
import com.example.bazuuyu.service.AdminService;
import com.example.bazuuyu.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AdminService adminService;
    private final CustomerService customerService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/admin/login")
    public ResponseEntity<?> loginAdmin(@RequestBody LoginRequest request) {
        Optional<Admin> optionalAdmin = adminService.findByUsername(request.getUsername());
        if (optionalAdmin.isEmpty() || !passwordEncoder.matches(request.getPassword(), optionalAdmin.get().getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        Admin admin = optionalAdmin.get();
        String accessToken = jwtUtils.generateAccessToken(admin.getId(), admin.getUsername(), admin.getRole().name());
        String refreshToken = jwtUtils.generateRefreshToken(admin.getUsername());

        return ResponseEntity.ok(new LoginResponse(accessToken, refreshToken));
    }

    @PostMapping("/customer/login")
    public ResponseEntity<?> loginCustomer(@RequestBody LoginRequest request) {
        Optional<Customer> optionalCustomer = customerService.findByUsername(request.getUsername());
        if (optionalCustomer.isEmpty() || !passwordEncoder.matches(request.getPassword(), optionalCustomer.get().getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        Customer customer = optionalCustomer.get();
        String accessToken = jwtUtils.generateAccessToken(customer.getId(), customer.getUsername(), "CUSTOMER");
        String refreshToken = jwtUtils.generateRefreshToken(customer.getUsername());

        return ResponseEntity.ok(new LoginResponse(accessToken, refreshToken));
    }

    @PostMapping("/customer/register")
    public ResponseEntity<String> registerCustomer(
            @Valid @RequestBody RegisterCustomerRequest request
    ) {
        customerService.registerCustomer(request);
        return ResponseEntity.ok("Customer registered successfully");
    }


    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRequest request) {
        if (!jwtUtils.validateToken(request.getRefreshToken())) {
            return ResponseEntity.status(403).body("Invalid refresh token");
        }

        String username = jwtUtils.getUsernameFromToken(request.getRefreshToken());
        String newAccessToken = jwtUtils.generateAccessToken(null, username, "CUSTOMER");

        return ResponseEntity.ok(new LoginResponse(newAccessToken, request.getRefreshToken()));
    }
}
