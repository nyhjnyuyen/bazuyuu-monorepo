package com.example.bazuuyu.controller;

import com.example.bazuuyu.dto.request.ProductRequest;
import com.example.bazuuyu.dto.response.ProductResponse;
import com.example.bazuuyu.entity.Category;
import com.example.bazuuyu.entity.Product;
import com.example.bazuuyu.mapper.ProductMapper;
import com.example.bazuuyu.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * xu ly cac API lien quan den san pham
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // tao san pham moi tu thong tin request
    @PostMapping
    //@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(@RequestBody ProductRequest request) {
        Product createdProduct = productService.createProduct(request);
        return ResponseEntity.ok(ProductMapper.toResponse(createdProduct));
    }

    // lay danh sach san pham co phan trang, co the loc theo danh muc
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Category category
    ) {
        return ResponseEntity.ok(productService.listProducts(category, PageRequest.of(page, size)));
    }

    // lay chi tiet san pham theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        Product product = productService.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return ResponseEntity.ok(ProductMapper.toResponse(product));
    }

    // cap nhap thong tin san pham theo ID
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request
    ) {
        Product updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(ProductMapper.toResponse(updated));
    }

    // xoa san pham theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<List<ProductResponse>> getNewArrivals() {
        List<ProductResponse> products = productService.getNewArrivals();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/landing-new-arrivals")
    public ResponseEntity<List<ProductResponse>> getLandingNewArrivals() {
        return ResponseEntity.ok(productService.getTopNewArrivals());
    }


    @GetMapping("/shop")
    public ResponseEntity<List<ProductResponse>> getSortedProducts(
            @RequestParam(defaultValue = "latest") String sortBy) {
        return ResponseEntity.ok(productService.getSortedProducts(sortBy));
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<List<ProductResponse>> getBestSellers() {
        List<ProductResponse> products = productService.getBestSellers();
        return ResponseEntity.ok(products);
    }







}
