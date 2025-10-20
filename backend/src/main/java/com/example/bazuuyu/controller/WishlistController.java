package com.example.bazuuyu.controller;

import com.example.bazuuyu.dto.response.WishlistItemResponse;
import com.example.bazuuyu.entity.Product;
import com.example.bazuuyu.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {
    private final WishlistService wishlistService;

    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@RequestParam Long customerId, @RequestParam Long productId) {
        wishlistService.addProductToWishlist(customerId, productId);
        return ResponseEntity.ok("Product added to wishlist");
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeProduct(@RequestParam Long customerId, @RequestParam Long productId) {
        wishlistService.removeProductFromWishlist(customerId, productId);
        return ResponseEntity.ok("Product removed from wishlist");
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<List<WishlistItemResponse>> getWishlist(@PathVariable Long customerId) {
        return ResponseEntity.ok(wishlistService.getWishlistItems(customerId));
    }

}