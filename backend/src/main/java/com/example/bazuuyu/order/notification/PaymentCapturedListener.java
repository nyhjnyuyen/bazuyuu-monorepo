package com.example.bazuuyu.order.notification;

import com.example.bazuuyu.order.events.PaymentCapturedEvent;
import com.example.bazuuyu.service.OrderService;
import com.example.bazuuyu.service.EmailService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

@Component
public class PaymentCapturedListener {

    private final OrderService orders;
    private final EmailService email;

    public PaymentCapturedListener(OrderService orders, EmailService email) {
        this.orders = orders; this.email = email;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void on(PaymentCapturedEvent e) {
        var s = orders.getOrderSummary(e.orderId());
        email.sendEmail("finance@yourbrand.com",
                "Payment captured for order " + s.orderNumber(),
                "Total: " + s.total());
    }
}

