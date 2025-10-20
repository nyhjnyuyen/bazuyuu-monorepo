package com.example.bazuuyu.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * entity dai dien cho ma token de dat lai mat khau
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token; // unique token

    @OneToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    private Customer customer; // kh lien  ket voi token

    @Column(nullable = false)
    private LocalDateTime expiryDate; // thoi gian token het han

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate); // check if token is expired
    }
}
