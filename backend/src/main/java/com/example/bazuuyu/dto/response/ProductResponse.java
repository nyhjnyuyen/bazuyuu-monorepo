package com.example.bazuuyu.dto.response;

import com.example.bazuuyu.entity.Category;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private List<String> imageUrls;
    private int quantity;
    private boolean isBestSeller;
    private boolean isNewArrival;
    private Category category;
    private LocalDateTime createdAt;
}
