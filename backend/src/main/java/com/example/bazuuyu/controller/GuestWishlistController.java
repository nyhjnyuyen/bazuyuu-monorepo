// src/main/java/com/example/bazuuyu/controller/GuestWishlistController.java
package com.example.bazuuyu.controller;

import com.example.bazuuyu.entity.GuestWishlistItem;
import com.example.bazuuyu.security.GuestIdFilter;
import com.example.bazuuyu.service.GuestWishlistService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/guest/wishlist")
@RequiredArgsConstructor
public class GuestWishlistController {

    private final GuestWishlistService service;

    private String guestId(HttpServletRequest req) {
        return Arrays.stream(req.getCookies() == null ? new Cookie[0] : req.getCookies())
                .filter(c -> GuestIdFilter.COOKIE_NAME.equals(c.getName()))
                .map(Cookie::getValue).findFirst()
                .orElseThrow(() -> new RuntimeException("Missing guest cookie"));
    }

    @GetMapping
    public ResponseEntity<List<GuestWishlistItem>> list(HttpServletRequest req) {
        return ResponseEntity.ok(service.list(guestId(req)));
    }

    @PostMapping("/toggle")
    public ResponseEntity<Void> toggle(HttpServletRequest req, @RequestBody ToggleBody body) {
        service.toggle(guestId(req), body.getProductId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> remove(HttpServletRequest req, @PathVariable Long productId) {
        service.remove(guestId(req), productId);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class ToggleBody { private Long productId; }
}
