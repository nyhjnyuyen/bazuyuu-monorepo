package com.example.bazuuyu.service;

import com.example.bazuuyu.entity.Customer;
import com.example.bazuuyu.entity.PasswordResetToken;
import com.example.bazuuyu.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;

    public PasswordResetToken createResetTokenForCustomer(Customer customer) {
        // Delete old token first
        tokenRepository.findByCustomer(customer).ifPresent(tokenRepository::delete);

        String token = UUID.randomUUID().toString(); // generates a unique token
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(30); // token expires in 30 minutes

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .customer(customer)
                .expiryDate(expiry)
                .build();

        return tokenRepository.save(resetToken);
    }

    public boolean isTokenValid(String token) {
        return tokenRepository.findByToken(token)
                .filter(t -> !t.isExpired())
                .isPresent();
    }

    public Customer getCustomerByToken(String token) {
        return tokenRepository.findByToken(token)
                .filter(t -> !t.isExpired())
                .map(PasswordResetToken::getCustomer)
                .orElse(null);
    }
}
