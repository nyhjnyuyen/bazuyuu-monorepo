package com.example.bazuuyu.controller;

import com.example.bazuuyu.dto.request.WishlistMergeRequest;
import com.example.bazuuyu.dto.response.WishlistItemResponse;
import com.example.bazuuyu.entity.Product;
import com.example.bazuuyu.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    @PostMapping("/merge")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<Void> mergeWishlist(
            @AuthenticationPrincipal(expression = "id") Long customerId,
            @RequestBody @Valid WishlistMergeRequest body
    ) {
        wishlistService.merge(customerId, body.getProductIds());
        return ResponseEntity.ok().build();
    }

    // Optional: nicer, auth-based getter
    @GetMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<List<WishlistItemResponse>> myWishlist(
            @AuthenticationPrincipal(expression = "id") Long customerId
    ) {
        return ResponseEntity.ok(wishlistService.getWishlistItems(customerId));
    }

}