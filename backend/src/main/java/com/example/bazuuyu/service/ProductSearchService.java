package com.example.bazuuyu.service;

import com.example.bazuuyu.dto.response.ProductResponse;
import com.example.bazuuyu.entity.Category;
import com.example.bazuuyu.entity.Product;
import com.example.bazuuyu.entity.ProductImage;
import com.example.bazuuyu.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductSearchService {

    private final ProductRepository productRepository;

    public Page<ProductResponse> search(String keyword, String categoryStr, int page, int size) {

        String kw = (keyword == null) ? "" : keyword.trim();
        Category category = null;

        if (categoryStr != null && !categoryStr.isBlank()) {
            try {
                category = Category.valueOf(categoryStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                // invalid category string -> ignore category filter
                category = null;
            }
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Product> productPage = productRepository.search(kw, category, pageable);

        List<ProductResponse> dtoList = productPage.getContent()
                .stream()
                .map(this::toResponse)
                .toList();

        return new PageImpl<>(dtoList, pageable, productPage.getTotalElements());
    }

    private ProductResponse toResponse(Product p) {
        List<String> urls = p.getProductImages() == null
                ? List.of()
                : p.getProductImages().stream()
                .map(ProductImage::getImageUrl)
                .toList();

        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .imageUrls(urls)
                .quantity(p.getQuantity())
                .isBestSeller(p.isBestSeller())
                .isNewArrival(p.isNewArrival())
                .category(p.getCategory())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
