package com.example.bazuuyu.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * entity dai dien cho anh san pham
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // tu sinh

    private String url;
}
