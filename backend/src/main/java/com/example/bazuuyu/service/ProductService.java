package com.example.bazuuyu.service;

import com.example.bazuuyu.dto.request.ProductRequest;
import com.example.bazuuyu.dto.response.ProductResponse;
import com.example.bazuuyu.entity.Product;
import com.example.bazuuyu.entity.Category;
import com.example.bazuuyu.entity.ProductImage;
import com.example.bazuuyu.mapper.ProductMapper;
import com.example.bazuuyu.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

/**
 * xu ly cac nghiep vu lien quan den san pham
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    // tao san pham tu doi tuong Product entity
    public Product create(Product product) {
        return productRepository.save(product);
    }

    // tao san pham tu ProductRequest DTO, bao gom anh
    @Transactional
    public Product createProduct(ProductRequest req) {
        Product p = Product.builder()
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .quantity(req.getQuantity())
                .category(req.getCategory())
                .isBestSeller(req.isBestSeller())
                .isNewArrival(req.isNewArrival())
                .build();

        // images
        List<String> urls = Optional.ofNullable(req.getImageUrls()).orElse(List.of());
        int i = 0;
        for (String url : urls) {
            p.addImage(ProductImage.builder()
                    .imageUrl(url)
                    // .isPrimary(i == 0)        // if you added this field
                    // .sortOrder(i)             // if you added this field
                    .build());
            i++;
        }

        return productRepository.save(p); // One save is enough with cascade
    }

    // lay toan bo san pham (danh cho admin)
    public List<Product> findAll() {
        return productRepository.findAll();
    }

    // xoa san pham theo ID
    public void deleteById(Long id) {
        productRepository.deleteById(id);
    }

    // loc san pham theo danh muc va phan trang (cho customer)
    public Page<ProductResponse> listProducts(Category category, Pageable pageable) {
        Page<Product> page = (category != null)
                ? productRepository.findAllByCategory(category, pageable)
                : productRepository.findAll(pageable);
        return page.map(ProductMapper::toResponse);
    }

    //tim san pham theo ID
    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    //for shop page
    public List<ProductResponse> getNewArrivals() {
        List<Product> newArrivals = productRepository.findByIsNewArrivalTrue();
        List<Product> others = productRepository.findAll()
                .stream()
                .filter(p -> !p.isNewArrival())
                .toList();

        List<Product> combined = new ArrayList<>();
        combined.addAll(newArrivals);
        combined.addAll(others);

        return combined.stream().map(ProductMapper::toResponse).toList();
    }

    //for landing page
    public List<ProductResponse> getTopNewArrivals() {
        return productRepository.findByIsNewArrivalTrueOrderByCreatedAtDesc()
                .stream()
                .limit(16)
                .map(ProductMapper::toResponse)
                .toList();
    }

    public List<ProductResponse> getBestSellers() {
        List<Product> bestSellers = productRepository.findByIsBestSellerTrue();
        List<Product> others = productRepository.findAll()
                .stream()
                .filter(p -> !p.isBestSeller())
                .toList();

        List<Product> combined = new ArrayList<>();
        combined.addAll(bestSellers);
        combined.addAll(others);

        return combined.stream().map(ProductMapper::toResponse).toList();
    }

    public List<ProductResponse> getSortedProducts(String sortBy) {
        List<Product> products;

        switch (sortBy) {
            case "priceLowToHigh":
                products = productRepository.findAll(Sort.by(Sort.Direction.ASC, "price"));
                break;
            case "priceHighToLow":
                products = productRepository.findAll(Sort.by(Sort.Direction.DESC, "price"));
                break;
            case "latest":
            default:
                products = productRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
                break;
        }

        return products.stream()
                .map(ProductMapper::toResponse)
                .toList();
    }

    @Transactional
    public Product updateProduct(Long id, ProductRequest req) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

        existing.setName(req.getName());
        existing.setDescription(req.getDescription());
        existing.setPrice(req.getPrice());
        existing.setQuantity(req.getQuantity());
        existing.setCategory(req.getCategory());
        existing.setBestSeller(req.isBestSeller());
        existing.setNewArrival(req.isNewArrival());

        // Replace images
        existing.clearImages();
        List<String> urls = Optional.ofNullable(req.getImageUrls()).orElse(List.of());
        int i = 0;
        for (String url : urls) {
            existing.addImage(ProductImage.builder()
                    .imageUrl(url)
                    // .isPrimary(i == 0)
                    // .sortOrder(i)
                    .build());
            i++;
        }

        return existing; // dirty checking will flush
    }


}