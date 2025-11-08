package com.example.bazuuyu.service;

import com.example.bazuuyu.entity.*;
import com.example.bazuuyu.repository.CartRepository;
import com.example.bazuuyu.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.bazuuyu.dto.request.ShippingAddressRequest;
import com.example.bazuuyu.repository.AddressDirectory;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import com.example.bazuuyu.order.events.OrderPlacedEvent;
import com.example.bazuuyu.order.events.PaymentCapturedEvent;


@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemService cartItemService;
    private final CartService cartService;
    private final CartRepository cartRepository;
    private final ApplicationEventPublisher events;

    public record OrderSummary(String orderNumber, String customerEmail, java.math.BigDecimal total){}

    public OrderSummary getOrderSummary(Long orderId) {
        // You can optimize with a custom projection/repository method.
        var o = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        return new OrderSummary(o.getOrderCode(),
                o.getCustomer().getEmail(),
                o.getTotalAmount());
    }
    // Checkout: Convert active cart into an order
    public Order placeOrder(Customer customer) {
        Cart cart = cartService.getActiveCart(customer)
                .orElseThrow(() -> new IllegalStateException("No active cart found"));

        List<CartItem> cartItems = cartItemService.getCartItemsByCart(cart);
        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CartItem ci : cartItems) {
            BigDecimal unitPrice = ci.getProduct().getPrice();
            BigDecimal line = unitPrice.multiply(BigDecimal.valueOf(ci.getQuantity()));
            total = total.add(line);

            OrderItem item = OrderItem.builder()
                    .product(ci.getProduct())
                    .quantity(ci.getQuantity())
                    .price(unitPrice)
                    .build();
            orderItems.add(item);
        }

        Order order = Order.builder()
                .customer(customer)
                .orderDate(LocalDateTime.now())
                .orderCode(genCode())
                .totalAmount(total)
                .status(Order.OrderStatus.CREATED)
                .build();

        // Save order first to generate ID
        order = orderRepository.save(order);

        // Set the order for each item before saving
        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setItems(orderItems);

        // Mark cart as CHECKED_OUT
        cartService.updateCartStatus(cart.getId(), "CHECKED_OUT");
        cartItemService.clearItemsByCart(cart);
        Order saved = orderRepository.save(order);

        events.publishEvent(new OrderPlacedEvent(saved.getId()));

        return saved;
    }
    // OrderService.java (only the changed/added method shown)
    @Transactional
    public Order placeOrderByCartId(Long cartId, ShippingAddressRequest dto) {
        if (dto == null) throw new IllegalArgumentException("shippingAddress is required");

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalStateException("Cart not found"));

        var cartItems = cartItemService.getCartItemsByCart(cart);
        if (cartItems.isEmpty()) throw new IllegalStateException("Cart is empty");

        var total = cartItems.stream()
                .map(ci -> ci.getProduct().getPrice().multiply(java.math.BigDecimal.valueOf(ci.getQuantity())))
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        String phone = normalizeVNPhone(dto.getPhone());

        ShippingAddress addr = ShippingAddress.builder()
                .fullName(dto.getFullName())
                .phone(phone)
                .province(dto.getProvince())
                .district(dto.getDistrict())
                .ward(dto.getWard())
                .addressLine(dto.getAddressLine())
                .note(dto.getNote())
                .country(dto.getCountry() == null ? "VN" : dto.getCountry())
                .build();

        Order order = Order.builder()
                .customer(cart.getCustomer())
                .orderDate(java.time.LocalDateTime.now())
                .orderCode(genCode())
                .totalAmount(total)
                .status(Order.OrderStatus.CREATED)
                .shippingAddress(addr)
                .build();

        order = orderRepository.save(order);

        // add items (init list or set once)
        var orderItems = new java.util.ArrayList<OrderItem>();
        for (CartItem ci : cartItems) {
            orderItems.add(
                    OrderItem.builder()
                            .order(order)
                            .product(ci.getProduct())
                            .quantity(ci.getQuantity())
                            .price(ci.getProduct().getPrice())
                            .build()
            );
        }
        order.setItems(orderItems);

        cartService.updateCartStatus(cart.getId(), "CHECKED_OUT");
        cartItemService.clearItemsByCart(cart);

        Order saved = orderRepository.save(order);

        events.publishEvent(new OrderPlacedEvent(saved.getId()));

        return saved;
    }

    private String normalizeVNPhone(String phone) {
        if (phone == null) return null;
        String p = phone.trim().replaceAll("\\s+", "");
        return p.startsWith("+84") ? "0" + p.substring(3) : p;
    }

    private String genCode() {
        return UUID.randomUUID().toString().replace("-","").substring(0,10).toUpperCase();
    }

    // View all orders for a customer
    public List<Order> getOrdersByCustomer(Customer customer) {
        return orderRepository.findByCustomer(customer);
    }

    // Get a specific order by ID
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Optional<Order> getOrderByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode);
    }

    public List<Order> findByCustomerIdOrderByOrderDateDesc(Long customerId) {
        return orderRepository.findByCustomerIdOrderByOrderDateDesc(customerId);
    }

    //PAYMENT STATES
    @Transactional
    public void markAwaitingPayment(String orderCode, Order.PaymentChannel channel){
        Order o = orderRepository.findByOrderCode(orderCode).orElseThrow(() -> new IllegalStateException("Order not found"));
        if (o.getStatus() == Order.OrderStatus.CREATED){
            o.setPaymentChannel(channel);
            o.setStatus(Order.OrderStatus.AWAITING_PAYMENT);
            orderRepository.save(o);
        }
    }
    @Transactional
    public void markCodPending(String orderCode){
        Order o = orderRepository.findByOrderCode(orderCode).orElseThrow(() -> new IllegalStateException("Order not found"));
        o.setPaymentChannel(Order.PaymentChannel.COD);
        o.setStatus(Order.OrderStatus.COD_PENDING);
        orderRepository.save(o);
    }
    @Transactional
    public void markPaidByVnpay(String orderCode, String vnpTxnNo) {
        Order o = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (o.getStatus() != Order.OrderStatus.PAID) {
            o.setPaymentTxnId(vnpTxnNo);
            o.setStatus(Order.OrderStatus.PAID);
            orderRepository.save(o);
            events.publishEvent(new PaymentCapturedEvent(o.getId()));

        }
    }

    @Transactional
    public void markCodCollected(String orderCode) {
        Order o = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (o.getStatus() == Order.OrderStatus.COD_PENDING) {
            o.setStatus(Order.OrderStatus.PAID);
            orderRepository.save(o);
        }
    }
    public List<Order> findAllOrderByDateDesc() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }
    public void updateStatus(Long orderId, String status) {
        Order o = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        o.setStatus(status);
        orderRepository.save(o);
    }
}
