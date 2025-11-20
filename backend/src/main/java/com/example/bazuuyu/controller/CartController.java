package com.example.bazuuyu.controller;

import com.example.bazuuyu.dto.request.CartMergeRequest;
import com.example.bazuuyu.dto.request.CreateCartItemRequest;
import com.example.bazuuyu.dto.response.CartResponse;
import com.example.bazuuyu.entity.CartItem;
import com.example.bazuuyu.service.CartService;
import com.example.bazuuyu.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * xu ly cac API lien quan den cart
 */
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final OrderService orderService;


    // them san pham vao cart
    @PostMapping("/items")
    public ResponseEntity<Void> addItem(
            @RequestBody CreateCartItemRequest request,
            @AuthenticationPrincipal(expression = "id") Long customerId
    ) {
        // ✅ Get the active cart automatically
        Long cartId = cartService.getActiveCart(customerId).getId();
        request.setCartId(cartId);

        cartService.addCartItem(request);
        return ResponseEntity.ok().build();
    }


    // lay danh sach san pham trong gio hang theo ID cart
    @GetMapping("/items")
    public ResponseEntity<List<CartItem>> getItems(@AuthenticationPrincipal(expression = "id") Long customerId) {
        Long cartId = cartService.getActiveCart(customerId).getId();
        return ResponseEntity.ok(cartService.getCartItems(cartId));
    }


    // cap nhat so luong cua mot san pham trong cart
    @PutMapping("/items/{itemId}")
    public ResponseEntity<Void> updateQuantity(
            @PathVariable Long itemId,
            @RequestParam int quantity
    ) {
        cartService.updateCartItemQuantity(itemId, quantity);
        return ResponseEntity.ok().build();
    }

    // xoa 1 item khoi cart
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        cartService.removeCartItem(itemId);
        return ResponseEntity.noContent().build();
    }

    // lay go hang dang hoat dong cua khach hang
    @GetMapping("/customer")
    public ResponseEntity<CartResponse> getActiveCart(@AuthenticationPrincipal(expression = "id") Long customerId) {
        return ResponseEntity.ok(cartService.getActiveCart(customerId));
    }

    // tien hanh thanh toan cho gio hang
    @PostMapping("/checkout/{cartId}")
    public ResponseEntity<Map<String, Object>> checkout(
            @PathVariable Long cartId,
            @Valid @RequestBody CheckoutRequest body
    ) {
        var order = orderService.placeOrderByCartId(cartId, body.getShippingAddress());
        return ResponseEntity.ok(Map.of(
                "orderCode", order.getOrderCode(),
                "totalAmount", order.getTotalAmount()
        ));
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

}
