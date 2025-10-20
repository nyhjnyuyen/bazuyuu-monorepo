package com.example.bazuuyu.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * entity dai dien admin trong he thong.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Admin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Tu dong

    @Column(unique = true, nullable = false)
    private String username; //unique

    @Column(nullable = false)
    private String password; // da ma hoa

    @Enumerated(EnumType.STRING)
    private Role role; // ADMIN or SUPER_ADMIN
}
