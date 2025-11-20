package com.example.bazuuyu.controller;

import com.example.bazuuyu.dto.request.CheckoutRequest;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final CartService cartService;
    private final OrderService orderService;
    private final CustomerService customerService;
    private final JwtUtils jwtUtils;


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
    // OrderController.java  (add this method)
    @PostMapping("/checkout/cart/{cartId}")
    public ResponseEntity<OrderResponse> checkoutCartWithShipping(
            @PathVariable Long cartId,
            @RequestBody @jakarta.validation.Valid ShippingAddressRequest shipping
    ) {
        Order order = orderService.placeOrderByCartId(cartId, shipping);
        return ResponseEntity.ok(OrderMapper.toResponse(order));
    }


    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long orderId) {
        return orderService.getOrderById(orderId)
                .map(OrderMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>> getMyOrders(HttpServletRequest request) {
        String token = jwtUtils.resolveToken(request);
        String username = jwtUtils.getUsernameFromToken(token);

        Customer customer = customerService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Make sure this method name matches your repository/entity field:
        // findByCustomerIdOrderByOrderDateDesc
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
                    );                                  // productName (not name)
                    ir.setQuantity(it.getQuantity());
                    BigDecimal unit = it.getPrice() == null
                            ? java.math.BigDecimal.ZERO
                            : it.getPrice(); // BigDecimal
                    int qty = it.getQuantity() == null ? 0 : it.getQuantity();
                    ir.setPrice(unit);
                    ir.setTotalPrice(unit.multiply(java.math.BigDecimal.valueOf(qty))); //  totalPrice
                    return ir;
                }).toList());
            }
            return r;
        }).toList();

        return ResponseEntity.ok(resp);
    }
    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(
            HttpServletRequest request,
            @RequestBody @jakarta.validation.Valid ShippingAddressRequest shipping
    ) {
        String token = jwtUtils.resolveToken(request);
        Long customerId = null;
        String guestId = (String) request.getAttribute("guestId");

        Cart cart;
        if (token != null) {
            String username = jwtUtils.getUsernameFromToken(token);
            Customer customer = customerService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            cart = cartService.getOrCreateActiveCartForCustomer(customer);
        } else {
            cart = cartService.getOrCreateActiveCartForGuest(guestId);
        }

        Order order = orderService.placeOrderByCartId(cart.getId(), shipping);
        return ResponseEntity.ok(OrderMapper.toResponse(order));
    }


}
