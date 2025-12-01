package com.example.bazuuyu.controller;

import com.example.bazuuyu.dto.request.ShippingAddressRequest;
import com.example.bazuuyu.dto.response.OrderItemResponse;
import com.example.bazuuyu.dto.response.OrderResponse;
import com.example.bazuuyu.entity.Cart;
import com.example.bazuuyu.entity.Customer;
import com.example.bazuuyu.entity.Order;
import com.example.bazuuyu.mapper.OrderMapper;
import com.example.bazuuyu.security.JwtUtils;
import com.example.bazuuyu.service.CartService;
import com.example.bazuuyu.service.CustomerService;
import com.example.bazuuyu.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final CartService cartService;
    private final OrderService orderService;
    private final CustomerService customerService;
    private final JwtUtils jwtUtils;

    // ----------------------------------------------------
    // SIMPLE CHECKOUT BY CUSTOMER ID (if you need it)
    // ----------------------------------------------------
    @PostMapping("/checkout/{customerId}")
    public ResponseEntity<OrderResponse> placeOrder(@PathVariable Long customerId) {
        Customer customer = customerService.getCustomerById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        Order order = orderService.placeOrder(customer);
        return ResponseEntity.ok(OrderMapper.toResponse(order));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByCustomer(@PathVariable Long customerId) {
        Customer customer = customerService.getCustomerById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        List<OrderResponse> responseList = orderService.getOrdersByCustomer(customer)
                .stream()
                .map(OrderMapper::toResponse)
                .toList();

        return ResponseEntity.ok(responseList);
    }

    // ----------------------------------------------------
    // CHECKOUT BY CART ID (explicit)
    // ----------------------------------------------------
    @PostMapping("/checkout/cart/{cartId}")
    public ResponseEntity<OrderResponse> checkoutCartWithShipping(
            @PathVariable Long cartId,
            @RequestBody @jakarta.validation.Valid ShippingAddressRequest shipping
    ) {
        Order order = orderService.placeOrderByCartId(cartId, shipping);
        return ResponseEntity.ok(OrderMapper.toResponse(order));
    }

    // ----------------------------------------------------
    // SINGLE ORDER BY ID
    // ----------------------------------------------------
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long orderId) {
        return orderService.getOrderById(orderId)
                .map(OrderMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ----------------------------------------------------
    // "MY ORDERS" – requires JWT
    // ----------------------------------------------------
    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>> getMyOrders(HttpServletRequest request) {
        String token = jwtUtils.resolveToken(request); // here you expect JWT to always exist
        log.info("Authorization: {}", request.getHeader("Authorization"));

        String username = jwtUtils.getUsernameFromToken(token);

        Customer customer = customerService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<Order> orders = orderService.findByCustomerIdOrderByOrderDateDesc(customer.getId());

        List<OrderResponse> resp = orders.stream().map(o -> {
            OrderResponse r = new OrderResponse();
            r.setId(o.getId());
            r.setCustomerName(
                    o.getCustomer() != null ? o.getCustomer().getUsername() : null
            );
            r.setOrderDate(o.getOrderDate());
            r.setTotalAmount(o.getTotalAmount());

            if (o.getItems() != null) {
                r.setItems(o.getItems().stream().map(it -> {
                    OrderItemResponse ir = new OrderItemResponse();
                    ir.setId(it.getId());
                    ir.setProductName(
                            it.getProduct() != null ? it.getProduct().getName() : "Item"
                    );
                    ir.setQuantity(it.getQuantity());
                    BigDecimal unit = it.getPrice() == null
                            ? BigDecimal.ZERO
                            : it.getPrice();
                    int qty = it.getQuantity() == null ? 0 : it.getQuantity();
                    ir.setPrice(unit);
                    ir.setTotalPrice(unit.multiply(BigDecimal.valueOf(qty)));
                    return ir;
                }).toList());
            }
            return r;
        }).toList();

        return ResponseEntity.ok(resp);
    }

    // ----------------------------------------------------
    // UTIL: GET GUEST_ID FROM COOKIE
    // ----------------------------------------------------
    private String extractGuestIdFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) return null;

        for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
            if ("GUEST_ID".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(
            HttpServletRequest request,
            @RequestBody ShippingAddressRequest shipping
    ) {
        try {
            // 1) đọc token
            String authHeader = request.getHeader("Authorization");
            String token = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }

            log.info("Checkout called. Authorization header: {}, tokenPresent: {}, cookies: {}",
                    authHeader,
                    token != null,
                    request.getHeader("Cookie"));

            Cart cart;
            String guestId = null;

            if (token != null) {
                // logged-in flow
                String username = jwtUtils.getUsernameFromToken(token);
                log.info("Checkout as logged-in user: {}", username);

                Customer customer = customerService.findByUsername(username)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED, "Customer not found"
                        ));
                cart = cartService.getOrCreateActiveCartForCustomer(customer);
            } else {
                // guest flow
                guestId = extractGuestIdFromCookies(request);
                log.info("Checkout as guest. GUEST_ID = {}", guestId);

                if (guestId == null) {
                    log.warn("Missing GUEST_ID cookie");
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Missing guest identifier (GUEST_ID cookie)"
                    );
                }

                cart = cartService.getOrCreateActiveCartForGuest(guestId);
            }

            if (cart == null) {
                log.warn("Cart is null for token={} guestId={}", token, guestId);
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Cart not found for current user/guest"
                );
            }

            log.info("Found cart id={}, itemsCount={}",
                    cart.getId(),
                    cart.getItems() == null ? null : cart.getItems().size());

            if (cart.getItems() == null || cart.getItems().isEmpty()) {
                log.warn("Attempt to checkout empty cart. cartId={}", cart.getId());
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Cannot checkout an empty cart"
                );
            }

            log.info("Placing order from cartId={}, items={}",
                    cart.getId(),
                    cart.getItems().size());

            Order order = orderService.placeOrderByCartId(cart.getId(), shipping);
            return ResponseEntity.ok(OrderMapper.toResponse(order));

        } catch (Exception e) {
            log.error("Checkout error", e);
            throw e;
        }
    }


}
