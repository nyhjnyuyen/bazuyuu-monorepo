// src/main/java/com/example/bazuuyu/controller/GuestCartController.java
package com.example.bazuuyu.controller;

import com.example.bazuuyu.entity.GuestCartItem;
import com.example.bazuuyu.security.GuestIdFilter;
import com.example.bazuuyu.service.GuestCartService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/guest/cart")
@RequiredArgsConstructor
public class GuestCartController {

    private final GuestCartService service;

    private String guestId(HttpServletRequest req) {
        return Arrays.stream(req.getCookies() == null ? new Cookie[0] : req.getCookies())
                .filter(c -> GuestIdFilter.COOKIE_NAME.equals(c.getName()))
                .map(Cookie::getValue).findFirst()
                .orElseThrow(() -> new RuntimeException("Missing guest cookie"));
    }

    @GetMapping("/items")
    public ResponseEntity<List<GuestCartItem>> items(HttpServletRequest req) {
        return ResponseEntity.ok(service.list(guestId(req)));
    }

    @PostMapping("/items")
    public ResponseEntity<Void> add(HttpServletRequest req, @RequestBody AddBody body) {
        service.add(guestId(req), body.getProductId(), body.getQuantity() == null ? 1 : body.getQuantity());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<Void> setQty(HttpServletRequest req, @PathVariable Long productId, @RequestParam @Min(1) int quantity) {
        service.setQuantity(guestId(req), productId, quantity);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> remove(HttpServletRequest req, @PathVariable Long productId) {
        service.remove(guestId(req), productId);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class AddBody {
        private Long productId;
        private Integer quantity;
    }
}
