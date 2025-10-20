package com.example.bazuuyu.mapper;

import com.example.bazuuyu.dto.request.ProductRequest;
import com.example.bazuuyu.dto.response.ProductResponse;
import com.example.bazuuyu.entity.Product;
import com.example.bazuuyu.entity.ProductImage;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * chuyen doi giua product entity and cac dto lien quan
 */
public class ProductMapper {

    // chuyen doi tu ProductRequest sang Product entity.
    public static Product toEntity(ProductRequest request) {
        Product product = new Product();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setCategory(request.getCategory());

        // ✅ Tạo mutable list mới
        List<ProductImage> imageEntities = new ArrayList<>();
        if (request.getImageUrls() != null) {
            for (String imageUrl : new ArrayList<>(request.getImageUrls())) { // defensive copy
                ProductImage image = new ProductImage();
                image.setImageUrl(imageUrl);
                image.setProduct(product);
                imageEntities.add(image);
            }
        }
        product.setProductImages(imageEntities);

        return product;
    }




    // chuyen doi tu product entity sang ProductResponse DTO
    public static ProductResponse toResponse(Product product) {
        List<String> imageUrls = product.getProductImages().stream()
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toList());


        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .imageUrls(imageUrls)
                .build();
    }

}
