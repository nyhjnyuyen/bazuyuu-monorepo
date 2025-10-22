package com.example.bazuuyu.order.notification;

import com.example.bazuuyu.order.events.OrderPlacedEvent;
import com.example.bazuuyu.service.OrderService;
import com.example.bazuuyu.service.EmailService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

@Component
public class OrderPlacedListener {

    private final OrderService orders;
    private final EmailService email;

    public OrderPlacedListener(OrderService orders, EmailService email) {
        this.orders = orders; this.email = email;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void on(OrderPlacedEvent e) {
        var s = orders.getOrderSummary(e.orderId());
        email.sendEmail(
                "orders@yourbrand.com",
                "New order " + s.orderNumber(),
                """
                Customer: %s
                Total: %s
                View: https://admin.yoursite.com/orders/%s
                """.formatted(s.customerEmail(), s.total(), s.orderNumber())
        );
    }
}
