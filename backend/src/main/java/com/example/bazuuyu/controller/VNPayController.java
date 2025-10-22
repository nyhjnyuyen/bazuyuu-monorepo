package com.example.bazuuyu.controller;

import com.example.bazuuyu.entity.Order;
import com.example.bazuuyu.security.VNPayConfig;
import com.example.bazuuyu.service.OrderService;
import com.example.bazuuyu.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/vnpay")
@RequiredArgsConstructor
public class VNPayController {

    private final VNPayService vnpay;
    private final OrderService orders;
    private final VNPayConfig cfg;

    // Create a payment URL for an order
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> create(@RequestParam long amountVnd,
                                                      @RequestParam String orderCode,
                                                      HttpServletRequest req) {
        // mark awaiting payment in your order domain (optional but recommended)
        orders.markAwaitingPayment(orderCode, Order.PaymentChannel.VNPAY_DOMESTIC);

        String url = vnpay.createPaymentUrl(amountVnd, orderCode, "Order " + orderCode, VNPayConfig.getIpAddress(req), null);

        return ResponseEntity.ok(Map.of("paymentUrl", url));
    }

    // Browser return (customer lands here after paying)
    @GetMapping("/return")
    public ResponseEntity<String> returnPage(HttpServletRequest request) {
        var result = vnpay.verifyReturn(request.getParameterMap());
        if (!result.signatureValid()) return ResponseEntity.badRequest().body("Invalid signature");

        // success per VNPay code: "00"
        if ("00".equals(result.code())) {
            // you will usually have orderCode encoded in vnp_OrderInfo or vnp_TxnRef mapping
            // Example: use txnRef as your orderCode
            orders.markPaidByVnpay(result.txnRef(), request.getParameter("vnp_TransactionNo"));
            return ResponseEntity.ok("Payment success");
        }
        return ResponseEntity.ok("Payment failed: code=" + result.code());
    }

    // IPN (server-to-server): configure this URL in your VNPay merchant settings
    @PostMapping("/ipn")
    public ResponseEntity<String> ipn(HttpServletRequest request) {
        var result = vnpay.verifyReturn(request.getParameterMap());
        if (!result.signatureValid()) return ResponseEntity.badRequest().body("INVALID_SIGNATURE");

        if ("00".equals(result.code())) {
            orders.markPaidByVnpay(result.txnRef(), request.getParameter("vnp_TransactionNo"));
            return ResponseEntity.ok("OK");
        }
        return ResponseEntity.ok("IGNORED");
    }
}

