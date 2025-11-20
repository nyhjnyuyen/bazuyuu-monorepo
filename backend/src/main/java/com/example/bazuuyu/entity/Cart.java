package com.example.bazuuyu.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * entity dai dien cho gio hang cua 1 khach hang.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // tu sinh

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer; // khach hang so huu

    @Column(name = "guest_id")
    private String guestId;

    private LocalDateTime createdAt;
    private String status; // e.g., ACTIVE, SAVED, CHECKED_OUT

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL)
    private List<CartItem> items = new ArrayList<>(); // danh sach cac san pham trong gio hang

}