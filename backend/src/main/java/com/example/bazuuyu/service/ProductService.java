package com.example.bazuuyu.service;

import com.example.bazuuyu.dto.request.ProductRequest;
import com.example.bazuuyu.dto.response.ProductResponse;
import com.example.bazuuyu.entity.Product;
import com.example.bazuuyu.entity.Category;
import com.example.bazuuyu.entity.ProductImage;
import com.example.bazuuyu.mapper.ProductMapper;
import com.example.bazuuyu.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.Comparator;

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
    public Product createProduct(ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setCreatedAt(LocalDateTime.now());
        product.setCategory(request.getCategory());
        product.setBestSeller(request.isBestSeller());
        product.setNewArrival(request.isNewArrival());


        // Sau khi lưu product lần 1
        Product savedProduct = productRepository.save(product);

        // Thêm ảnh vào list hiện tại
        List<ProductImage> imageList = savedProduct.getProductImages();
        if (imageList == null) {
            imageList = new ArrayList<>();
            savedProduct.setProductImages(imageList);
        }
        for (String url : request.getImageUrls()) {
            ProductImage image = ProductImage.builder()
                    .imageUrl(url)
                    .product(savedProduct)
                    .build();
            imageList.add(image);
        }

        // Lưu lại product với image list đã cập nhật
        return productRepository.save(savedProduct);
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

    // cap nhat thong tin san pham theo ID
    public Product updateProduct(Long id, ProductRequest request) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setPrice(request.getPrice());
        existing.setQuantity(request.getQuantity());
        existing.setCategory(request.getCategory());

        // Xử lý ảnh: clear danh sách cũ và thêm mới
        List<ProductImage> currentImages = existing.getProductImages();
        if (currentImages == null) {
            currentImages = new ArrayList<>();
            existing.setProductImages(currentImages);
        } else {
            currentImages.clear();
        }

        for (String url : request.getImageUrls()) {
            ProductImage image = new ProductImage();
            image.setImageUrl(url);
            image.setProduct(existing);
            currentImages.add(image);
        }

        return productRepository.save(existing);
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


}