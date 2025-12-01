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
        log.info("=== /api/orders/checkout START ===");
        log.info("ShippingAddressRequest = fullName={}, phone={}, province={}, district={}, ward={}, addressLine={}, note={}, country={}",
                shipping.getFullName(),
                shipping.getPhone(),
                shipping.getProvince(),
                shipping.getDistrict(),
                shipping.getWard(),
                shipping.getAddressLine(),
                shipping.getNote(),
                shipping.getCountry()
        );

        Cart cart;
        try {
            // resolve cart from JWT or GUEST_ID cookie
            cart = cartService.getOrCreateActiveCartForRequest(request, jwtUtils, customerService);
        } catch (RuntimeException ex) {
            log.warn("Checkout – cannot resolve cart: {}", ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }

        log.info("Using cart id={} for checkout", cart.getId());

        try {
            // Let OrderService check for empty cart / cart not found, etc.
            Order order = orderService.placeOrderByCartId(cart.getId(), shipping);
            log.info("Order placed successfully. orderId={}", order.getId());
            log.info("=== /api/orders/checkout END OK ===");
            return ResponseEntity.ok(OrderMapper.toResponse(order));
        } catch (IllegalStateException ex) {
            // "Cart not found", "Cart is empty", ...
            log.warn("Business error during checkout: {}", ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        } catch (Exception ex) {
            log.error("Unexpected error during checkout", ex);
            // you might want 500 here, but keep 400 if your global policy says so
            throw ex;
        }
    }

}
