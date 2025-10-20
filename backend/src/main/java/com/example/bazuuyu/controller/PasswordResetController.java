package com.example.bazuuyu.controller;

import com.example.bazuuyu.entity.Customer;
import com.example.bazuuyu.repository.CustomerRepository;
import com.example.bazuuyu.service.EmailService;
import com.example.bazuuyu.service.PasswordResetService;
import com.example.bazuuyu.entity.PasswordResetToken;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;
import java.util.Map;

/**
 * controller xu ly chuc nang dat lai mat khau cho khach hang
 * - gui email chua token dat lai mat khau
 * - cap nhat mat khau moi thong qua token
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/password")
public class PasswordResetController {

    private final CustomerRepository customerRepository;
    private final PasswordResetService passwordResetService;
    @Qualifier("emailServiceImpl")
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;


    // gui email chua lien ket dat lai mat khau den khach hang
    @PostMapping("/send-reset-token")
    public ResponseEntity<?> sendResetToken(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No customer with this email.");
        }

        Customer customer = customerOpt.get();
        PasswordResetToken token = passwordResetService.createResetTokenForCustomer(customer);

        String resetUrl = "http://localhost:3001/reset-password?token=" + token.getToken(); // ← was 3000, use your frontend port
        String emailContent = "Click the link to reset your password:\n\n" + resetUrl;

        emailService.sendEmail(customer.getEmail(), "Reset Your Password", emailContent);

        return ResponseEntity.ok("Password reset email sent.");
    }

    // dat lai mat khau cho khach hang dua tren token hop le
    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        if (!passwordResetService.isTokenValid(token)) {
            return ResponseEntity.badRequest().body("Invalid or expired token.");
        }

        Customer customer = passwordResetService.getCustomerByToken(token);
        if (customer == null) {
            return ResponseEntity.badRequest().body("Customer not found.");
        }

        customer.setPassword(passwordEncoder.encode(newPassword));
        customerRepository.save(customer);

        return ResponseEntity.ok("Password successfully updated.");
    }

}
