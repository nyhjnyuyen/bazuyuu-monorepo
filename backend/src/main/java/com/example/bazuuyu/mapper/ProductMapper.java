package com.example.bazuuyu.mapper;

import com.example.bazuuyu.dto.request.ProductRequest;
import com.example.bazuuyu.dto.response.ProductResponse;
import com.example.bazuuyu.dto.response.ProductVariantResponse;
import com.example.bazuuyu.entity.Product;
import com.example.bazuuyu.entity.ProductImage;
import com.example.bazuuyu.entity.ProductVariant;

import java.util.ArrayList;
import java.util.List;

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

        product.setBestSeller(request.isBestSeller());
        product.setNewArrival(request.isNewArrival());

        List<ProductImage> imageEntities = new ArrayList<>();
        if (request.getImageUrls() != null) {
            for (String imageUrl : new ArrayList<>(request.getImageUrls())) {
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
    public static ProductResponse toResponse(Product p) {
        if (p == null) return null;

        List<ProductVariantResponse> variantDtos =
                p.getVariants() == null
                        ? List.of()
                        : p.getVariants().stream()
                        .map(ProductMapper::toVariantResponse)
                        .toList();

        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .category(p.getCategory())
                .price(p.getPrice())
                .quantity(p.getQuantity())
                .isBestSeller(p.isBestSeller())
                .isNewArrival(p.isNewArrival())
                .mainImageUrl(p.getMainImageUrl())
                .imageUrls(p.getImageUrls())
                .storyImageUrls(p.getStoryImageUrls())
                .variants(variantDtos)
                .build();
    }

    private static ProductVariantResponse toVariantResponse(ProductVariant v) {
        if (v == null) return null;
        return ProductVariantResponse.builder()
                .id(v.getId())
                .name(v.getName())
                .sku(v.getSku())
                .price(v.getPrice())
                .stock(v.getStock())
                .isDefault(v.isDefault())
                .imageUrl(v.getImageUrl())
                .build();
    }
}



