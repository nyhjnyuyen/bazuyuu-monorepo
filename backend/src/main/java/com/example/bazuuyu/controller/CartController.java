package com.example.bazuuyu.controller;

import com.example.bazuuyu.dto.request.CartMergeRequest;
import com.example.bazuuyu.dto.request.CreateCartItemRequest;
import com.example.bazuuyu.dto.request.GuestCartItem;
import com.example.bazuuyu.dto.response.CartResponse;
import com.example.bazuuyu.entity.Cart;
import com.example.bazuuyu.entity.CartItem;
import com.example.bazuuyu.security.JwtUtils;
import com.example.bazuuyu.service.CartItemService;
import com.example.bazuuyu.service.CartService;
import com.example.bazuuyu.service.CustomerService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final JwtUtils jwtUtils;
    private final CustomerService customerService;
    private final CartItemService cartItemService;

    // ----------------------------------------------------
    // ADD ITEM TO CART (guest or logged-in)
    // ----------------------------------------------------
    @PostMapping("/items")
    public ResponseEntity<Void> addToCart(
            HttpServletRequest request,
            @RequestBody @Valid CreateCartItemRequest body
    ) {
        // resolve current cart (by JWT or GUEST_ID cookie)
        Cart cart = cartService.getOrCreateActiveCartForRequest(request, jwtUtils, customerService);

        // attach cartId for service
        body.setCartId(cart.getId());

        cartService.addCartItem(body);
        return ResponseEntity.ok().build();
    }

    // ----------------------------------------------------
    // GET CURRENT CART ITEMS (guest or logged-in)
    // ----------------------------------------------------
    @GetMapping("/items/current")
    public ResponseEntity<List<CartItem>> getCurrentCartItems(HttpServletRequest request) {
        Cart cart = cartService.getOrCreateActiveCartForRequest(request, jwtUtils, customerService);
        return ResponseEntity.ok(cartService.getCartItems(cart.getId()));
    }

    // ---------------- OLD CUSTOMER-SPECIFIC ENDPOINTS (optional) ----------------

    // keep this if you still want "customer-only" cart via principal id
    @GetMapping("/items")
    public ResponseEntity<List<CartItem>> getItems(
            @AuthenticationPrincipal(expression = "id") Long customerId
    ) {
        Long cartId = cartService.getActiveCart(customerId).getId();
        return ResponseEntity.ok(cartService.getCartItems(cartId));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<Void> updateQuantity(
            @PathVariable Long itemId,
            @RequestParam int quantity
    ) {
        cartService.updateCartItemQuantity(itemId, quantity);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        cartService.removeCartItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/customer")
    public ResponseEntity<CartResponse> getActiveCart(
            @AuthenticationPrincipal(expression = "id") Long customerId
    ) {
        return ResponseEntity.ok(cartService.getActiveCart(customerId));
    }

    @PostMapping("/merge")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<Void> mergeCart(
            @AuthenticationPrincipal(expression = "id") Long customerId,
            @RequestBody @Valid CartMergeRequest body
    ) {
        cartService.merge(customerId, body.getItems());
        return ResponseEntity.ok().build();
    }
    // CartController.java
    @PostMapping("/guest/load")
    public ResponseEntity<Void> loadGuestCart(
            HttpServletRequest request,
            @RequestBody List<GuestCartItem> items
    ) {
        // resolve (or create) guest cart using GUEST_ID cookie
        Cart cart = cartService.getOrCreateActiveCartForRequest(request, jwtUtils, customerService);

        // clear old items (optional but usually what we want)
        cartItemService.clearItemsByCart(cart);

        if (items != null) {
            for (GuestCartItem gi : items) {
                if (gi.getProductId() == null || gi.getQuantity() == null || gi.getQuantity() <= 0) continue;

                CreateCartItemRequest req = new CreateCartItemRequest();
                req.setCartId(cart.getId());
                req.setProductId(gi.getProductId());
                req.setVariantId(gi.getVariantId());
                req.setQuantity(gi.getQuantity());
                cartService.addCartItem(req);
            }
        }

        return ResponseEntity.ok().build();
    }

}
